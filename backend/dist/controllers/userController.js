"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const userService_1 = require("../services/userService");
exports.userController = {
    async getAll(req, res) {
        const data = await userService_1.userService.getAll(req.query);
        res.json({ success: true, data });
    },
    async getById(req, res) {
        const data = await userService_1.userService.getById(req.params.id);
        res.json({ success: true, data });
    },
    async create(req, res) {
        const data = await userService_1.userService.create(req.body);
        res.status(201).json({ success: true, message: 'User created', data });
    },
    async update(req, res) {
        const data = await userService_1.userService.update(req.params.id, req.body);
        res.json({ success: true, message: 'User updated', data });
    },
    async deactivate(req, res) {
        const data = await userService_1.userService.deactivate(req.params.id);
        res.json({ success: true, message: 'User deactivated', data });
    },
    async resetPassword(req, res) {
        await userService_1.userService.resetPassword(req.params.id, req.body.password);
        res.json({ success: true, message: 'Password reset' });
    },
};
