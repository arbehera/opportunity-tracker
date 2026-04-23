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
exports.markAllRead = exports.markRead = exports.list = void 0;
const NotifService = __importStar(require("../services/notification.service"));
const response_1 = require("../utils/response");
const list = async (req, res) => {
    const notifs = await NotifService.getUserNotifications(req.user.id);
    (0, response_1.sendSuccess)(res, notifs);
};
exports.list = list;
const markRead = async (req, res) => {
    await NotifService.markRead(req.params.id, req.user.id);
    (0, response_1.sendSuccess)(res, null, 'Marked as read');
};
exports.markRead = markRead;
const markAllRead = async (req, res) => {
    await NotifService.markAllRead(req.user.id);
    (0, response_1.sendSuccess)(res, null, 'All notifications marked as read');
};
exports.markAllRead = markAllRead;
