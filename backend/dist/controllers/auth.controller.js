"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.forgotPassword = exports.refresh = exports.logout = exports.login = void 0;
const AuthService = __importStar(require("../services/auth.service"));
const response_1 = require("../utils/response");
const login = async (req, res) => {
    const result = await AuthService.login(req.body.email, req.body.password);
    (0, response_1.sendSuccess)(res, result, 'Login successful');
};
exports.login = login;
const logout = async (_req, res) => {
    (0, response_1.sendSuccess)(res, null, 'Logged out successfully');
};
exports.logout = logout;
const refresh = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken)
        return (0, response_1.sendError)(res, 'Refresh token required', 400);
    const result = await AuthService.refreshToken(refreshToken);
    (0, response_1.sendSuccess)(res, result, 'Token refreshed');
};
exports.refresh = refresh;
const forgotPassword = async (_req, res) => {
    (0, response_1.sendSuccess)(res, null, 'If that email exists, a reset link has been sent');
};
exports.forgotPassword = forgotPassword;
const getMe = async (req, res) => {
    const user = await AuthService.getMe(req.user.id);
    (0, response_1.sendSuccess)(res, user);
};
exports.getMe = getMe;
