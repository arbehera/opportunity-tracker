import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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

export const userService = {
  async getAll(params: any) {
    const where: any = {};
    if (params.role) where.role = params.role;
    if (params.isActive !== undefined) where.isActive = params.isActive === 'true';
    if (params.search) {
      where.OR = [
        { fullName: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    return prisma.user.findMany({ where, select: userSelect, orderBy: { fullName: 'asc' } });
  },

  async getById(id: string) {
    const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
    return user;
  },

  async create(data: any) {
    const passwordHash = await bcrypt.hash(data.password, 12);
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

  async update(id: string, data: any) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
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

  async deactivate(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
    return prisma.user.update({ where: { id }, data: { isActive: false }, select: userSelect });
  },

  async resetPassword(id: string, password: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id }, data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null } });
  },
};
