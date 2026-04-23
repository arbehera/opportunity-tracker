"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_1 = require("../utils/jwt");
const prisma = new client_1.PrismaClient();
function formatUser(user) {
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
exports.authService = {
    async login(email, password) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) {
            throw Object.assign(new Error('Invalid credentials'), { status: 401 });
        }
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw Object.assign(new Error(`Account locked until ${user.lockedUntil.toISOString()}`), { status: 423 });
        }
        const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
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
            accessToken: (0, jwt_1.generateAccessToken)(payload),
            refreshToken: (0, jwt_1.generateRefreshToken)(payload),
        };
    },
    async refresh(token) {
        let payload;
        try {
            payload = (0, jwt_1.verifyRefreshToken)(token);
        }
        catch {
            throw Object.assign(new Error('Invalid refresh token'), { status: 401 });
        }
        const user = await prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user || !user.isActive) {
            throw Object.assign(new Error('User not found or inactive'), { status: 401 });
        }
        const newPayload = { userId: user.id, role: user.role };
        return {
            accessToken: (0, jwt_1.generateAccessToken)(newPayload),
            refreshToken: (0, jwt_1.generateRefreshToken)(newPayload),
        };
    },
};
