import { Router } from 'express';
import * as ctrl from '../controllers/user.controller';
import { requireRoles } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { createUserSchema, updateUserSchema, resetPasswordSchema } from '../validators/user.validator';

const router = Router();
router.get('/', ctrl.list);
router.post('/', requireRoles('ADMIN'), validate(createUserSchema), ctrl.create);
router.get('/:id', ctrl.getById);
router.put('/:id', requireRoles('ADMIN'), validate(updateUserSchema), ctrl.update);
router.patch('/:id/deactivate', requireRoles('ADMIN'), ctrl.deactivate);
router.post('/:id/reset-password', requireRoles('ADMIN'), validate(resetPasswordSchema), ctrl.resetPassword);
export default router;
