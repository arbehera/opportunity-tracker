import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validation';
import {
  customerController,
  productCategoryController,
  productSubcategoryController,
  businessCategoryController,
  businessUnitController,
  dealStageController,
  confidenceLevelController,
} from '../controllers/masterController';
import {
  createCustomerSchema,
  createProductCategorySchema,
  createProductSubcategorySchema,
  createBusinessCategorySchema,
  createBusinessUnitSchema,
  createDealStageSchema,
  createConfidenceLevelSchema,
} from '../validators/master';

const router = Router();
router.use(authenticate);

const adminOnly = requireRole('ADMIN');

function crudRoutes(ctrl: any, createSchema: any) {
  const r = Router({ mergeParams: true });
  r.get('/', ctrl.list);
  r.post('/', adminOnly, validate(createSchema), ctrl.create);
  r.put('/:id', adminOnly, ctrl.update);
  r.delete('/:id', adminOnly, ctrl.remove);
  return r;
}

router.use('/customers', crudRoutes(customerController, createCustomerSchema));
router.use('/product-categories', crudRoutes(productCategoryController, createProductCategorySchema));
router.use('/product-subcategories', crudRoutes(productSubcategoryController, createProductSubcategorySchema));
router.use('/business-categories', crudRoutes(businessCategoryController, createBusinessCategorySchema));
router.use('/business-units', crudRoutes(businessUnitController, createBusinessUnitSchema));
router.use('/deal-stages', crudRoutes(dealStageController, createDealStageSchema));
router.use('/confidence-levels', crudRoutes(confidenceLevelController, createConfidenceLevelSchema));

export default router;
