import { z } from 'zod';

export const createOpportunitySchema = z.object({
  customerId: z.string().uuid(),
  description: z.string().min(3).max(1000),
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
  comments: z.string().optional().nullable(),
  pms: z.string().max(200).optional().nullable(),
  remarks: z.string().optional().nullable(),
});

export const updateOpportunitySchema = createOpportunitySchema.partial();
