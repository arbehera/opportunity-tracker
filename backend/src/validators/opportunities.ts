import { z } from 'zod';

export const createOpportunitySchema = z.object({
  customerId: z.string().uuid(),
  description: z.string().min(1).max(1000),
  businessUnitId: z.string().uuid(),
  productCategoryId: z.string().uuid(),
  productSubcategoryId: z.string().uuid(),
  businessCategoryId: z.string().uuid(),
  pinSalesId: z.string().uuid(),
  pinPresalesId: z.string().uuid().optional().nullable(),
  dealStageId: z.string().uuid(),
  confidenceLevelId: z.string().uuid(),
  estimatedClosureDate: z.string().optional().nullable(),
  lifetimeVolume: z.number().int().positive(),
  unitPriceInr: z.number().positive(),
  unitPriceUsd: z.number().positive(),
  tcvUsdMillion: z.number().positive(),
  comments: z.string().optional().nullable(),
  pms: z.string().max(200).optional().nullable(),
  remarks: z.string().optional().nullable(),
});

export const updateOpportunitySchema = createOpportunitySchema.partial();

export const opportunityFiltersSchema = z.object({
  customerIds: z.union([z.string(), z.array(z.string())]).optional(),
  businessUnitIds: z.union([z.string(), z.array(z.string())]).optional(),
  productCategoryIds: z.union([z.string(), z.array(z.string())]).optional(),
  productSubcategoryIds: z.union([z.string(), z.array(z.string())]).optional(),
  businessCategoryIds: z.union([z.string(), z.array(z.string())]).optional(),
  dealStageIds: z.union([z.string(), z.array(z.string())]).optional(),
  confidenceLevelIds: z.union([z.string(), z.array(z.string())]).optional(),
  pinSalesIds: z.union([z.string(), z.array(z.string())]).optional(),
  search: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  tcvMin: z.coerce.number().optional(),
  tcvMax: z.coerce.number().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
