"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.opportunityService = void 0;
const client_1 = require("@prisma/client");
const exceljs_1 = __importDefault(require("exceljs"));
const pagination_1 = require("../utils/pagination");
const prisma = new client_1.PrismaClient();
const opportunityInclude = {
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
function toArray(val) {
    if (!val)
        return undefined;
    return Array.isArray(val) ? val : [val];
}
function buildWhere(query) {
    const where = { isActive: true };
    const customerIds = toArray(query.customerIds);
    if (customerIds?.length)
        where.customerId = { in: customerIds };
    const buIds = toArray(query.businessUnitIds);
    if (buIds?.length)
        where.businessUnitId = { in: buIds };
    const catIds = toArray(query.productCategoryIds);
    if (catIds?.length)
        where.productCategoryId = { in: catIds };
    const subcatIds = toArray(query.productSubcategoryIds);
    if (subcatIds?.length)
        where.productSubcategoryId = { in: subcatIds };
    const bizCatIds = toArray(query.businessCategoryIds);
    if (bizCatIds?.length)
        where.businessCategoryId = { in: bizCatIds };
    const stageIds = toArray(query.dealStageIds);
    if (stageIds?.length)
        where.dealStageId = { in: stageIds };
    const confidenceIds = toArray(query.confidenceLevelIds);
    if (confidenceIds?.length)
        where.confidenceLevelId = { in: confidenceIds };
    const salesIds = toArray(query.pinSalesIds);
    if (salesIds?.length)
        where.pinSalesId = { in: salesIds };
    if (query.search) {
        where.description = { contains: query.search, mode: 'insensitive' };
    }
    if (query.fromDate || query.toDate) {
        where.estimatedClosureDate = {};
        if (query.fromDate)
            where.estimatedClosureDate.gte = new Date(query.fromDate);
        if (query.toDate)
            where.estimatedClosureDate.lte = new Date(query.toDate);
    }
    if (query.tcvMin !== undefined || query.tcvMax !== undefined) {
        where.tcvUsdMillion = {};
        if (query.tcvMin !== undefined)
            where.tcvUsdMillion.gte = query.tcvMin;
        if (query.tcvMax !== undefined)
            where.tcvUsdMillion.lte = query.tcvMax;
    }
    return where;
}
function serializeOpportunity(opp) {
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
exports.opportunityService = {
    async getAll(query) {
        const pagination = (0, pagination_1.parsePagination)(query);
        const where = buildWhere(query);
        const sortBy = query.sortBy || 'serialNumber';
        const sortOrder = query.sortOrder || 'desc';
        const allowedSorts = ['serialNumber', 'tcvUsdMillion', 'estimatedClosureDate', 'createdAt', 'updatedAt'];
        const orderBy = allowedSorts.includes(sortBy) ? { [sortBy]: sortOrder } : { serialNumber: 'desc' };
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
        return (0, pagination_1.buildPaginatedResponse)(data.map(serializeOpportunity), total, pagination);
    },
    async getById(id) {
        const opp = await prisma.opportunity.findFirst({
            where: { id, isActive: true },
            include: opportunityInclude,
        });
        if (!opp)
            throw Object.assign(new Error('Opportunity not found'), { status: 404 });
        return serializeOpportunity(opp);
    },
    async create(data, userId) {
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
    async update(id, data, userId) {
        const old = await prisma.opportunity.findFirst({ where: { id, isActive: true } });
        if (!old)
            throw Object.assign(new Error('Opportunity not found'), { status: 404 });
        const trackedFields = [
            'customerId', 'description', 'businessUnitId', 'productCategoryId',
            'productSubcategoryId', 'businessCategoryId', 'pinSalesId', 'pinPresalesId',
            'dealStageId', 'confidenceLevelId', 'estimatedClosureDate',
            'lifetimeVolume', 'unitPriceInr', 'unitPriceUsd', 'tcvUsdMillion',
            'comments', 'pms', 'remarks',
        ];
        const historyEntries = [];
        for (const field of trackedFields) {
            const oldVal = old[field]?.toString() ?? null;
            const newVal = data[field] !== undefined ? (data[field]?.toString() ?? null) : oldVal;
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
    async delete(id, userId) {
        const opp = await prisma.opportunity.findFirst({ where: { id, isActive: true } });
        if (!opp)
            throw Object.assign(new Error('Opportunity not found'), { status: 404 });
        await prisma.opportunity.update({ where: { id }, data: { isActive: false, updatedById: userId } });
    },
    async getHistory(id) {
        return prisma.opportunityHistory.findMany({
            where: { opportunityId: id },
            include: {
                changedBy: { select: { id: true, fullName: true, email: true, role: true, businessUnit: true, isActive: true, createdAt: true } },
            },
            orderBy: { changedAt: 'desc' },
        });
    },
    async exportToExcel(query) {
        const where = buildWhere(query);
        const opps = await prisma.opportunity.findMany({
            where,
            include: opportunityInclude,
            orderBy: { serialNumber: 'asc' },
        });
        const wb = new exceljs_1.default.Workbook();
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
                stage: opp.dealStage.code,
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
