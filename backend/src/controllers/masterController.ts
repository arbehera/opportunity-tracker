import { Request, Response } from 'express';
import { masterService } from '../services/masterService';

type EntityKey = keyof typeof masterService;

function makeController(entity: EntityKey) {
  return {
    async list(req: Request, res: Response) {
      const data = await (masterService[entity] as any).list(req.query);
      res.json({ success: true, data });
    },
    async create(req: Request, res: Response) {
      const data = await (masterService[entity] as any).create(req.body);
      res.status(201).json({ success: true, data });
    },
    async update(req: Request, res: Response) {
      const data = await (masterService[entity] as any).update(req.params.id, req.body);
      res.json({ success: true, data });
    },
    async remove(req: Request, res: Response) {
      await (masterService[entity] as any).remove(req.params.id);
      res.json({ success: true, message: 'Deleted' });
    },
  };
}

export const customerController = makeController('customers');
export const productCategoryController = makeController('productCategories');
export const productSubcategoryController = makeController('productSubcategories');
export const businessCategoryController = makeController('businessCategories');
export const businessUnitController = makeController('businessUnits');
export const dealStageController = makeController('dealStages');
export const confidenceLevelController = makeController('confidenceLevels');
