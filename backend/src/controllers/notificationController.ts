import { Request, Response } from 'express';
import { notificationService } from '../services/notificationService';

export const notificationController = {
  async getAll(req: Request, res: Response) {
    const data = await notificationService.getForUser(req.user!.userId);
    res.json({ success: true, data });
  },
  async markRead(req: Request, res: Response) {
    const data = await notificationService.markRead(req.params.id, req.user!.userId);
    res.json({ success: true, data });
  },
  async markAllRead(req: Request, res: Response) {
    await notificationService.markAllRead(req.user!.userId);
    res.json({ success: true, message: 'All notifications marked as read' });
  },
};
