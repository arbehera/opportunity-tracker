import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

function toArray(val: any): string[] | undefined {
  if (!val) return undefined;
  return Array.isArray(val) ? val : [val];
}

function buildWhere(filters: any): Prisma.OpportunityWhereInput {
  const where: Prisma.OpportunityWhereInput = { isActive: true };

  const customerIds = toArray(filters.customerIds);
  if (customerIds?.length) where.customerId = { in: customerIds };

  const buIds = toArray(filters.businessUnitIds);
  if (buIds?.length) where.businessUnitId = { in: buIds };

  const catIds = toArray(filters.productCategoryIds);
  if (catIds?.length) where.productCategoryId = { in: catIds };

  const stageIds = toArray(filters.dealStageIds);
  if (stageIds?.length) where.dealStageId = { in: stageIds };

  const confIds = toArray(filters.confidenceLevelIds);
  if (confIds?.length) where.confidenceLevelId = { in: confIds };

  const salesIds = toArray(filters.salesIds);
  if (salesIds?.length) where.pinSalesId = { in: salesIds };

  if (filters.fromDate || filters.toDate) {
    where.estimatedClosureDate = {};
    if (filters.fromDate) (where.estimatedClosureDate as any).gte = new Date(filters.fromDate);
    if (filters.toDate) (where.estimatedClosureDate as any).lte = new Date(filters.toDate);
  }

  return where;
}

