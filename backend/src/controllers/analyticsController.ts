import { Request, Response } from 'express';
import { analyticsService } from '../services/analyticsService';

export const analyticsController = {
  async dashboard(req: Request, res: Response) {
    const data = await analyticsService.getDashboardSummary(req.query);
    res.json({ success: true, data });
  },
  async category(req: Request, res: Response) {
    const data = await analyticsService.getCategoryAnalytics(req.query);
    res.json({ success: true, data });
  },
  async subcategory(req: Request, res: Response) {
    const data = await analyticsService.getSubcategoryAnalytics(req.query);
    res.json({ success: true, data });
  },
  async subcategoryBU(req: Request, res: Response) {
    const data = await analyticsService.getSubcategoryByBUAnalytics(req.query);
    res.json({ success: true, data });
  },
  async confidence(req: Request, res: Response) {
    const data = await analyticsService.getConfidenceAnalytics(req.query);
    res.json({ success: true, data });
  },
  async bu(req: Request, res: Response) {
    const data = await analyticsService.getBUAnalytics(req.query);
    res.json({ success: true, data });
  },
  async stage(req: Request, res: Response) {
    const data = await analyticsService.getStageAnalytics(req.query);
    res.json({ success: true, data });
  },
  async customer(req: Request, res: Response) {
    const data = await analyticsService.getCustomerAnalytics(req.query);
    res.json({ success: true, data });
  },
  async customerCategory(req: Request, res: Response) {
    const data = await analyticsService.getCustomerCategoryAnalytics(req.query);
    res.json({ success: true, data });
  },
  async team(req: Request, res: Response) {
    const data = await analyticsService.getTeamAnalytics(req.query);
    res.json({ success: true, data });
  },
  async count(req: Request, res: Response) {
    const data = await analyticsService.getCountAnalytics(req.query);
    res.json({ success: true, data });
  },
  async charts(req: Request, res: Response) {
    const data = await analyticsService.getDashboardCharts(req.query);
    res.json({ success: true, data });
  },
};
