import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/,
    'Password must contain uppercase letter, number, and special character'
  );

export const createUserSchema = z.object({
  fullName: z.string().min(2).max(150),
  email: z.string().email(),
  password: passwordSchema,
  role: z.enum(['ADMIN', 'MANAGER', 'SALES', 'PRESALES', 'VIEWER']),
  businessUnit: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = createUserSchema.omit({ password: true }).partial();

export const resetPasswordSchema = z.object({
  password: passwordSchema,
});
