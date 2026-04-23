"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.masterService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.masterService = {
    customers: {
        list: (params) => prisma.customer.findMany({ orderBy: { name: 'asc' } }),
        create: (data) => prisma.customer.create({ data }),
        update: (id, data) => prisma.customer.update({ where: { id }, data }),
        remove: (id) => prisma.customer.update({ where: { id }, data: { isActive: false } }),
    },
    productCategories: {
        list: () => prisma.productCategory.findMany({ orderBy: { name: 'asc' } }),
        create: (data) => prisma.productCategory.create({ data }),
        update: (id, data) => prisma.productCategory.update({ where: { id }, data }),
        remove: (id) => prisma.productCategory.update({ where: { id }, data: { isActive: false } }),
    },
    productSubcategories: {
        list: (params) => prisma.productSubcategory.findMany({
            include: { category: true },
            where: params?.categoryId ? { categoryId: params.categoryId } : undefined,
            orderBy: { name: 'asc' },
        }),
        create: (data) => prisma.productSubcategory.create({ data, include: { category: true } }),
        update: (id, data) => prisma.productSubcategory.update({ where: { id }, data, include: { category: true } }),
        remove: (id) => prisma.productSubcategory.update({ where: { id }, data: { isActive: false } }),
    },
    businessCategories: {
        list: () => prisma.businessCategory.findMany({ orderBy: { name: 'asc' } }),
        create: (data) => prisma.businessCategory.create({ data }),
        update: (id, data) => prisma.businessCategory.update({ where: { id }, data }),
        remove: (id) => prisma.businessCategory.update({ where: { id }, data: { isActive: false } }),
    },
    businessUnits: {
        list: () => prisma.businessUnit.findMany({ orderBy: { name: 'asc' } }),
        create: (data) => prisma.businessUnit.create({ data }),
        update: (id, data) => prisma.businessUnit.update({ where: { id }, data }),
        remove: (id) => prisma.businessUnit.update({ where: { id }, data: { isActive: false } }),
    },
    dealStages: {
        list: () => prisma.dealStage.findMany({ orderBy: { sortOrder: 'asc' } }),
        create: (data) => prisma.dealStage.create({ data: { ...data, winningProbability: data.winningProbability } }),
        update: (id, data) => prisma.dealStage.update({ where: { id }, data }),
        remove: (id) => prisma.dealStage.update({ where: { id }, data: { isActive: false } }),
    },
    confidenceLevels: {
        list: () => prisma.confidenceLevel.findMany({ orderBy: { sortOrder: 'asc' } }),
        create: (data) => prisma.confidenceLevel.create({ data }),
        update: (id, data) => prisma.confidenceLevel.update({ where: { id }, data }),
        remove: (id) => prisma.confidenceLevel.delete({ where: { id } }),
    },
};
