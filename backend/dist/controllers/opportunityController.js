"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opportunityController = void 0;
const opportunityService_1 = require("../services/opportunityService");
exports.opportunityController = {
    async getAll(req, res) {
        const result = await opportunityService_1.opportunityService.getAll(req.query);
        res.json(result);
    },
    async getById(req, res) {
        const data = await opportunityService_1.opportunityService.getById(req.params.id);
        res.json({ success: true, data });
    },
    async create(req, res) {
        const data = await opportunityService_1.opportunityService.create(req.body, req.user.userId);
        res.status(201).json({ success: true, message: 'Opportunity created', data });
    },
    async update(req, res) {
        const data = await opportunityService_1.opportunityService.update(req.params.id, req.body, req.user.userId);
        res.json({ success: true, message: 'Opportunity updated', data });
    },
    async delete(req, res) {
        await opportunityService_1.opportunityService.delete(req.params.id, req.user.userId);
        res.json({ success: true, message: 'Opportunity deleted' });
    },
    async getHistory(req, res) {
        const data = await opportunityService_1.opportunityService.getHistory(req.params.id);
        res.json({ success: true, data });
    },
    async exportExcel(req, res) {
        const buffer = await opportunityService_1.opportunityService.exportToExcel(req.query);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=opportunities.xlsx');
        res.send(buffer);
    },
};
