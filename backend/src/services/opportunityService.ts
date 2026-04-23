import { PrismaClient, Prisma } from '@prisma/client';
import ExcelJS from 'exceljs';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';

const prisma = new PrismaClient();

const opportunityInclude: Prisma.OpportunityInclude = {
  customer: true,
  businessUnit: true,
  productCategory: true,
  productSubcategory: true,
  businessCategory: true,
  pinSales: { select: { id: true, fullName: true, email: true, role: true, businessUnit: true, isActive: true, createdAt: true } },
  pinPresales: { select: { id: true, fullName: true, email: true, role: true, businessUnit: true, isActive: true, createdAt: true } },
  dealStage: true,
  confidenceLevel: true,
  createdBy: { select: { id: true, fullName: true, email: true, role: true, businessUnit: true, isActive: true, createdAt: true } },
  updatedBy: { select: { id: true, fullName: true, email: true, role: true, businessUnit: true, isActive: true, createdAt: true } },
};

function toArray(val: any): string[] | undefined {
  if (!val) return undefined;
  return Array.isArray(val) ? val : [val];
}

function buildWhere(query: any): Prisma.OpportunityWhereInput {
  const where: Prisma.OpportunityWhereInput = { isActive: true };

  const customerIds = toArray(query.customerIds);
  if (customerIds?.length) where.customerId = { in: customerIds };

  const buIds = toArray(query.businessUnitIds);
  if (buIds?.length) where.businessUnitId = { in: buIds };

  const catIds = toArray(query.productCategoryIds);
  if (catIds?.length) where.productCategoryId = { in: catIds };

  const subcatIds = toArray(query.productSubcategoryIds);
  if (subcatIds?.length) where.productSubcategoryId = { in: subcatIds };

  const bizCatIds = toArray(query.businessCategoryIds);
  if (bizCatIds?.length) where.businessCategoryId = { in: bizCatIds };

  const stageIds = toArray(query.dealStageIds);
  if (stageIds?.length) where.dealStageId = { in: stageIds };

  const confidenceIds = toArray(query.confidenceLevelIds);
  if (confidenceIds?.length) where.confidenceLevelId = { in: confidenceIds };

  const salesIds = toArray(query.pinSalesIds);
  if (salesIds?.length) where.pinSalesId = { in: salesIds };

  if (query.search) {
    where.description = { contains: query.search, mode: 'insensitive' };
  }

  if (query.fromDate || query.toDate) {
    where.estimatedClosureDate = {};
    if (query.fromDate) (where.estimatedClosureDate as any).gte = new Date(query.fromDate);
    if (query.toDate) (where.estimatedClosureDate as any).lte = new Date(query.toDate);
  }

  if (query.tcvMin !== undefined || query.tcvMax !== undefined) {
    where.tcvUsdMillion = {};
    if (query.tcvMin !== undefined) (where.tcvUsdMillion as any).gte = query.tcvMin;
    if (query.tcvMax !== undefined) (where.tcvUsdMillion as any).lte = query.tcvMax;
  }

  return where;
}

function serializeOpportunity(opp: any) {
  return {
    ...opp,
    lifetimeVolume: Number(opp.lifetimeVolume),
    unitPriceInr: Number(opp.unitPriceInr),
    unitPriceUsd: Number(opp.unitPriceUsd),
    tcvUsdMillion: Number(opp.tcvUsdMillion),
    dealStage: opp.dealStage
      ? { ...opp.dealStage, winningProbability: Number(opp.dealStage.winningProbability) }
      : opp.dealStage,
  };
}

