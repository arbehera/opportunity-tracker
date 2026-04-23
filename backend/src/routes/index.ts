import { Router } from 'express';
import authRoutes from './auth';
import opportunityRoutes from './opportunities';
import analyticsRoutes from './analytics';
import userRoutes from './users';
import masterRoutes from './master';
import documentRoutes from './documents';
import notificationRoutes from './notifications';

export const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.use('/auth', authRoutes);
router.use('/opportunities', opportunityRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/users', userRoutes);
router.use('/master', masterRoutes);
router.use('/documents', documentRoutes);
router.use('/notifications', notificationRoutes);
