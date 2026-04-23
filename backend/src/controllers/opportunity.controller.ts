import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as OppService from '../services/opportunity.service';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';

export const list = async (req: AuthRequest, res: Response) => {
  const result = await OppService.list(req.query);
  sendPaginated(res, result.data, result.total, result.page, result.limit);
};

export const create = async (req: AuthRequest, res: Response) => {
  const opp = await OppService.create(req.body, req.user!.id);
  sendSuccess(res, opp, 'Opportunity created', 201);
};

export const getById = async (req: AuthRequest, res: Response) => {
  const opp = await OppService.getById(req.params.id);
  sendSuccess(res, opp);
};

export const update = async (req: AuthRequest, res: Response) => {
  const opp = await OppService.update(req.params.id, req.body, req.user!.id);
  sendSuccess(res, opp, 'Opportunity updated');
};

export const softDelete = async (req: AuthRequest, res: Response) => {
  await OppService.softDelete(req.params.id);
  sendSuccess(res, null, 'Opportunity deleted');
};

export const getHistory = async (req: AuthRequest, res: Response) => {
  const history = await OppService.getHistory(req.params.id);
  sendSuccess(res, history);
};

export const exportExcel = async (req: AuthRequest, res: Response) => {
  const buffer = await OppService.exportToExcel(req.query);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="opportunities.xlsx"');
  res.send(buffer);
};
