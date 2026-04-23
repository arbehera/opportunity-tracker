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
exports.exportExcel = exports.getHistory = exports.softDelete = exports.update = exports.getById = exports.create = exports.list = void 0;
const OppService = __importStar(require("../services/opportunity.service"));
const response_1 = require("../utils/response");
const list = async (req, res) => {
    const result = await OppService.list(req.query);
    (0, response_1.sendPaginated)(res, result.data, result.total, result.page, result.limit);
};
exports.list = list;
const create = async (req, res) => {
    const opp = await OppService.create(req.body, req.user.id);
    (0, response_1.sendSuccess)(res, opp, 'Opportunity created', 201);
};
exports.create = create;
const getById = async (req, res) => {
    const opp = await OppService.getById(req.params.id);
    (0, response_1.sendSuccess)(res, opp);
};
exports.getById = getById;
const update = async (req, res) => {
    const opp = await OppService.update(req.params.id, req.body, req.user.id);
    (0, response_1.sendSuccess)(res, opp, 'Opportunity updated');
};
exports.update = update;
const softDelete = async (req, res) => {
    await OppService.softDelete(req.params.id);
    (0, response_1.sendSuccess)(res, null, 'Opportunity deleted');
};
exports.softDelete = softDelete;
const getHistory = async (req, res) => {
    const history = await OppService.getHistory(req.params.id);
    (0, response_1.sendSuccess)(res, history);
};
exports.getHistory = getHistory;
const exportExcel = async (req, res) => {
    const buffer = await OppService.exportToExcel(req.query);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="opportunities.xlsx"');
    res.send(buffer);
};
exports.exportExcel = exportExcel;
