import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { hashPassword } from '../utils/password';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';

const prisma = new PrismaClient();

const USER_SELECT = {
  id: true, fullName: true, email: true, role: true,
  businessUnit: true, isActive: true, lastLoginAt: true, createdAt: true,
};

export const list = async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 25;
  const where: any = {};
  if (req.query.role) where.role = req.query.role;
  if (req.query.isActive !== undefined) where.isActive = req.query.isActive === 'true';
  if (req.query.search) {
    where.OR = [
      { fullName: { contains: req.query.search as string, mode: 'insensitive' } },
      { email: { contains: req.query.search as string, mode: 'insensitive' } },
    ];
  }
  const [data, total] = await Promise.all([
    prisma.user.findMany({ where, select: USER_SELECT, orderBy: { fullName: 'asc' }, skip: (page - 1) * limit, take: limit }),
    prisma.user.count({ where }),
  ]);
  sendPaginated(res, data, total, page, limit);
};

export const create = async (req: AuthRequest, res: Response) => {
  const { password, ...rest } = req.body;
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { ...rest, passwordHash }, select: USER_SELECT });
  sendSuccess(res, user, 'User created', 201);
};

export const getById = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: USER_SELECT });
  if (!user) return sendError(res, 'User not found', 404);
  sendSuccess(res, user);
};

export const update = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.update({ where: { id: req.params.id }, data: req.body, select: USER_SELECT });
  sendSuccess(res, user, 'User updated');
};

export const deactivate = async (req: AuthRequest, res: Response) => {
  await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } });
  sendSuccess(res, null, 'User deactivated');
};

export const resetPassword = async (req: AuthRequest, res: Response) => {
  const passwordHash = await hashPassword(req.body.password);
  await prisma.user.update({
    where: { id: req.params.id },
    data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
  });
  sendSuccess(res, null, 'Password reset successfully');
};
