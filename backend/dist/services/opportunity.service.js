"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportToExcel = exports.getHistory = exports.softDelete = exports.update = exports.create = exports.getById = exports.list = void 0;
const client_1 = require("@prisma/client");
const history_service_1 = require("./history.service");
const notification_service_1 = require("./notification.service");
const export_service_1 = require("./export.service");
const prisma = new client_1.PrismaClient();
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
const buildWhere = (filters) => {
    const where = { isActive: true };
    if (filters.customerIds)
        where.customerId = { in: Array.isArray(filters.customerIds) ? filters.customerIds : [filters.customerIds] };
    if (filters.businessUnitIds)
        where.businessUnitId = { in: Array.isArray(filters.businessUnitIds) ? filters.businessUnitIds : [filters.businessUnitIds] };
    if (filters.productCategoryIds)
        where.productCategoryId = { in: Array.isArray(filters.productCategoryIds) ? filters.productCategoryIds : [filters.productCategoryIds] };
    if (filters.productSubcategoryIds)
        where.productSubcategoryId = { in: Array.isArray(filters.productSubcategoryIds) ? filters.productSubcategoryIds : [filters.productSubcategoryIds] };
    if (filters.businessCategoryIds)
        where.businessCategoryId = { in: Array.isArray(filters.businessCategoryIds) ? filters.businessCategoryIds : [filters.businessCategoryIds] };
    if (filters.dealStageIds)
        where.dealStageId = { in: Array.isArray(filters.dealStageIds) ? filters.dealStageIds : [filters.dealStageIds] };
    if (filters.confidenceLevelIds)
        where.confidenceLevelId = { in: Array.isArray(filters.confidenceLevelIds) ? filters.confidenceLevelIds : [filters.confidenceLevelIds] };
    if (filters.pinSalesIds)
        where.pinSalesId = { in: Array.isArray(filters.pinSalesIds) ? filters.pinSalesIds : [filters.pinSalesIds] };
    if (filters.search) {
        where.OR = [
            { description: { contains: filters.search, mode: 'insensitive' } },
            { comments: { contains: filters.search, mode: 'insensitive' } },
        ];
    }
    if (filters.fromDate || filters.toDate) {
        where.estimatedClosureDate = {};
        if (filters.fromDate)
            where.estimatedClosureDate.gte = new Date(filters.fromDate);
        if (filters.toDate)
            where.estimatedClosureDate.lte = new Date(filters.toDate);
    }
    if (filters.tcvMin !== undefined)
        where.tcvUsdMillion = { ...where.tcvUsdMillion, gte: Number(filters.tcvMin) };
    if (filters.tcvMax !== undefined)
        where.tcvUsdMillion = { ...where.tcvUsdMillion, lte: Number(filters.tcvMax) };
    return where;
};
const list = async (filters) => {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 25;
    const skip = (page - 1) * limit;
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';
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
exports.list = list;
const getById = async (id) => {
    const opp = await prisma.opportunity.findFirst({
        where: { id, isActive: true },
        include: FULL_INCLUDE,
    });
    if (!opp)
        throw { status: 404, message: 'Opportunity not found' };
    return opp;
};
exports.getById = getById;
const computeTcv = (lifetimeVolume, unitPriceUsd) => (lifetimeVolume * unitPriceUsd) / 1000000;
const create = async (data, userId) => {
    const tcvUsdMillion = computeTcv(Number(data.lifetimeVolume), Number(data.unitPriceUsd));
    const opp = await prisma.opportunity.create({
        data: { ...data, tcvUsdMillion, createdById: userId, updatedById: userId },
        include: FULL_INCLUDE,
    });
    if (opp.pinSalesId !== userId) {
        await (0, notification_service_1.createNotification)(opp.pinSalesId, `New opportunity assigned: ${opp.description}`, 'opportunity', opp.id);
    }
    if (opp.pinPresalesId && opp.pinPresalesId !== userId) {
        await (0, notification_service_1.createNotification)(opp.pinPresalesId, `New opportunity assigned: ${opp.description}`, 'opportunity', opp.id);
    }
    return opp;
};
exports.create = create;
const update = async (id, data, userId) => {
    const old = await (0, exports.getById)(id);
    const vol = data.lifetimeVolume !== undefined ? Number(data.lifetimeVolume) : Number(old.lifetimeVolume);
    const usd = data.unitPriceUsd !== undefined ? Number(data.unitPriceUsd) : Number(old.unitPriceUsd);
    const tcvUsdMillion = computeTcv(vol, usd);
    const updated = await prisma.opportunity.update({
        where: { id },
        data: { ...data, tcvUsdMillion, updatedById: userId },
        include: FULL_INCLUDE,
    });
    await (0, history_service_1.recordChanges)(id, userId, old, updated);
    if (data.dealStageId && data.dealStageId !== old.dealStageId) {
        const msg = `Opportunity "${updated.description}" moved to stage ${updated.dealStage.code}`;
        if (updated.pinSalesId !== userId)
            await (0, notification_service_1.createNotification)(updated.pinSalesId, msg, 'opportunity', id);
        if (updated.pinPresalesId && updated.pinPresalesId !== userId)
            await (0, notification_service_1.createNotification)(updated.pinPresalesId, msg, 'opportunity', id);
    }
    return updated;
};
exports.update = update;
const softDelete = async (id) => {
    return prisma.opportunity.update({ where: { id }, data: { isActive: false } });
};
exports.softDelete = softDelete;
const getHistory = async (id) => {
    return prisma.opportunityHistory.findMany({
        where: { opportunityId: id },
        include: { changedBy: { select: { id: true, fullName: true, email: true } } },
        orderBy: { changedAt: 'desc' },
    });
};
exports.getHistory = getHistory;
const exportToExcel = async (filters) => {
    const { data } = await (0, exports.list)({ ...filters, limit: 10000, page: 1 });
    return (0, export_service_1.opportunitiesToExcel)(data);
};
exports.exportToExcel = exportToExcel;
