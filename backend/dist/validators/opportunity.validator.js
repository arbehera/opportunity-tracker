"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOpportunitySchema = exports.createOpportunitySchema = void 0;
const zod_1 = require("zod");
exports.createOpportunitySchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid(),
    description: zod_1.z.string().min(3).max(1000),
    businessUnitId: zod_1.z.string().uuid(),
    productCategoryId: zod_1.z.string().uuid(),
    productSubcategoryId: zod_1.z.string().uuid(),
    businessCategoryId: zod_1.z.string().uuid(),
    pinSalesId: zod_1.z.string().uuid(),
    pinPresalesId: zod_1.z.string().uuid().optional().nullable(),
    dealStageId: zod_1.z.string().uuid(),
    confidenceLevelId: zod_1.z.string().uuid(),
    estimatedClosureDate: zod_1.z.string().optional().nullable(),
    lifetimeVolume: zod_1.z.number().int().positive(),
    unitPriceInr: zod_1.z.number().positive(),
    unitPriceUsd: zod_1.z.number().positive(),
    comments: zod_1.z.string().optional().nullable(),
    pms: zod_1.z.string().max(200).optional().nullable(),
    remarks: zod_1.z.string().optional().nullable(),
});
exports.updateOpportunitySchema = exports.createOpportunitySchema.partial();
