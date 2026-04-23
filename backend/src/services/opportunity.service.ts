import { PrismaClient, Prisma } from '@prisma/client';
import { recordChanges } from './history.service';
import { createNotification } from './notification.service';
import { opportunitiesToExcel } from './export.service';

const prisma = new PrismaClient();

const FULL_INCLUDE = {
  customer: true,
  businessUnit: true,
  productCategory: true,
  productSubcategory: { include: { category: true } },
  businessCategory: true,
  pinSales: { select: { id: true, fullName: true, email: true } },
  pinPresales: { select: { id: true, fullName: true, email: true } },
  dealStage: true,
  confidenceLevel: true,
  createdBy: { select: { id: true, fullName: true } },
  updatedBy: { select: { id: true, fullName: true } },
};

const buildWhere = (filters: any): Prisma.OpportunityWhereInput => {
  const where: Prisma.OpportunityWhereInput = { isActive: true };
  if (filters.customerIds) where.customerId = { in: Array.isArray(filters.customerIds) ? filters.customerIds : [filters.customerIds] };
  if (filters.businessUnitIds) where.businessUnitId = { in: Array.isArray(filters.businessUnitIds) ? filters.businessUnitIds : [filters.businessUnitIds] };
  if (filters.productCategoryIds) where.productCategoryId = { in: Array.isArray(filters.productCategoryIds) ? filters.productCategoryIds : [filters.productCategoryIds] };
  if (filters.productSubcategoryIds) where.productSubcategoryId = { in: Array.isArray(filters.productSubcategoryIds) ? filters.productSubcategoryIds : [filters.productSubcategoryIds] };
  if (filters.businessCategoryIds) where.businessCategoryId = { in: Array.isArray(filters.businessCategoryIds) ? filters.businessCategoryIds : [filters.businessCategoryIds] };
  if (filters.dealStageIds) where.dealStageId = { in: Array.isArray(filters.dealStageIds) ? filters.dealStageIds : [filters.dealStageIds] };
  if (filters.confidenceLevelIds) where.confidenceLevelId = { in: Array.isArray(filters.confidenceLevelIds) ? filters.confidenceLevelIds : [filters.confidenceLevelIds] };
  if (filters.pinSalesIds) where.pinSalesId = { in: Array.isArray(filters.pinSalesIds) ? filters.pinSalesIds : [filters.pinSalesIds] };
  if (filters.search) {
    where.OR = [
      { description: { contains: filters.search as string, mode: 'insensitive' } },
      { comments: { contains: filters.search as string, mode: 'insensitive' } },
    ];
  }
  if (filters.fromDate || filters.toDate) {
    where.estimatedClosureDate = {};
    if (filters.fromDate) (where.estimatedClosureDate as any).gte = new Date(filters.fromDate as string);
    if (filters.toDate) (where.estimatedClosureDate as any).lte = new Date(filters.toDate as string);
  }
  if (filters.tcvMin !== undefined) where.tcvUsdMillion = { ...(where.tcvUsdMillion as any), gte: Number(filters.tcvMin) };
  if (filters.tcvMax !== undefined) where.tcvUsdMillion = { ...(where.tcvUsdMillion as any), lte: Number(filters.tcvMax) };
  return where;
};

export const list = async (filters: any) => {
  const page = parseInt(filters.page as string) || 1;
  const limit = parseInt(filters.limit as string) || 25;
  const skip = (page - 1) * limit;
  const sortBy = (filters.sortBy as string) || 'createdAt';
  const sortOrder = (filters.sortOrder as string) || 'desc';
  const where = buildWhere(filters);

  const [data, total] = await Promise.all([
    prisma.opportunity.findMany({
      where,
      include: FULL_INCLUDE,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.opportunity.count({ where }),
  ]);
  return { data, total, page, limit };
};

export const getById = async (id: string) => {
  const opp = await prisma.opportunity.findFirst({
    where: { id, isActive: true },
    include: FULL_INCLUDE,
  });
  if (!opp) throw { status: 404, message: 'Opportunity not found' };
  return opp;
};

const computeTcv = (lifetimeVolume: number, unitPriceUsd: number) =>
  (lifetimeVolume * unitPriceUsd) / 1_000_000;

export const create = async (data: any, userId: string) => {
  const tcvUsdMillion = computeTcv(Number(data.lifetimeVolume), Number(data.unitPriceUsd));
  const opp = await prisma.opportunity.create({
    data: { ...data, tcvUsdMillion, createdById: userId, updatedById: userId },
    include: FULL_INCLUDE,
  });
  if (opp.pinSalesId !== userId) {
    await createNotification(opp.pinSalesId, `New opportunity assigned: ${opp.description}`, 'opportunity', opp.id);
  }
  if (opp.pinPresalesId && opp.pinPresalesId !== userId) {
    await createNotification(opp.pinPresalesId, `New opportunity assigned: ${opp.description}`, 'opportunity', opp.id);
  }
  return opp;
};

export const update = async (id: string, data: any, userId: string) => {
  const old = await getById(id);
  const vol = data.lifetimeVolume !== undefined ? Number(data.lifetimeVolume) : Number(old.lifetimeVolume);
  const usd = data.unitPriceUsd !== undefined ? Number(data.unitPriceUsd) : Number(old.unitPriceUsd);
  const tcvUsdMillion = computeTcv(vol, usd);
  const updated = await prisma.opportunity.update({
    where: { id },
    data: { ...data, tcvUsdMillion, updatedById: userId },
    include: FULL_INCLUDE,
  });
  await recordChanges(id, userId, old, updated);
  if (data.dealStageId && data.dealStageId !== old.dealStageId) {
    const msg = `Opportunity "${updated.description}" moved to stage ${updated.dealStage.code}`;
    if (updated.pinSalesId !== userId) await createNotification(updated.pinSalesId, msg, 'opportunity', id);
    if (updated.pinPresalesId && updated.pinPresalesId !== userId) await createNotification(updated.pinPresalesId, msg, 'opportunity', id);
  }
  return updated;
};

export const softDelete = async (id: string) => {
  return prisma.opportunity.update({ where: { id }, data: { isActive: false } });
};

export const getHistory = async (id: string) => {
  return prisma.opportunityHistory.findMany({
    where: { opportunityId: id },
    include: { changedBy: { select: { id: true, fullName: true, email: true } } },
    orderBy: { changedAt: 'desc' },
  });
};

export const exportToExcel = async (filters: any): Promise<Buffer> => {
  const { data } = await list({ ...filters, limit: 10000, page: 1 });
  return opportunitiesToExcel(data);
};
