import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/dashboard', analyticsController.dashboard);
router.get('/category', analyticsController.category);
router.get('/subcategory', analyticsController.subcategory);
router.get('/subcategory-bu', analyticsController.subcategoryBU);
router.get('/confidence', analyticsController.confidence);
router.get('/bu', analyticsController.bu);
router.get('/stage', analyticsController.stage);
router.get('/customer', analyticsController.customer);
router.get('/customer-category', analyticsController.customerCategory);
router.get('/team', analyticsController.team);
router.get('/count', analyticsController.count);
router.get('/charts', analyticsController.charts);
router.get('/stale', analyticsController.staleOpportunities);

export default router;
