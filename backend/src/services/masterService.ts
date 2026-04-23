import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const masterService = {
  customers: {
    list: (params?: any) => prisma.customer.findMany({ orderBy: { name: 'asc' } }),
    create: (data: any) => prisma.customer.create({ data }),
    update: (id: string, data: any) => prisma.customer.update({ where: { id }, data }),
    remove: (id: string) => prisma.customer.update({ where: { id }, data: { isActive: false } }),
  },

  productCategories: {
    list: () => prisma.productCategory.findMany({ orderBy: { name: 'asc' } }),
    create: (data: any) => prisma.productCategory.create({ data }),
    update: (id: string, data: any) => prisma.productCategory.update({ where: { id }, data }),
    remove: (id: string) => prisma.productCategory.update({ where: { id }, data: { isActive: false } }),
  },

  productSubcategories: {
    list: (params?: any) =>
      prisma.productSubcategory.findMany({
        include: { category: true },
        where: params?.categoryId ? { categoryId: params.categoryId } : undefined,
        orderBy: { name: 'asc' },
      }),
    create: (data: any) => prisma.productSubcategory.create({ data, include: { category: true } }),
    update: (id: string, data: any) =>
      prisma.productSubcategory.update({ where: { id }, data, include: { category: true } }),
    remove: (id: string) => prisma.productSubcategory.update({ where: { id }, data: { isActive: false } }),
  },

  businessCategories: {
    list: () => prisma.businessCategory.findMany({ orderBy: { name: 'asc' } }),
    create: (data: any) => prisma.businessCategory.create({ data }),
    update: (id: string, data: any) => prisma.businessCategory.update({ where: { id }, data }),
    remove: (id: string) => prisma.businessCategory.update({ where: { id }, data: { isActive: false } }),
  },

  businessUnits: {
    list: () => prisma.businessUnit.findMany({ orderBy: { name: 'asc' } }),
    create: (data: any) => prisma.businessUnit.create({ data }),
    update: (id: string, data: any) => prisma.businessUnit.update({ where: { id }, data }),
    remove: (id: string) => prisma.businessUnit.update({ where: { id }, data: { isActive: false } }),
  },

  dealStages: {
    list: () => prisma.dealStage.findMany({ orderBy: { sortOrder: 'asc' } }),
    create: (data: any) =>
      prisma.dealStage.create({ data: { ...data, winningProbability: data.winningProbability } }),
    update: (id: string, data: any) => prisma.dealStage.update({ where: { id }, data }),
    remove: (id: string) => prisma.dealStage.update({ where: { id }, data: { isActive: false } }),
  },

  confidenceLevels: {
    list: () => prisma.confidenceLevel.findMany({ orderBy: { sortOrder: 'asc' } }),
    create: (data: any) => prisma.confidenceLevel.create({ data }),
    update: (id: string, data: any) => prisma.confidenceLevel.update({ where: { id }, data }),
    remove: (id: string) => prisma.confidenceLevel.delete({ where: { id } }),
  },
};
