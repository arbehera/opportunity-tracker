import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as DocService from '../services/document.service';
import * as SPService from '../services/sharepoint.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export const list = async (req: AuthRequest, res: Response) => {
  const result = await DocService.list(req.query);
  sendPaginated(res, result.data, result.total, result.page, result.limit);
};

export const create = async (req: AuthRequest, res: Response) => {
  const doc = await DocService.create(req.body, req.user!.id);
  sendSuccess(res, doc, 'Document added', 201);
};

export const getById = async (req: AuthRequest, res: Response) => {
  const doc = await DocService.getById(req.params.id);
  sendSuccess(res, doc);
};

export const update = async (req: AuthRequest, res: Response) => {
  const doc = await DocService.update(req.params.id, req.body);
  sendSuccess(res, doc, 'Document updated');
};

export const remove = async (req: AuthRequest, res: Response) => {
  await DocService.remove(req.params.id);
  sendSuccess(res, null, 'Document deleted');
};

export const logAccess = async (req: AuthRequest, res: Response) => {
  await DocService.logAccess(req.params.id, req.user!.id, req.body.action);
  sendSuccess(res, null, 'Access logged');
};

export const getAccessLog = async (req: AuthRequest, res: Response) => {
  const doc = await DocService.getById(req.params.id);
  sendSuccess(res, (doc as any).accessLogs || []);
};

export const browseSP = async (req: AuthRequest, res: Response) => {
  const result = await SPService.browseLibrary(
    (req.query.library as string) || 'Documents',
    (req.query.folder as string) || ''
  );
  sendSuccess(res, result);
};
