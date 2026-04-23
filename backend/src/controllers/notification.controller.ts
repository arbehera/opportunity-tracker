import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as NotifService from '../services/notification.service';
import { sendSuccess } from '../utils/response';

export const list = async (req: AuthRequest, res: Response) => {
  const notifs = await NotifService.getUserNotifications(req.user!.id);
  sendSuccess(res, notifs);
};

export const markRead = async (req: AuthRequest, res: Response) => {
  await NotifService.markRead(req.params.id, req.user!.id);
  sendSuccess(res, null, 'Marked as read');
};

export const markAllRead = async (req: AuthRequest, res: Response) => {
  await NotifService.markAllRead(req.user!.id);
  sendSuccess(res, null, 'All notifications marked as read');
};
