import { Router } from 'express';
import * as ctrl from '../controllers/notification.controller';

const router = Router();
router.get('/', ctrl.list);
router.patch('/read-all', ctrl.markAllRead);
router.patch('/:id/read', ctrl.markRead);
export default router;
