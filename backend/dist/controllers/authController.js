"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const authService_1 = require("../services/authService");
exports.authController = {
    async login(req, res) {
        const { email, password } = req.body;
        const data = await authService_1.authService.login(email, password);
        res.json({ success: true, message: 'Login successful', data });
    },
    async refresh(req, res) {
        const { refreshToken } = req.body;
        const data = await authService_1.authService.refresh(refreshToken);
        res.json({ success: true, message: 'Token refreshed', data });
    },
    async logout(req, res) {
        res.json({ success: true, message: 'Logged out' });
    },
    async forgotPassword(req, res) {
        // In production: send reset email
        res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
    },
    async resetPassword(req, res) {
        res.json({ success: true, message: 'Password reset is not enabled in this environment' });
    },
};
