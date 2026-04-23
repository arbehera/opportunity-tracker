import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

const prisma = new PrismaClient();

function formatUser(user: any) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    businessUnit: user.businessUnit,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

export const authService = {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw Object.assign(
        new Error(`Account locked until ${user.lockedUntil.toISOString()}`),
        { status: 423 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      const failedAttempts = user.failedLoginAttempts + 1;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockedUntil: failedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null,
        },
      });
      throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    const payload = { userId: user.id, role: user.role };
    return {
      user: formatUser(user),
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  },

  async refresh(token: string) {
    let payload: any;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw Object.assign(new Error('Invalid refresh token'), { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.isActive) {
      throw Object.assign(new Error('User not found or inactive'), { status: 401 });
    }

    const newPayload = { userId: user.id, role: user.role };
    return {
      accessToken: generateAccessToken(newPayload),
      refreshToken: generateRefreshToken(newPayload),
    };
  },
};
