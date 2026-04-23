import { Request, Response } from 'express';
import { userService } from '../services/userService';

export const userController = {
  async getAll(req: Request, res: Response) {
    const data = await userService.getAll(req.query);
    res.json({ success: true, data });
  },
  async getById(req: Request, res: Response) {
    const data = await userService.getById(req.params.id);
    res.json({ success: true, data });
  },
  async create(req: Request, res: Response) {
    const data = await userService.create(req.body);
    res.status(201).json({ success: true, message: 'User created', data });
  },
  async update(req: Request, res: Response) {
    const data = await userService.update(req.params.id, req.body);
    res.json({ success: true, message: 'User updated', data });
  },
  async deactivate(req: Request, res: Response) {
    const data = await userService.deactivate(req.params.id);
    res.json({ success: true, message: 'User deactivated', data });
  },
  async resetPassword(req: Request, res: Response) {
    await userService.resetPassword(req.params.id, req.body.password);
    res.json({ success: true, message: 'Password reset' });
  },
};
