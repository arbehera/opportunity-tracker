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
exports.browseSP = exports.getAccessLog = exports.logAccess = exports.remove = exports.update = exports.getById = exports.create = exports.list = void 0;
const DocService = __importStar(require("../services/document.service"));
const SPService = __importStar(require("../services/sharepoint.service"));
const response_1 = require("../utils/response");
const list = async (req, res) => {
    const result = await DocService.list(req.query);
    (0, response_1.sendPaginated)(res, result.data, result.total, result.page, result.limit);
};
exports.list = list;
const create = async (req, res) => {
    const doc = await DocService.create(req.body, req.user.id);
    (0, response_1.sendSuccess)(res, doc, 'Document added', 201);
};
exports.create = create;
const getById = async (req, res) => {
    const doc = await DocService.getById(req.params.id);
    (0, response_1.sendSuccess)(res, doc);
};
exports.getById = getById;
const update = async (req, res) => {
    const doc = await DocService.update(req.params.id, req.body);
    (0, response_1.sendSuccess)(res, doc, 'Document updated');
};
exports.update = update;
const remove = async (req, res) => {
    await DocService.remove(req.params.id);
    (0, response_1.sendSuccess)(res, null, 'Document deleted');
};
exports.remove = remove;
const logAccess = async (req, res) => {
    await DocService.logAccess(req.params.id, req.user.id, req.body.action);
    (0, response_1.sendSuccess)(res, null, 'Access logged');
};
exports.logAccess = logAccess;
const getAccessLog = async (req, res) => {
    const doc = await DocService.getById(req.params.id);
    (0, response_1.sendSuccess)(res, doc.accessLogs || []);
};
exports.getAccessLog = getAccessLog;
const browseSP = async (req, res) => {
    const result = await SPService.browseLibrary(req.query.library || 'Documents', req.query.folder || '');
    (0, response_1.sendSuccess)(res, result);
};
exports.browseSP = browseSP;
