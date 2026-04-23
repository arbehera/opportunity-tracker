"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const routes_1 = require("./routes");
const errorHandler_1 = require("./middleware/errorHandler");
// BigInt JSON serialization support
BigInt.prototype.toJSON = function () {
    return this.toString();
};
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3001', 10);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use('/api/v1', routes_1.router);
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}/api/v1`);
});
exports.default = app;