export const opportunityService = {
  async getAll(query: any) {
    const pagination = parsePagination(query);
    const where = buildWhere(query);

    const sortBy = query.sortBy || 'serialNumber';
    const sortOrder = query.sortOrder || 'desc';
    const allowedSorts = ['serialNumber', 'tcvUsdMillion', 'estimatedClosureDate', 'createdAt', 'updatedAt'];
    const orderBy: any = allowedSorts.includes(sortBy) ? { [sortBy]: sortOrder } : { serialNumber: 'desc' };

    const [data, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        include: opportunityInclude,
        orderBy,
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.opportunity.count({ where }),
    ]);

    return buildPaginatedResponse(data.map(serializeOpportunity), total, pagination);
  },

  async getById(id: string) {
    const opp = await prisma.opportunity.findFirst({
      where: { id, isActive: true },
      include: opportunityInclude,
    });
    if (!opp) throw Object.assign(new Error('Opportunity not found'), { status: 404 });
    return serializeOpportunity(opp);
  },

  async create(data: any, userId: string) {
    const opp = await prisma.opportunity.create({
      data: {
        customerId: data.customerId,
        description: data.description,
        businessUnitId: data.businessUnitId,
        productCategoryId: data.productCategoryId,
        productSubcategoryId: data.productSubcategoryId,
        businessCategoryId: data.businessCategoryId,
        pinSalesId: data.pinSalesId,
        pinPresalesId: data.pinPresalesId || null,
        dealStageId: data.dealStageId,
        confidenceLevelId: data.confidenceLevelId,
        estimatedClosureDate: data.estimatedClosureDate ? new Date(data.estimatedClosureDate) : null,
        lifetimeVolume: data.lifetimeVolume,
        unitPriceInr: data.unitPriceInr,
        unitPriceUsd: data.unitPriceUsd,
        tcvUsdMillion: data.tcvUsdMillion,
        comments: data.comments || null,
        pms: data.pms || null,
        remarks: data.remarks || null,
        createdById: userId,
        updatedById: userId,
      },
      include: opportunityInclude,
    });

    return serializeOpportunity(opp);
  },

  async update(id: string, data: any, userId: string) {
    const old = await prisma.opportunity.findFirst({
      where: { id, isActive: true },
      include: opportunityInclude,
    });
    if (!old) throw Object.assign(new Error('Opportunity not found'), { status: 404 });

    // Resolve an incoming ID to a human-readable label
    async function resolveNew(field: string, val: any): Promise<string | null> {
      if (val === undefined || val === null) return null;
      const v = val.toString();
      switch (field) {
        case 'customerId':           return prisma.customer.findUnique({ where: { id: v } }).then(r => r?.name ?? v);
        case 'businessUnitId':       return prisma.businessUnit.findUnique({ where: { id: v } }).then(r => r?.name ?? v);
        case 'productCategoryId':    return prisma.productCategory.findUnique({ where: { id: v } }).then(r => r?.name ?? v);
        case 'productSubcategoryId': return prisma.productSubcategory.findUnique({ where: { id: v } }).then(r => r?.name ?? v);
        case 'businessCategoryId':   return prisma.businessCategory.findUnique({ where: { id: v } }).then(r => r?.name ?? v);
        case 'pinSalesId':           return prisma.user.findUnique({ where: { id: v } }).then(r => r?.fullName ?? v);
        case 'pinPresalesId':        return prisma.user.findUnique({ where: { id: v } }).then(r => r?.fullName ?? v);
        case 'dealStageId':          return prisma.dealStage.findUnique({ where: { id: v } }).then(r => r?.code ?? v);
        case 'confidenceLevelId':    return prisma.confidenceLevel.findUnique({ where: { id: v } }).then(r => r?.name ?? v);
        case 'estimatedClosureDate': return new Date(v).toISOString().split('T')[0];
        default:                     return v;
      }
    }

    // Human-readable old values from loaded relations
    const o = old as any;
    const oldReadable: Record<string, string | null> = {
      customerId:           o.customer?.name           ?? null,
      description:          o.description              ?? null,
      businessUnitId:       o.businessUnit?.name       ?? null,
      productCategoryId:    o.productCategory?.name    ?? null,
      productSubcategoryId: o.productSubcategory?.name ?? null,
      businessCategoryId:   o.businessCategory?.name   ?? null,
      pinSalesId:           o.pinSales?.fullName        ?? null,
      pinPresalesId:        o.pinPresales?.fullName      ?? null,
      dealStageId:          o.dealStage?.code           ?? null,
      confidenceLevelId:    o.confidenceLevel?.name     ?? null,
      estimatedClosureDate: o.estimatedClosureDate ? new Date(o.estimatedClosureDate).toISOString().split('T')[0] : null,
      lifetimeVolume:       o.lifetimeVolume?.toString() ?? null,
      unitPriceInr:         o.unitPriceInr?.toString()  ?? null,
      unitPriceUsd:         o.unitPriceUsd?.toString()  ?? null,
      tcvUsdMillion:        o.tcvUsdMillion?.toString() ?? null,
      comments:             o.comments  ?? null,
      pms:                  o.pms       ?? null,
      remarks:              o.remarks   ?? null,
    };

    const historyEntries: any[] = [];
    for (const field of Object.keys(oldReadable)) {
      const oldVal = oldReadable[field];
      const newRaw = data[field];
      const newVal = newRaw !== undefined ? await resolveNew(field, newRaw) : oldVal;
      if (oldVal !== newVal) {
        historyEntries.push({
          opportunityId: id,
          changedById: userId,
          fieldName: field,
          oldValue: oldVal,
          newValue: newVal,
        });
      }
    }

    const updated = await prisma.opportunity.update({
      where: { id },
      data: {
        customerId: data.customerId,
        description: data.description,
        businessUnitId: data.businessUnitId,
        productCategoryId: data.productCategoryId,
        productSubcategoryId: data.productSubcategoryId,
        businessCategoryId: data.businessCategoryId,
        pinSalesId: data.pinSalesId,
        pinPresalesId: data.pinPresalesId ?? null,
        dealStageId: data.dealStageId,
        confidenceLevelId: data.confidenceLevelId,
        estimatedClosureDate: data.estimatedClosureDate ? new Date(data.estimatedClosureDate) : null,
        lifetimeVolume: data.lifetimeVolume,
        unitPriceInr: data.unitPriceInr,
        unitPriceUsd: data.unitPriceUsd,
        tcvUsdMillion: data.tcvUsdMillion,
        comments: data.comments ?? null,
        pms: data.pms ?? null,
        remarks: data.remarks ?? null,
        updatedById: userId,
      },
      include: opportunityInclude,
    });

    if (historyEntries.length > 0) {
      await prisma.opportunityHistory.createMany({ data: historyEntries });
    }

    return serializeOpportunity(updated);
  },

  async delete(id: string, userId: string) {
    const opp = await prisma.opportunity.findFirst({ where: { id, isActive: true } });
    if (!opp) throw Object.assign(new Error('Opportunity not found'), { status: 404 });
    await prisma.opportunity.update({ where: { id }, data: { isActive: false, updatedById: userId } });
  },

  async getHistory(id: string) {
    const entries = await prisma.opportunityHistory.findMany({
      where: { opportunityId: id },
      include: {
        changedBy: { select: { id: true, fullName: true, email: true, role: true, businessUnit: true, isActive: true, createdAt: true } },
      },
      orderBy: { changedAt: 'desc' },
    });

    const refFieldMap: Record<string, 'customer' | 'businessUnit' | 'productCategory' | 'productSubcategory' | 'businessCategory' | 'user' | 'dealStage' | 'confidenceLevel'> = {
      customerId: 'customer',
      businessUnitId: 'businessUnit',
      productCategoryId: 'productCategory',
      productSubcategoryId: 'productSubcategory',
      businessCategoryId: 'businessCategory',
      pinSalesId: 'user',
      pinPresalesId: 'user',
      dealStageId: 'dealStage',
      confidenceLevelId: 'confidenceLevel',
    };

    const idsByType: Record<string, Set<string>> = {
      customer: new Set(), businessUnit: new Set(), productCategory: new Set(),
      productSubcategory: new Set(), businessCategory: new Set(), user: new Set(),
      dealStage: new Set(), confidenceLevel: new Set(),
    };

    for (const e of entries) {
      const type = refFieldMap[e.fieldName];
      if (type) {
        if (e.oldValue) idsByType[type].add(e.oldValue);
        if (e.newValue) idsByType[type].add(e.newValue);
      }
    }

    const [customers, bus, cats, subcats, bizCats, users, stages, confs] = await Promise.all([
      idsByType.customer.size ? prisma.customer.findMany({ where: { id: { in: [...idsByType.customer] } }, select: { id: true, name: true } }) : [],
      idsByType.businessUnit.size ? prisma.businessUnit.findMany({ where: { id: { in: [...idsByType.businessUnit] } }, select: { id: true, name: true } }) : [],
      idsByType.productCategory.size ? prisma.productCategory.findMany({ where: { id: { in: [...idsByType.productCategory] } }, select: { id: true, name: true } }) : [],
      idsByType.productSubcategory.size ? prisma.productSubcategory.findMany({ where: { id: { in: [...idsByType.productSubcategory] } }, select: { id: true, name: true } }) : [],
      idsByType.businessCategory.size ? prisma.businessCategory.findMany({ where: { id: { in: [...idsByType.businessCategory] } }, select: { id: true, name: true } }) : [],
      idsByType.user.size ? prisma.user.findMany({ where: { id: { in: [...idsByType.user] } }, select: { id: true, fullName: true } }) : [],
      idsByType.dealStage.size ? prisma.dealStage.findMany({ where: { id: { in: [...idsByType.dealStage] } }, select: { id: true, code: true } }) : [],
      idsByType.confidenceLevel.size ? prisma.confidenceLevel.findMany({ where: { id: { in: [...idsByType.confidenceLevel] } }, select: { id: true, name: true } }) : [],
    ]);

    const lookups: Record<string, Record<string, string>> = {
      customer: Object.fromEntries((customers as any[]).map((r) => [r.id, r.name])),
      businessUnit: Object.fromEntries((bus as any[]).map((r) => [r.id, r.name])),
      productCategory: Object.fromEntries((cats as any[]).map((r) => [r.id, r.name])),
      productSubcategory: Object.fromEntries((subcats as any[]).map((r) => [r.id, r.name])),
      businessCategory: Object.fromEntries((bizCats as any[]).map((r) => [r.id, r.name])),
      user: Object.fromEntries((users as any[]).map((r) => [r.id, r.fullName])),
      dealStage: Object.fromEntries((stages as any[]).map((r) => [r.id, r.code])),
      confidenceLevel: Object.fromEntries((confs as any[]).map((r) => [r.id, r.name])),
    };

    return entries.map((e) => {
      const type = refFieldMap[e.fieldName];
      if (!type) return e;
      return {
        ...e,
        oldValue: e.oldValue ? (lookups[type][e.oldValue] ?? e.oldValue) : e.oldValue,
        newValue: e.newValue ? (lookups[type][e.newValue] ?? e.newValue) : e.newValue,
      };
    });
  },

  async exportToExcel(query: any): Promise<Buffer> {
    const where = buildWhere(query);
    const opps = await prisma.opportunity.findMany({
      where,
      include: opportunityInclude,
      orderBy: { serialNumber: 'asc' },
    });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Opportunities');

    ws.columns = [
      { header: 'S.No', key: 'serialNumber', width: 8 },
      { header: 'Customer', key: 'customer', width: 20 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'BU', key: 'bu', width: 10 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Subcategory', key: 'subcategory', width: 20 },
      { header: 'Biz Category', key: 'bizCategory', width: 15 },
      { header: 'Stage', key: 'stage', width: 12 },
      { header: 'Confidence', key: 'confidence', width: 12 },
      { header: 'TCV USD M', key: 'tcv', width: 12 },
      { header: 'Lifetime Vol.', key: 'lifetimeVolume', width: 14 },
      { header: 'Unit Price INR', key: 'unitPriceInr', width: 14 },
      { header: 'Unit Price USD', key: 'unitPriceUsd', width: 14 },
      { header: 'PIN Sales', key: 'pinSales', width: 18 },
      { header: 'PIN Presales', key: 'pinPresales', width: 18 },
      { header: 'Est. Closure', key: 'closureDate', width: 14 },
      { header: 'PMS', key: 'pms', width: 20 },
      { header: 'Comments', key: 'comments', width: 30 },
      { header: 'Remarks', key: 'remarks', width: 30 },
      { header: 'Created At', key: 'createdAt', width: 16 },
    ];

    ws.getRow(1).font = { bold: true };

    for (const opp of opps) {
      ws.addRow({
        serialNumber: opp.serialNumber,
        customer: opp.customer.name,
        description: opp.description,
        bu: opp.businessUnit.name,
        category: opp.productCategory.name,
        subcategory: opp.productSubcategory.name,
        bizCategory: opp.businessCategory.name,
        stage: (opp.dealStage as any).code,
        confidence: opp.confidenceLevel.name,
        tcv: Number(opp.tcvUsdMillion),
        lifetimeVolume: Number(opp.lifetimeVolume),
        unitPriceInr: Number(opp.unitPriceInr),
        unitPriceUsd: Number(opp.unitPriceUsd),
        pinSales: opp.pinSales.fullName,
        pinPresales: opp.pinPresales?.fullName || '',
        closureDate: opp.estimatedClosureDate?.toISOString().split('T')[0] || '',
        pms: opp.pms || '',
        comments: opp.comments || '',
        remarks: opp.remarks || '',
        createdAt: opp.createdAt.toISOString().split('T')[0],
      });
    }

    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer);
  },
};

