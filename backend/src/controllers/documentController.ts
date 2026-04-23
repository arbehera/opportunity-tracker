import { Request, Response } from 'express';
import { documentService } from '../services/documentService';

export const documentController = {
  async getAll(req: Request, res: Response) {
    const data = await documentService.getAll(req.query);
    res.json({ success: true, data });
  },
  async getById(req: Request, res: Response) {
    const data = await documentService.getById(req.params.id);
    res.json({ success: true, data });
  },
  async create(req: Request, res: Response) {
    const data = await documentService.create(req.body, req.user!.userId);
    res.status(201).json({ success: true, message: 'Document created', data });
  },
  async update(req: Request, res: Response) {
    const data = await documentService.update(req.params.id, req.body);
    res.json({ success: true, message: 'Document updated', data });
  },
  async delete(req: Request, res: Response) {
    await documentService.delete(req.params.id);
    res.json({ success: true, message: 'Document deleted' });
  },
  async logAccess(req: Request, res: Response) {
    await documentService.logAccess(req.params.id, req.user!.userId, req.body.action);
    res.json({ success: true, message: 'Access logged' });
  },
  async browseSP(req: Request, res: Response) {
    // SharePoint integration placeholder
    if (!process.env.SHAREPOINT_TENANT_ID) {
      return res.json({ success: true, data: [], message: 'SharePoint not configured' });
    }
    res.json({ success: true, data: [] });
  },
};
