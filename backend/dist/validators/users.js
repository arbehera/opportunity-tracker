"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetUserPasswordSchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(1).max(150),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    role: zod_1.z.enum(['ADMIN', 'MANAGER', 'SALES', 'PRESALES', 'VIEWER']),
    businessUnit: zod_1.z.string().max(50).optional().nullable(),
});
exports.updateUserSchema = exports.createUserSchema.omit({ password: true }).partial();
exports.resetUserPasswordSchema = zod_1.z.object({
    password: zod_1.z.string().min(8),
});
