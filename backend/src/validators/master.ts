import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(1).max(200),
  segment: z.string().max(100).optional().nullable(),
  region: z.string().max(100).optional().nullable(),
});

export const createProductCategorySchema = z.object({
  name: z.string().min(1).max(100),
});

export const createProductSubcategorySchema = z.object({
  name: z.string().min(1).max(150),
  categoryId: z.string().uuid(),
});

export const createBusinessCategorySchema = z.object({
  name: z.string().min(1).max(100),
});

export const createBusinessUnitSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().optional().nullable(),
});

export const createDealStageSchema = z.object({
  code: z.string().min(1).max(20),
  classification: z.string().min(1).max(100),
  status: z.string().min(1).max(100),
  winningProbability: z.number().min(0).max(100),
  sortOrder: z.number().int(),
});

export const createConfidenceLevelSchema = z.object({
  name: z.string().min(1).max(50),
  sortOrder: z.number().int(),
});
