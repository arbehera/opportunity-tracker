"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = void 0;
const notificationService_1 = require("../services/notificationService");
exports.notificationController = {
    async getAll(req, res) {
        const data = await notificationService_1.notificationService.getForUser(req.user.userId);
        res.json({ success: true, data });
    },
    async markRead(req, res) {
        const data = await notificationService_1.notificationService.markRead(req.params.id, req.user.userId);
        res.json({ success: true, data });
    },
    async markAllRead(req, res) {
        await notificationService_1.notificationService.markAllRead(req.user.userId);
        res.json({ success: true, message: 'All notifications marked as read' });
    },
};
