"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const documentInclude = {
    receivedBy: { select: { id: true, fullName: true, email: true, role: true, businessUnit: true, isActive: true, createdAt: true } },
    uploadedBy: { select: { id: true, fullName: true, email: true, role: true, businessUnit: true, isActive: true, createdAt: true } },
    customer: true,
    opportunity: { select: { id: true, serialNumber: true, description: true } },
};
exports.documentService = {
    async getAll(params) {
        const where = {};
        if (params.customerId)
            where.customerId = params.customerId;
        if (params.opportunityId)
            where.opportunityId = params.opportunityId;
        if (params.documentType)
            where.documentType = params.documentType;
        if (params.search)
            where.title = { contains: params.search, mode: 'insensitive' };
        return prisma.document.findMany({
            where,
            include: documentInclude,
            orderBy: { createdAt: 'desc' },
        });
    },
    async getById(id) {
        const doc = await prisma.document.findUnique({
            where: { id },
            include: {
                ...documentInclude,
                accessLogs: {
                    include: {
                        accessedBy: { select: { id: true, fullName: true, email: true, role: true, businessUnit: true, isActive: true, createdAt: true } },
                    },
                    orderBy: { accessedAt: 'desc' },
                    take: 50,
                },
            },
        });
        if (!doc)
            throw Object.assign(new Error('Document not found'), { status: 404 });
        return doc;
    },
    async create(data, userId) {
        return prisma.document.create({
            data: {
                title: data.title,
                documentType: data.documentType,
                receivedDate: data.receivedDate ? new Date(data.receivedDate) : null,
                receivedById: data.receivedById || null,
                customerId: data.customerId || null,
                opportunityId: data.opportunityId || null,
                sharepointUrl: data.sharepointUrl,
                sharepointFileId: data.sharepointFileId || null,
                sharepointLibrary: data.sharepointLibrary || null,
                fileName: data.fileName,
                fileSizeKb: data.fileSizeKb || null,
                mimeType: data.mimeType || null,
                version: data.version || null,
                description: data.description || null,
                tags: data.tags || [],
                isConfidential: data.isConfidential || false,
                uploadedById: userId,
            },
            include: documentInclude,
        });
    },
    async update(id, data) {
        const doc = await prisma.document.findUnique({ where: { id } });
        if (!doc)
            throw Object.assign(new Error('Document not found'), { status: 404 });
        return prisma.document.update({ where: { id }, data, include: documentInclude });
    },
    async delete(id) {
        const doc = await prisma.document.findUnique({ where: { id } });
        if (!doc)
            throw Object.assign(new Error('Document not found'), { status: 404 });
        await prisma.document.delete({ where: { id } });
    },
    async logAccess(documentId, userId, action) {
        return prisma.documentAccessLog.create({
            data: { documentId, accessedById: userId, action: action },
        });
    },
};
