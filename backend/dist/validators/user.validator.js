"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
const passwordSchema = zod_1.z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/, 'Password must contain uppercase letter, number, and special character');
exports.createUserSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2).max(150),
    email: zod_1.z.string().email(),
    password: passwordSchema,
    role: zod_1.z.enum(['ADMIN', 'MANAGER', 'SALES', 'PRESALES', 'VIEWER']),
    businessUnit: zod_1.z.string().optional().nullable(),
    isActive: zod_1.z.boolean().default(true),
});
exports.updateUserSchema = exports.createUserSchema.omit({ password: true }).partial();
exports.resetPasswordSchema = zod_1.z.object({
    password: passwordSchema,
});
