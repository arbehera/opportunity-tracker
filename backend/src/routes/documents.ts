import { Router } from 'express';
import { documentController } from '../controllers/documentController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validation';
import { createDocumentSchema, updateDocumentSchema } from '../validators/documents';

const router = Router();
router.use(authenticate);

router.get('/', documentController.getAll);
router.get('/sharepoint/browse', documentController.browseSP);
router.get('/:id', documentController.getById);
router.post('/', validate(createDocumentSchema), documentController.create);
router.put('/:id', validate(updateDocumentSchema), documentController.update);
router.delete('/:id', requireRole('ADMIN', 'MANAGER'), documentController.delete);
router.post('/:id/log-access', documentController.logAccess);

export default router;
