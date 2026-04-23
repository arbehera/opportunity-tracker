"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentController = void 0;
const documentService_1 = require("../services/documentService");
exports.documentController = {
    async getAll(req, res) {
        const data = await documentService_1.documentService.getAll(req.query);
        res.json({ success: true, data });
    },
    async getById(req, res) {
        const data = await documentService_1.documentService.getById(req.params.id);
        res.json({ success: true, data });
    },
    async create(req, res) {
        const data = await documentService_1.documentService.create(req.body, req.user.userId);
        res.status(201).json({ success: true, message: 'Document created', data });
    },
    async update(req, res) {
        const data = await documentService_1.documentService.update(req.params.id, req.body);
        res.json({ success: true, message: 'Document updated', data });
    },
    async delete(req, res) {
        await documentService_1.documentService.delete(req.params.id);
        res.json({ success: true, message: 'Document deleted' });
    },
    async logAccess(req, res) {
        await documentService_1.documentService.logAccess(req.params.id, req.user.userId, req.body.action);
        res.json({ success: true, message: 'Access logged' });
    },
    async browseSP(req, res) {
        // SharePoint integration placeholder
        if (!process.env.SHAREPOINT_TENANT_ID) {
            return res.json({ success: true, data: [], message: 'SharePoint not configured' });
        }
        res.json({ success: true, data: [] });
    },
};
