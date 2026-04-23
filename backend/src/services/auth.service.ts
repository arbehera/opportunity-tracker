import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

const prisma = new PrismaClient();

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) throw { status: 401, message: 'Invalid credentials' };

  // Check lock
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw { status: 423, message: 'Account locked. Try again later.' };
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    const attempts = user.failedLoginAttempts + 1;
    const locked = attempts >= 5;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil: locked ? new Date(Date.now() + 30 * 60 * 1000) : null,
      },
    });
    throw { status: 401, message: locked ? 'Account locked after 5 failed attempts' : 'Invalid credentials' };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });

  const payload = { id: user.id, email: user.email, role: user.role };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, businessUnit: user.businessUnit },
  };
};

export const refreshToken = async (token: string) => {
  try {
    const payload = verifyRefreshToken(token) as { id: string; email: string; role: string };
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || !user.isActive) throw new Error('User not found');
    const newPayload = { id: user.id, email: user.email, role: user.role };
    return {
      accessToken: generateAccessToken(newPayload),
      refreshToken: generateRefreshToken(newPayload),
    };
  } catch {
    throw { status: 401, message: 'Invalid refresh token' };
  }
};

export const getMe = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, email: true, role: true, businessUnit: true, isActive: true, lastLoginAt: true, createdAt: true },
  });
};
