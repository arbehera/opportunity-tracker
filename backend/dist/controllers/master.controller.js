"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confidenceLevels = exports.dealStages = exports.businessUnits = exports.businessCategories = exports.productSubcategories = exports.productCategories = exports.customers = void 0;
const client_1 = require("@prisma/client");
const response_1 = require("../utils/response");
const prisma = new client_1.PrismaClient();
const makeCrud = (model) => ({
    list: async (_req, res) => {
        const items = await prisma[model].findMany({ orderBy: { createdAt: 'asc' } });
        (0, response_1.sendSuccess)(res, items);
    },
    create: async (req, res) => {
        const item = await prisma[model].create({ data: req.body });
        (0, response_1.sendSuccess)(res, item, 'Created', 201);
    },
    update: async (req, res) => {
        const item = await prisma[model].update({ where: { id: req.params.id }, data: req.body });
        (0, response_1.sendSuccess)(res, item, 'Updated');
    },
    remove: async (req, res) => {
        await prisma[model].update({ where: { id: req.params.id }, data: { isActive: false } });
        (0, response_1.sendSuccess)(res, null, 'Deactivated');
    },
});
exports.customers = makeCrud('customer');
exports.productCategories = makeCrud('productCategory');
exports.productSubcategories = {
    ...makeCrud('productSubcategory'),
    list: async (_req, res) => {
        const items = await prisma.productSubcategory.findMany({
            include: { category: true },
            orderBy: { name: 'asc' },
        });
        (0, response_1.sendSuccess)(res, items);
    },
};
exports.businessCategories = makeCrud('businessCategory');
exports.businessUnits = makeCrud('businessUnit');
exports.dealStages = {
    ...makeCrud('dealStage'),
    list: async (_req, res) => {
        const items = await prisma.dealStage.findMany({ orderBy: { sortOrder: 'asc' } });
        (0, response_1.sendSuccess)(res, items);
    },
};
exports.confidenceLevels = {
    ...makeCrud('confidenceLevel'),
    list: async (_req, res) => {
        const items = await prisma.confidenceLevel.findMany({ orderBy: { sortOrder: 'asc' } });
        (0, response_1.sendSuccess)(res, items);
    },
};
