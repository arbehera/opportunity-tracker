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
exports.opportunityCount = exports.teamMembers = exports.customerByCategory = exports.customerWise = exports.stageWise = exports.buWise = exports.confidenceLevel = exports.subcategoryByBU = exports.subcategoryWise = exports.categoryWise = exports.summary = void 0;
const Analytics = __importStar(require("../services/analytics.service"));
const response_1 = require("../utils/response");
const summary = async (req, res) => (0, response_1.sendSuccess)(res, await Analytics.getDashboardSummary(req.query));
exports.summary = summary;
const categoryWise = async (req, res) => (0, response_1.sendSuccess)(res, await Analytics.getCategoryWise(req.query));
exports.categoryWise = categoryWise;
const subcategoryWise = async (req, res) => (0, response_1.sendSuccess)(res, await Analytics.getSubcategoryWise(req.query));
exports.subcategoryWise = subcategoryWise;
const subcategoryByBU = async (req, res) => (0, response_1.sendSuccess)(res, await Analytics.getSubcategoryByBU(req.query));
exports.subcategoryByBU = subcategoryByBU;
const confidenceLevel = async (req, res) => (0, response_1.sendSuccess)(res, await Analytics.getConfidenceLevel(req.query));
exports.confidenceLevel = confidenceLevel;
const buWise = async (req, res) => (0, response_1.sendSuccess)(res, await Analytics.getBUWise(req.query));
exports.buWise = buWise;
const stageWise = async (req, res) => (0, response_1.sendSuccess)(res, await Analytics.getStageWise(req.query));
exports.stageWise = stageWise;
const customerWise = async (req, res) => (0, response_1.sendSuccess)(res, await Analytics.getCustomerWise(req.query));
exports.customerWise = customerWise;
const customerByCategory = async (req, res) => (0, response_1.sendSuccess)(res, await Analytics.getCustomerByCategory(req.query));
exports.customerByCategory = customerByCategory;
const teamMembers = async (req, res) => (0, response_1.sendSuccess)(res, await Analytics.getTeamMembers(req.query));
exports.teamMembers = teamMembers;
const opportunityCount = async (req, res) => (0, response_1.sendSuccess)(res, await Analytics.getOpportunityCount(req.query));
exports.opportunityCount = opportunityCount;
