import { z } from 'zod';

export const createUserSchema = z.object({
  fullName: z.string().min(1).max(150),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'MANAGER', 'SALES', 'PRESALES', 'VIEWER']),
  businessUnit: z.string().max(50).optional().nullable(),
});

export const updateUserSchema = createUserSchema.omit({ password: true }).partial();

export const resetUserPasswordSchema = z.object({
  password: z.string().min(8),
});
