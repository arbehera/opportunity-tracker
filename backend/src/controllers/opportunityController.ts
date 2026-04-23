import { Request, Response } from 'express';
import { opportunityService } from '../services/opportunityService';

export const opportunityController = {
  async getAll(req: Request, res: Response) {
    const result = await opportunityService.getAll(req.query);
    res.json(result);
  },

  async getById(req: Request, res: Response) {
    const data = await opportunityService.getById(req.params.id);
    res.json({ success: true, data });
  },

  async create(req: Request, res: Response) {
    const data = await opportunityService.create(req.body, req.user!.userId);
    res.status(201).json({ success: true, message: 'Opportunity created', data });
  },

  async update(req: Request, res: Response) {
    const data = await opportunityService.update(req.params.id, req.body, req.user!.userId);
    res.json({ success: true, message: 'Opportunity updated', data });
  },

  async delete(req: Request, res: Response) {
    await opportunityService.delete(req.params.id, req.user!.userId);
    res.json({ success: true, message: 'Opportunity deleted' });
  },

  async getHistory(req: Request, res: Response) {
    const data = await opportunityService.getHistory(req.params.id);
    res.json({ success: true, data });
  },

  async exportExcel(req: Request, res: Response) {
    const buffer = await opportunityService.exportToExcel(req.query);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=opportunities.xlsx');
    res.send(buffer);
  },
};
