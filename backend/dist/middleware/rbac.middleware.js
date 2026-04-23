"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoles = void 0;
const response_1 = require("../utils/response");
const requireRoles = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return (0, response_1.sendError)(res, 'Forbidden: insufficient permissions', 403);
    }
    next();
};
exports.requireRoles = requireRoles;
