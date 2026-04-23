import { Router } from 'express';
import * as ctrl from '../controllers/document.controller';
import { requireRoles } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { createDocumentSchema, updateDocumentSchema } from '../validators/document.validator';

const router = Router();
router.get('/sharepoint/browse', ctrl.browseSP);
router.get('/', ctrl.list);
router.post('/', validate(createDocumentSchema), ctrl.create);
router.get('/:id', ctrl.getById);
router.put('/:id', validate(updateDocumentSchema), ctrl.update);
router.delete('/:id', requireRoles('ADMIN'), ctrl.remove);
router.get('/:id/access-log', ctrl.getAccessLog);
router.post('/:id/log-access', ctrl.logAccess);
export default router;
