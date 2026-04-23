import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FULL_INCLUDE = {
  customer: true,
  opportunity: { select: { id: true, serialNumber: true, description: true } },
  receivedBy: { select: { id: true, fullName: true } },
  uploadedBy: { select: { id: true, fullName: true } },
};

export const list = async (filters: any) => {
  const page = parseInt(filters.page as string) || 1;
  const limit = parseInt(filters.limit as string) || 25;
  const skip = (page - 1) * limit;
  const where: any = {};

  if (filters.customerId) where.customerId = filters.customerId;
  if (filters.opportunityId) where.opportunityId = filters.opportunityId;
  if (filters.documentType) where.documentType = filters.documentType;
  if (filters.search) where.title = { contains: filters.search, mode: 'insensitive' };

  const [data, total] = await Promise.all([
    prisma.document.findMany({
      where,
      include: FULL_INCLUDE,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.document.count({ where }),
  ]);
  return { data, total, page, limit };
};

export const getById = async (id: string) => {
  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      ...FULL_INCLUDE,
      accessLogs: {
        include: { accessedBy: { select: { id: true, fullName: true } } },
        orderBy: { accessedAt: 'desc' },
        take: 50,
      },
    },
  });
  if (!doc) throw { status: 404, message: 'Document not found' };
  return doc;
};

export const create = async (data: any, userId: string) => {
  return prisma.document.create({
    data: { ...data, uploadedById: userId },
    include: FULL_INCLUDE,
  });
};

export const update = async (id: string, data: any) => {
  return prisma.document.update({ where: { id }, data, include: FULL_INCLUDE });
};

export const remove = async (id: string) => {
  return prisma.document.delete({ where: { id } });
};

export const logAccess = async (documentId: string, userId: string, action: any) => {
  return prisma.documentAccessLog.create({
    data: { documentId, accessedById: userId, action },
  });
};
