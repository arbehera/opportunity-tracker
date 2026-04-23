import { Router } from 'express';
import * as ctrl from '../controllers/analytics.controller';

const router = Router();
router.get('/summary', ctrl.summary);
router.get('/category', ctrl.categoryWise);
router.get('/subcategory', ctrl.subcategoryWise);
router.get('/subcategory-bu', ctrl.subcategoryByBU);
router.get('/confidence', ctrl.confidenceLevel);
router.get('/bu', ctrl.buWise);
router.get('/stage', ctrl.stageWise);
router.get('/customer', ctrl.customerWise);
router.get('/customer-category', ctrl.customerByCategory);
router.get('/team', ctrl.teamMembers);
router.get('/count', ctrl.opportunityCount);
export default router;
