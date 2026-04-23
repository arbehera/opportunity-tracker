"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.refreshToken = exports.login = void 0;
const client_1 = require("@prisma/client");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const prisma = new client_1.PrismaClient();
const login = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive)
        throw { status: 401, message: 'Invalid credentials' };
    // Check lock
    if (user.lockedUntil && user.lockedUntil > new Date()) {
        throw { status: 423, message: 'Account locked. Try again later.' };
    }
    const valid = await (0, password_1.comparePassword)(password, user.passwordHash);
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
        accessToken: (0, jwt_1.generateAccessToken)(payload),
        refreshToken: (0, jwt_1.generateRefreshToken)(payload),
        user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, businessUnit: user.businessUnit },
    };
};
exports.login = login;
const refreshToken = async (token) => {
    try {
        const payload = (0, jwt_1.verifyRefreshToken)(token);
        const user = await prisma.user.findUnique({ where: { id: payload.id } });
        if (!user || !user.isActive)
            throw new Error('User not found');
        const newPayload = { id: user.id, email: user.email, role: user.role };
        return {
            accessToken: (0, jwt_1.generateAccessToken)(newPayload),
            refreshToken: (0, jwt_1.generateRefreshToken)(newPayload),
        };
    }
    catch {
        throw { status: 401, message: 'Invalid refresh token' };
    }
};
exports.refreshToken = refreshToken;
const getMe = async (userId) => {
    return prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, fullName: true, email: true, role: true, businessUnit: true, isActive: true, lastLoginAt: true, createdAt: true },
    });
};
exports.getMe = getMe;
