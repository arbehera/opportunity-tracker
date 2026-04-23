"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.notificationService = {
    async getForUser(userId) {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    },
    async markRead(id, userId) {
        const n = await prisma.notification.findFirst({ where: { id, userId } });
        if (!n)
            throw Object.assign(new Error('Notification not found'), { status: 404 });
        return prisma.notification.update({ where: { id }, data: { isRead: true } });
    },
    async markAllRead(userId) {
        await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
    },
    async create(userId, message, entity, entityId) {
        return prisma.notification.create({ data: { userId, message, entity, entityId } });
    },
};
