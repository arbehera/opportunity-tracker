"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllRead = exports.markRead = exports.getUserNotifications = exports.createNotification = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createNotification = async (userId, message, entity, entityId) => {
    return prisma.notification.create({ data: { userId, message, entity, entityId } });
};
exports.createNotification = createNotification;
const getUserNotifications = async (userId) => {
    return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });
};
exports.getUserNotifications = getUserNotifications;
const markRead = async (id, userId) => {
    return prisma.notification.updateMany({
        where: { id, userId },
        data: { isRead: true },
    });
};
exports.markRead = markRead;
const markAllRead = async (userId) => {
    return prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
    });
};
exports.markAllRead = markAllRead;