export const analyticsService = {
  async getDashboardSummary(filters: any) {
    const where = buildWhere(filters);

    const [all, secured, highConf] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        include: { dealStage: true, confidenceLevel: true },
      }),
      prisma.opportunity.aggregate({
        where: { ...where, dealStage: { code: 'SECURED' } },
        _sum: { tcvUsdMillion: true },
      }),
      prisma.opportunity.aggregate({
        where: { ...where, confidenceLevel: { name: 'High' } },
        _sum: { tcvUsdMillion: true },
      }),
    ]);

    const now = new Date();
    const qEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);

    const totalOpportunities = all.length;
    const totalPipelineTcv = all
      .filter((o) => !['SECURED', 'O(H)', 'O(L)'].includes((o.dealStage as any).code))
      .reduce((s, o) => s + Number(o.tcvUsdMillion), 0);
    const securedTcv = Number(secured._sum.tcvUsdMillion || 0);
    const highConfidenceTcv = Number(highConf._sum.tcvUsdMillion || 0);
    const closingThisQuarter = all.filter(
      (o) => o.estimatedClosureDate && o.estimatedClosureDate <= qEnd
    ).length;

    const wonCount = all.filter((o) => (o.dealStage as any).code === 'SECURED').length;
    const lostCount = all.filter((o) => (o.dealStage as any).code === 'O(L)').length;
    const winRate = wonCount + lostCount > 0 ? (wonCount / (wonCount + lostCount)) * 100 : 0;

    return { totalOpportunities, totalPipelineTcv, securedTcv, highConfidenceTcv, closingThisQuarter, winRate };
  },

  async getCategoryAnalytics(filters: any) {
    const where = buildWhere(filters);
    const groups = await prisma.opportunity.groupBy({
      by: ['productCategoryId'],
      where,
      _sum: { tcvUsdMillion: true },
      _count: { id: true },
    });

    const categories = await prisma.productCategory.findMany();
    const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
    const total = groups.reduce((s, g) => s + Number(g._sum.tcvUsdMillion || 0), 0);

    return groups
      .map((g) => ({
        id: g.productCategoryId,
        name: catMap[g.productCategoryId] || g.productCategoryId,
        tcvUsdMillion: Number(g._sum.tcvUsdMillion || 0),
        count: g._count.id,
        percentage: total > 0 ? (Number(g._sum.tcvUsdMillion || 0) / total) * 100 : 0,
      }))
      .sort((a, b) => b.tcvUsdMillion - a.tcvUsdMillion);
  },

  async getSubcategoryAnalytics(filters: any) {
    const where = buildWhere(filters);
    const groups = await prisma.opportunity.groupBy({
      by: ['productSubcategoryId'],
      where,
      _sum: { tcvUsdMillion: true },
      _count: { id: true },
    });

    const subcats = await prisma.productSubcategory.findMany({ include: { category: true } });
    const subcatMap = Object.fromEntries(subcats.map((s) => [s.id, { name: s.name, category: s.category.name }]));
    const total = groups.reduce((s, g) => s + Number(g._sum.tcvUsdMillion || 0), 0);

    return groups
      .map((g) => ({
        id: g.productSubcategoryId,
        name: subcatMap[g.productSubcategoryId]?.name || g.productSubcategoryId,
        category: subcatMap[g.productSubcategoryId]?.category || '',
        tcvUsdMillion: Number(g._sum.tcvUsdMillion || 0),
        count: g._count.id,
        percentage: total > 0 ? (Number(g._sum.tcvUsdMillion || 0) / total) * 100 : 0,
      }))
      .sort((a, b) => b.tcvUsdMillion - a.tcvUsdMillion);
  },

  async getSubcategoryByBUAnalytics(filters: any) {
    const where = buildWhere(filters);
    const groups = await prisma.opportunity.groupBy({
      by: ['productSubcategoryId', 'businessUnitId'],
      where,
      _sum: { tcvUsdMillion: true },
    });

    const [subcats, bus] = await Promise.all([
      prisma.productSubcategory.findMany(),
      prisma.businessUnit.findMany(),
    ]);
    const subcatMap = Object.fromEntries(subcats.map((s) => [s.id, s.name]));
    const buMap = Object.fromEntries(bus.map((b) => [b.id, b.name]));
    const buNames = bus.map((b) => b.name);

    const pivot: Record<string, any> = {};
    for (const g of groups) {
      const subcatName = subcatMap[g.productSubcategoryId] || g.productSubcategoryId;
      const buName = buMap[g.businessUnitId] || g.businessUnitId;
      if (!pivot[subcatName]) pivot[subcatName] = { rowLabel: subcatName };
      pivot[subcatName][buName] = Number(g._sum.tcvUsdMillion || 0);
    }

    const rows = Object.values(pivot).map((row) => {
      const total = buNames.reduce((s, bu) => s + (row[bu] || 0), 0);
      return { ...row, Total: total };
    });

    return { columns: [...buNames, 'Total'], rows };
  },

  async getConfidenceAnalytics(filters: any) {
    const where = buildWhere(filters);
    const groups = await prisma.opportunity.groupBy({
      by: ['confidenceLevelId'],
      where,
      _sum: { tcvUsdMillion: true },
      _count: { id: true },
    });

    const levels = await prisma.confidenceLevel.findMany({ orderBy: { sortOrder: 'asc' } });
    const levelMap = Object.fromEntries(levels.map((l) => [l.id, l.name]));
    const total = groups.reduce((s, g) => s + Number(g._sum.tcvUsdMillion || 0), 0);

    return groups.map((g) => ({
      id: g.confidenceLevelId,
      name: levelMap[g.confidenceLevelId] || g.confidenceLevelId,
      tcvUsdMillion: Number(g._sum.tcvUsdMillion || 0),
      count: g._count.id,
      percentage: total > 0 ? (Number(g._sum.tcvUsdMillion || 0) / total) * 100 : 0,
    }));
  },

  async getBUAnalytics(filters: any) {
    const where = buildWhere(filters);
    const groups = await prisma.opportunity.groupBy({
      by: ['businessUnitId'],
      where,
      _sum: { tcvUsdMillion: true },
      _count: { id: true },
    });

    const bus = await prisma.businessUnit.findMany();
    const buMap = Object.fromEntries(bus.map((b) => [b.id, b.name]));
    const total = groups.reduce((s, g) => s + Number(g._sum.tcvUsdMillion || 0), 0);

    return groups
      .map((g) => ({
        id: g.businessUnitId,
        name: buMap[g.businessUnitId] || g.businessUnitId,
        tcvUsdMillion: Number(g._sum.tcvUsdMillion || 0),
        count: g._count.id,
        percentage: total > 0 ? (Number(g._sum.tcvUsdMillion || 0) / total) * 100 : 0,
      }))
      .sort((a, b) => b.tcvUsdMillion - a.tcvUsdMillion);
  },

  async getStageAnalytics(filters: any) {
    const where = buildWhere(filters);
    const groups = await prisma.opportunity.groupBy({
      by: ['dealStageId'],
      where,
      _sum: { tcvUsdMillion: true },
      _count: { id: true },
    });

    const stages = await prisma.dealStage.findMany({ orderBy: { sortOrder: 'asc' } });
    const stageMap = Object.fromEntries(stages.map((s) => [s.id, s]));
    const total = groups.reduce((s, g) => s + Number(g._sum.tcvUsdMillion || 0), 0);

    return groups.map((g) => {
      const stage = stageMap[g.dealStageId];
      return {
        id: g.dealStageId,
        code: stage?.code || g.dealStageId,
        classification: stage?.classification || '',
        status: stage?.status || '',
        tcvUsdMillion: Number(g._sum.tcvUsdMillion || 0),
        count: g._count.id,
        percentage: total > 0 ? (Number(g._sum.tcvUsdMillion || 0) / total) * 100 : 0,
      };
    });
  },

  async getCustomerAnalytics(filters: any) {
    const where = buildWhere(filters);
    const groups = await prisma.opportunity.groupBy({
      by: ['customerId'],
      where,
      _sum: { tcvUsdMillion: true },
      _count: { id: true },
    });

    const customers = await prisma.customer.findMany();
    const custMap = Object.fromEntries(customers.map((c) => [c.id, c]));
    const total = groups.reduce((s, g) => s + Number(g._sum.tcvUsdMillion || 0), 0);

    return groups
      .map((g) => ({
        id: g.customerId,
        name: custMap[g.customerId]?.name || g.customerId,
        segment: custMap[g.customerId]?.segment || '',
        tcvUsdMillion: Number(g._sum.tcvUsdMillion || 0),
        count: g._count.id,
        percentage: total > 0 ? (Number(g._sum.tcvUsdMillion || 0) / total) * 100 : 0,
      }))
      .sort((a, b) => b.tcvUsdMillion - a.tcvUsdMillion);
  },

  async getCustomerCategoryAnalytics(filters: any) {
    const where = buildWhere(filters);
    const groups = await prisma.opportunity.groupBy({
      by: ['customerId', 'productCategoryId'],
      where,
      _sum: { tcvUsdMillion: true },
    });

    const [customers, categories] = await Promise.all([
      prisma.customer.findMany(),
      prisma.productCategory.findMany(),
    ]);
    const custMap = Object.fromEntries(customers.map((c) => [c.id, c.name]));
    const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
    const catNames = categories.map((c) => c.name);

    const pivot: Record<string, any> = {};
    for (const g of groups) {
      const custName = custMap[g.customerId] || g.customerId;
      const catName = catMap[g.productCategoryId] || g.productCategoryId;
      if (!pivot[custName]) pivot[custName] = { rowLabel: custName };
      pivot[custName][catName] = Number(g._sum.tcvUsdMillion || 0);
    }

    const rows = Object.values(pivot).map((row) => {
      const total = catNames.reduce((s, cat) => s + (row[cat] || 0), 0);
      return { ...row, Total: total };
    });

    return { columns: [...catNames, 'Total'], rows };
  },

  async getTeamAnalytics(filters: any) {
    const where = buildWhere(filters);
    const groups = await prisma.opportunity.groupBy({
      by: ['pinSalesId'],
      where,
      _sum: { tcvUsdMillion: true },
      _count: { id: true },
    });

    const users = await prisma.user.findMany({ where: { role: 'SALES' } });
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
    const total = groups.reduce((s, g) => s + Number(g._sum.tcvUsdMillion || 0), 0);

    return groups
      .map((g) => ({
        id: g.pinSalesId,
        name: userMap[g.pinSalesId]?.fullName || g.pinSalesId,
        businessUnit: userMap[g.pinSalesId]?.businessUnit || '',
        tcvUsdMillion: Number(g._sum.tcvUsdMillion || 0),
        count: g._count.id,
        percentage: total > 0 ? (Number(g._sum.tcvUsdMillion || 0) / total) * 100 : 0,
      }))
      .sort((a, b) => b.tcvUsdMillion - a.tcvUsdMillion);
  },

  async getCountAnalytics(filters: any) {
    const where = buildWhere(filters);
    const [byBU, byCategory, byStage] = await Promise.all([
      prisma.opportunity.groupBy({ by: ['businessUnitId'], where, _count: { id: true } }),
      prisma.opportunity.groupBy({ by: ['productCategoryId'], where, _count: { id: true } }),
      prisma.opportunity.groupBy({ by: ['dealStageId'], where, _count: { id: true } }),
    ]);

    const [bus, categories, stages] = await Promise.all([
      prisma.businessUnit.findMany(),
      prisma.productCategory.findMany(),
      prisma.dealStage.findMany({ orderBy: { sortOrder: 'asc' } }),
    ]);

    return {
      byBU: byBU.map((g) => ({
        name: bus.find((b) => b.id === g.businessUnitId)?.name || g.businessUnitId,
        count: g._count.id,
      })),
      byCategory: byCategory.map((g) => ({
        name: categories.find((c) => c.id === g.productCategoryId)?.name || g.productCategoryId,
        count: g._count.id,
      })),
      byStage: byStage.map((g) => ({
        name: stages.find((s) => s.id === g.dealStageId)?.code || g.dealStageId,
        count: g._count.id,
      })),
    };
  },

  async getDashboardCharts(filters: any) {
    const [buData, categoryData, stageData] = await Promise.all([
      analyticsService.getBUAnalytics(filters),
      analyticsService.getCategoryAnalytics(filters),
      analyticsService.getStageAnalytics(filters),
    ]);
    return { buData, categoryData, stageData };
  },
};
