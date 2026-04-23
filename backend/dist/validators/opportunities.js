"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opportunityFiltersSchema = exports.updateOpportunitySchema = exports.createOpportunitySchema = void 0;
const zod_1 = require("zod");
exports.createOpportunitySchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid(),
    description: zod_1.z.string().min(1).max(1000),
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
    tcvUsdMillion: zod_1.z.number().positive(),
    comments: zod_1.z.string().optional().nullable(),
    pms: zod_1.z.string().max(200).optional().nullable(),
    remarks: zod_1.z.string().optional().nullable(),
});
exports.updateOpportunitySchema = exports.createOpportunitySchema.partial();
exports.opportunityFiltersSchema = zod_1.z.object({
    customerIds: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    businessUnitIds: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    productCategoryIds: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    productSubcategoryIds: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    businessCategoryIds: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    dealStageIds: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    confidenceLevelIds: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    pinSalesIds: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    search: zod_1.z.string().optional(),
    fromDate: zod_1.z.string().optional(),
    toDate: zod_1.z.string().optional(),
    tcvMin: zod_1.z.coerce.number().optional(),
    tcvMax: zod_1.z.coerce.number().optional(),
    page: zod_1.z.coerce.number().optional(),
    limit: zod_1.z.coerce.number().optional(),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
});
