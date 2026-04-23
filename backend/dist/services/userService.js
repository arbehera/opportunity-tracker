"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const userSelect = {
    id: true,
    fullName: true,
    email: true,
    role: true,
    businessUnit: true,
    isActive: true,
    lastLoginAt: true,
    createdAt: true,
    updatedAt: true,
};
exports.userService = {
    async getAll(params) {
        const where = {};
        if (params.role)
            where.role = params.role;
        if (params.isActive !== undefined)
            where.isActive = params.isActive === 'true';
        if (params.search) {
            where.OR = [
                { fullName: { contains: params.search, mode: 'insensitive' } },
                { email: { contains: params.search, mode: 'insensitive' } },
            ];
        }
        return prisma.user.findMany({ where, select: userSelect, orderBy: { fullName: 'asc' } });
    },
    async getById(id) {
        const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
        if (!user)
            throw Object.assign(new Error('User not found'), { status: 404 });
        return user;
    },
    async create(data) {
        const passwordHash = await bcryptjs_1.default.hash(data.password, 12);
        return prisma.user.create({
            data: {
                fullName: data.fullName,
                email: data.email,
                passwordHash,
                role: data.role,
                businessUnit: data.businessUnit || null,
            },
            select: userSelect,
        });
    },
    async update(id, data) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user)
            throw Object.assign(new Error('User not found'), { status: 404 });
        return prisma.user.update({
            where: { id },
            data: {
                fullName: data.fullName,
                email: data.email,
                role: data.role,
                businessUnit: data.businessUnit ?? null,
            },
            select: userSelect,
        });
    },
    async deactivate(id) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user)
            throw Object.assign(new Error('User not found'), { status: 404 });
        return prisma.user.update({ where: { id }, data: { isActive: false }, select: userSelect });
    },
    async resetPassword(id, password) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user)
            throw Object.assign(new Error('User not found'), { status: 404 });
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        await prisma.user.update({ where: { id }, data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null } });
    },
};
