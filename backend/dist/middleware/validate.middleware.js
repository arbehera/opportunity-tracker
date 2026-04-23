"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const response_1 = require("../utils/response");
const validate = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            const errors = err.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
            return (0, response_1.sendError)(res, 'Validation failed', 422, errors);
        }
        next(err);
    }
};
exports.validate = validate;
