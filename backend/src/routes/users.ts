import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validation';
import { createUserSchema, updateUserSchema, resetUserPasswordSchema } from '../validators/users';

const router = Router();

router.use(authenticate);

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', requireRole('ADMIN'), validate(createUserSchema), userController.create);
router.put('/:id', requireRole('ADMIN'), validate(updateUserSchema), userController.update);
router.patch('/:id/deactivate', requireRole('ADMIN'), userController.deactivate);
router.post('/:id/reset-password', requireRole('ADMIN'), validate(resetUserPasswordSchema), userController.resetPassword);

export default router;
