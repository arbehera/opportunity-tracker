import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess } from '../utils/response';

const prisma = new PrismaClient();

const makeCrud = (model: keyof PrismaClient) => ({
  list: async (_req: Request, res: Response) => {
    const items = await (prisma[model] as any).findMany({ orderBy: { createdAt: 'asc' } });
    sendSuccess(res, items);
  },
  create: async (req: Request, res: Response) => {
    const item = await (prisma[model] as any).create({ data: req.body });
    sendSuccess(res, item, 'Created', 201);
  },
  update: async (req: Request, res: Response) => {
    const item = await (prisma[model] as any).update({ where: { id: req.params.id }, data: req.body });
    sendSuccess(res, item, 'Updated');
  },
  remove: async (req: Request, res: Response) => {
    await (prisma[model] as any).update({ where: { id: req.params.id }, data: { isActive: false } });
    sendSuccess(res, null, 'Deactivated');
  },
});

export const customers = makeCrud('customer' as any);

export const productCategories = makeCrud('productCategory' as any);

export const productSubcategories = {
  ...makeCrud('productSubcategory' as any),
  list: async (_req: Request, res: Response) => {
    const items = await prisma.productSubcategory.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    });
    sendSuccess(res, items);
  },
};

export const businessCategories = makeCrud('businessCategory' as any);

export const businessUnits = makeCrud('businessUnit' as any);

export const dealStages = {
  ...makeCrud('dealStage' as any),
  list: async (_req: Request, res: Response) => {
    const items = await prisma.dealStage.findMany({ orderBy: { sortOrder: 'asc' } });
    sendSuccess(res, items);
  },
};

export const confidenceLevels = {
  ...makeCrud('confidenceLevel' as any),
  list: async (_req: Request, res: Response) => {
    const items = await prisma.confidenceLevel.findMany({ orderBy: { sortOrder: 'asc' } });
    sendSuccess(res, items);
  },
};
