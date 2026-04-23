"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsController = void 0;
const analyticsService_1 = require("../services/analyticsService");
exports.analyticsController = {
    async dashboard(req, res) {
        const data = await analyticsService_1.analyticsService.getDashboardSummary(req.query);
        res.json({ success: true, data });
    },
    async category(req, res) {
        const data = await analyticsService_1.analyticsService.getCategoryAnalytics(req.query);
        res.json({ success: true, data });
    },
    async subcategory(req, res) {
        const data = await analyticsService_1.analyticsService.getSubcategoryAnalytics(req.query);
        res.json({ success: true, data });
    },
    async subcategoryBU(req, res) {
        const data = await analyticsService_1.analyticsService.getSubcategoryByBUAnalytics(req.query);
        res.json({ success: true, data });
    },
    async confidence(req, res) {
        const data = await analyticsService_1.analyticsService.getConfidenceAnalytics(req.query);
        res.json({ success: true, data });
    },
    async bu(req, res) {
        const data = await analyticsService_1.analyticsService.getBUAnalytics(req.query);
        res.json({ success: true, data });
    },
    async stage(req, res) {
        const data = await analyticsService_1.analyticsService.getStageAnalytics(req.query);
        res.json({ success: true, data });
    },
    async customer(req, res) {
        const data = await analyticsService_1.analyticsService.getCustomerAnalytics(req.query);
        res.json({ success: true, data });
    },
    async customerCategory(req, res) {
        const data = await analyticsService_1.analyticsService.getCustomerCategoryAnalytics(req.query);
        res.json({ success: true, data });
    },
    async team(req, res) {
        const data = await analyticsService_1.analyticsService.getTeamAnalytics(req.query);
        res.json({ success: true, data });
    },
    async count(req, res) {
        const data = await analyticsService_1.analyticsService.getCountAnalytics(req.query);
        res.json({ success: true, data });
    },
    async charts(req, res) {
        const data = await analyticsService_1.analyticsService.getDashboardCharts(req.query);
        res.json({ success: true, data });
    },
};
