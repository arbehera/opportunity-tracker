import { Router } from 'express';
import * as ctrl from '../controllers/master.controller';
import { requireRoles } from '../middleware/rbac.middleware';

const router = Router();
const adminOnly = requireRoles('ADMIN');

router.get('/customers', ctrl.customers.list);
router.post('/customers', adminOnly, ctrl.customers.create);
router.put('/customers/:id', adminOnly, ctrl.customers.update);
router.delete('/customers/:id', adminOnly, ctrl.customers.remove);

router.get('/product-categories', ctrl.productCategories.list);
router.post('/product-categories', adminOnly, ctrl.productCategories.create);
router.put('/product-categories/:id', adminOnly, ctrl.productCategories.update);
router.delete('/product-categories/:id', adminOnly, ctrl.productCategories.remove);

router.get('/product-subcategories', ctrl.productSubcategories.list);
router.post('/product-subcategories', adminOnly, ctrl.productSubcategories.create);
router.put('/product-subcategories/:id', adminOnly, ctrl.productSubcategories.update);
router.delete('/product-subcategories/:id', adminOnly, ctrl.productSubcategories.remove);

router.get('/business-categories', ctrl.businessCategories.list);
router.post('/business-categories', adminOnly, ctrl.businessCategories.create);
router.put('/business-categories/:id', adminOnly, ctrl.businessCategories.update);
router.delete('/business-categories/:id', adminOnly, ctrl.businessCategories.remove);

router.get('/business-units', ctrl.businessUnits.list);
router.post('/business-units', adminOnly, ctrl.businessUnits.create);
router.put('/business-units/:id', adminOnly, ctrl.businessUnits.update);
router.delete('/business-units/:id', adminOnly, ctrl.businessUnits.remove);

router.get('/deal-stages', ctrl.dealStages.list);
router.post('/deal-stages', adminOnly, ctrl.dealStages.create);
router.put('/deal-stages/:id', adminOnly, ctrl.dealStages.update);
router.delete('/deal-stages/:id', adminOnly, ctrl.dealStages.remove);

router.get('/confidence-levels', ctrl.confidenceLevels.list);
router.post('/confidence-levels', adminOnly, ctrl.confidenceLevels.create);
router.put('/confidence-levels/:id', adminOnly, ctrl.confidenceLevels.update);
router.delete('/confidence-levels/:id', adminOnly, ctrl.confidenceLevels.remove);

export default router;
