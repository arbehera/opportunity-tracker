import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as Analytics from '../services/analytics.service';
import { sendSuccess } from '../utils/response';

export const summary = async (req: AuthRequest, res: Response) =>
  sendSuccess(res, await Analytics.getDashboardSummary(req.query));

export const categoryWise = async (req: AuthRequest, res: Response) =>
  sendSuccess(res, await Analytics.getCategoryWise(req.query));

export const subcategoryWise = async (req: AuthRequest, res: Response) =>
  sendSuccess(res, await Analytics.getSubcategoryWise(req.query));

export const subcategoryByBU = async (req: AuthRequest, res: Response) =>
  sendSuccess(res, await Analytics.getSubcategoryByBU(req.query));

export const confidenceLevel = async (req: AuthRequest, res: Response) =>
  sendSuccess(res, await Analytics.getConfidenceLevel(req.query));

export const buWise = async (req: AuthRequest, res: Response) =>
  sendSuccess(res, await Analytics.getBUWise(req.query));

export const stageWise = async (req: AuthRequest, res: Response) =>
  sendSuccess(res, await Analytics.getStageWise(req.query));

export const customerWise = async (req: AuthRequest, res: Response) =>
  sendSuccess(res, await Analytics.getCustomerWise(req.query));

export const customerByCategory = async (req: AuthRequest, res: Response) =>
  sendSuccess(res, await Analytics.getCustomerByCategory(req.query));

export const teamMembers = async (req: AuthRequest, res: Response) =>
  sendSuccess(res, await Analytics.getTeamMembers(req.query));

export const opportunityCount = async (req: AuthRequest, res: Response) =>
  sendSuccess(res, await Analytics.getOpportunityCount(req.query));
