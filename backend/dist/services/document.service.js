"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAccess = exports.remove = exports.update = exports.create = exports.getById = exports.list = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const FULL_INCLUDE = {
    customer: true,
    opportunity: { select: { id: true, serialNumber: true, description: true } },
    receivedBy: { select: { id: true, fullName: true } },
    uploadedBy: { select: { id: true, fullName: true } },
};
const list = async (filters) => {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 25;
    const skip = (page - 1) * limit;
    const where = {};
    if (filters.customerId)
        where.customerId = filters.customerId;
    if (filters.opportunityId)
        where.opportunityId = filters.opportunityId;
    if (filters.documentType)
        where.documentType = filters.documentType;
    if (filters.search)
        where.title = { contains: filters.search, mode: 'insensitive' };
    const [data, total] = await Promise.all([
        prisma.document.findMany({
            where,
            include: FULL_INCLUDE,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.document.count({ where }),
    ]);
    return { data, total, page, limit };
};
exports.list = list;
const getById = async (id) => {
    const doc = await prisma.document.findUnique({
        where: { id },
        include: {
            ...FULL_INCLUDE,
            accessLogs: {
                include: { accessedBy: { select: { id: true, fullName: true } } },
                orderBy: { accessedAt: 'desc' },
                take: 50,
            },
        },
    });
    if (!doc)
        throw { status: 404, message: 'Document not found' };
    return doc;
};
exports.getById = getById;
const create = async (data, userId) => {
    return prisma.document.create({
        data: { ...data, uploadedById: userId },
        include: FULL_INCLUDE,
    });
};
exports.create = create;
const update = async (id, data) => {
    return prisma.document.update({ where: { id }, data, include: FULL_INCLUDE });
};
exports.update = update;
const remove = async (id) => {
    return prisma.document.delete({ where: { id } });
};
exports.remove = remove;
const logAccess = async (documentId, userId, action) => {
    return prisma.documentAccessLog.create({
        data: { documentId, accessedById: userId, action },
    });
};
exports.logAccess = logAccess;
