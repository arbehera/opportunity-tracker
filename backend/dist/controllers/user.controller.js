"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.deactivate = exports.update = exports.getById = exports.create = exports.list = void 0;
const client_1 = require("@prisma/client");
const password_1 = require("../utils/password");
const response_1 = require("../utils/response");
const prisma = new client_1.PrismaClient();
const USER_SELECT = {
    id: true, fullName: true, email: true, role: true,
    businessUnit: true, isActive: true, lastLoginAt: true, createdAt: true,
};
const list = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const where = {};
    if (req.query.role)
        where.role = req.query.role;
    if (req.query.isActive !== undefined)
        where.isActive = req.query.isActive === 'true';
    if (req.query.search) {
        where.OR = [
            { fullName: { contains: req.query.search, mode: 'insensitive' } },
            { email: { contains: req.query.search, mode: 'insensitive' } },
        ];
    }
    const [data, total] = await Promise.all([
        prisma.user.findMany({ where, select: USER_SELECT, orderBy: { fullName: 'asc' }, skip: (page - 1) * limit, take: limit }),
        prisma.user.count({ where }),
    ]);
    (0, response_1.sendPaginated)(res, data, total, page, limit);
};
exports.list = list;
const create = async (req, res) => {
    const { password, ...rest } = req.body;
    const passwordHash = await (0, password_1.hashPassword)(password);
    const user = await prisma.user.create({ data: { ...rest, passwordHash }, select: USER_SELECT });
    (0, response_1.sendSuccess)(res, user, 'User created', 201);
};
exports.create = create;
const getById = async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: USER_SELECT });
    if (!user)
        return (0, response_1.sendError)(res, 'User not found', 404);
    (0, response_1.sendSuccess)(res, user);
};
exports.getById = getById;
const update = async (req, res) => {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: req.body, select: USER_SELECT });
    (0, response_1.sendSuccess)(res, user, 'User updated');
};
exports.update = update;
const deactivate = async (req, res) => {
    await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } });
    (0, response_1.sendSuccess)(res, null, 'User deactivated');
};
exports.deactivate = deactivate;
const resetPassword = async (req, res) => {
    const passwordHash = await (0, password_1.hashPassword)(req.body.password);
    await prisma.user.update({
        where: { id: req.params.id },
        data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
    });
    (0, response_1.sendSuccess)(res, null, 'Password reset successfully');
};
exports.resetPassword = resetPassword;
