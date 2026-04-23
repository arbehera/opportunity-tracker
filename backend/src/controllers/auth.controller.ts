import { Request, Response } from 'express';
import * as AuthService from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export const login = async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body.email, req.body.password);
  sendSuccess(res, result, 'Login successful');
};

export const logout = async (_req: Request, res: Response) => {
  sendSuccess(res, null, 'Logged out successfully');
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return sendError(res, 'Refresh token required', 400);
  const result = await AuthService.refreshToken(refreshToken);
  sendSuccess(res, result, 'Token refreshed');
};

export const forgotPassword = async (_req: Request, res: Response) => {
  sendSuccess(res, null, 'If that email exists, a reset link has been sent');
};

export const getMe = async (req: AuthRequest, res: Response) => {
  const user = await AuthService.getMe(req.user!.id);
  sendSuccess(res, user);
};
