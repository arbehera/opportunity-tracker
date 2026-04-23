"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfidenceLevelSchema = exports.createDealStageSchema = exports.createBusinessUnitSchema = exports.createBusinessCategorySchema = exports.createProductSubcategorySchema = exports.createProductCategorySchema = exports.createCustomerSchema = void 0;
const zod_1 = require("zod");
exports.createCustomerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200),
    segment: zod_1.z.string().max(100).optional().nullable(),
    region: zod_1.z.string().max(100).optional().nullable(),
});
exports.createProductCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
});
exports.createProductSubcategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(150),
    categoryId: zod_1.z.string().uuid(),
});
exports.createBusinessCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
});
exports.createBusinessUnitSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(50),
    description: zod_1.z.string().optional().nullable(),
});
exports.createDealStageSchema = zod_1.z.object({
    code: zod_1.z.string().min(1).max(20),
    classification: zod_1.z.string().min(1).max(100),
    status: zod_1.z.string().min(1).max(100),
    winningProbability: zod_1.z.number().min(0).max(100),
    sortOrder: zod_1.z.number().int(),
});
exports.createConfidenceLevelSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(50),
    sortOrder: zod_1.z.number().int(),
});
