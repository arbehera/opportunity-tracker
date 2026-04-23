import { Router } from 'express';
import { opportunityController } from '../controllers/opportunityController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validation';
import { createOpportunitySchema, updateOpportunitySchema } from '../validators/opportunities';

const router = Router();

router.use(authenticate);

router.get('/', opportunityController.getAll);
router.get('/export/excel', opportunityController.exportExcel);
router.get('/:id', opportunityController.getById);
router.get('/:id/history', opportunityController.getHistory);
router.post(
  '/',
  requireRole('ADMIN', 'MANAGER', 'SALES'),
  validate(createOpportunitySchema),
  opportunityController.create
);
router.put(
  '/:id',
  requireRole('ADMIN', 'MANAGER', 'SALES'),
  validate(updateOpportunitySchema),
  opportunityController.update
);
router.delete('/:id', requireRole('ADMIN', 'MANAGER'), opportunityController.delete);

export default router;
