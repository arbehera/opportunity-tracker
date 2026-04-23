import { Request, Response } from 'express';
import { authService } from '../services/authService';

export const authController = {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    res.json({ success: true, message: 'Login successful', data });
  },

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;
    const data = await authService.refresh(refreshToken);
    res.json({ success: true, message: 'Token refreshed', data });
  },

  async logout(req: Request, res: Response) {
    res.json({ success: true, message: 'Logged out' });
  },

  async forgotPassword(req: Request, res: Response) {
    // In production: send reset email
    res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
  },

  async resetPassword(req: Request, res: Response) {
    res.json({ success: true, message: 'Password reset is not enabled in this environment' });
  },
};
