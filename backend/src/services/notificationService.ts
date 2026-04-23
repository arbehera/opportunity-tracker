import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const notificationService = {
  async getForUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },

  async markRead(id: string, userId: string) {
    const n = await prisma.notification.findFirst({ where: { id, userId } });
    if (!n) throw Object.assign(new Error('Notification not found'), { status: 404 });
    return prisma.notification.update({ where: { id }, data: { isRead: true } });
  },

  async markAllRead(userId: string) {
    await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  },

  async create(userId: string, message: string, entity: string, entityId?: string) {
    return prisma.notification.create({ data: { userId, message, entity, entityId } });
  },
};
