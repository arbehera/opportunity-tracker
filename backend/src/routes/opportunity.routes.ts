import { Router } from 'express';
import * as ctrl from '../controllers/opportunity.controller';
import { validate } from '../middleware/validate.middleware';
import { requireRoles } from '../middleware/rbac.middleware';
import { createOpportunitySchema, updateOpportunitySchema } from '../validators/opportunity.validator';

const router = Router();
router.get('/export/excel', ctrl.exportExcel);
router.get('/', ctrl.list);
router.post('/', requireRoles('ADMIN', 'MANAGER', 'SALES'), validate(createOpportunitySchema), ctrl.create);
router.get('/:id', ctrl.getById);
router.put('/:id', requireRoles('ADMIN', 'MANAGER', 'SALES'), validate(updateOpportunitySchema), ctrl.update);
router.delete('/:id', requireRoles('ADMIN'), ctrl.softDelete);
router.get('/:id/history', ctrl.getHistory);
export default router;
