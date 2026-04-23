import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { loginSchema, forgotPasswordSchema } from '../validators/auth.validator';

const router = Router();
router.post('/login', validate(loginSchema), ctrl.login);
router.post('/logout', ctrl.logout);
router.post('/refresh', ctrl.refresh);
router.post('/forgot-password', validate(forgotPasswordSchema), ctrl.forgotPassword);
router.get('/me', authenticate, ctrl.getMe);
export default router;
