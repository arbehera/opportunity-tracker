"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const response_1 = require("../utils/response");
const errorMiddleware = (err, req, res, next) => {
    console.error(err);
    if (err instanceof zod_1.ZodError) {
        return (0, response_1.sendError)(res, 'Validation failed', 422, err.errors);
    }
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002')
            return (0, response_1.sendError)(res, 'A record with this value already exists', 409);
        if (err.code === 'P2025')
            return (0, response_1.sendError)(res, 'Record not found', 404);
        if (err.code === 'P2003')
            return (0, response_1.sendError)(res, 'Referenced record does not exist', 400);
    }
    if (err.status)
        return (0, response_1.sendError)(res, err.message, err.status);
    return (0, response_1.sendError)(res, 'Internal server error', 500);
};
exports.errorMiddleware = errorMiddleware;
