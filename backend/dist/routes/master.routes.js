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
const express_1 = require("express");
const ctrl = __importStar(require("../controllers/master.controller"));
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const router = (0, express_1.Router)();
const adminOnly = (0, rbac_middleware_1.requireRoles)('ADMIN');
router.get('/customers', ctrl.customers.list);
router.post('/customers', adminOnly, ctrl.customers.create);
router.put('/customers/:id', adminOnly, ctrl.customers.update);
router.delete('/customers/:id', adminOnly, ctrl.customers.remove);
router.get('/product-categories', ctrl.productCategories.list);
router.post('/product-categories', adminOnly, ctrl.productCategories.create);
router.put('/product-categories/:id', adminOnly, ctrl.productCategories.update);
router.delete('/product-categories/:id', adminOnly, ctrl.productCategories.remove);
router.get('/product-subcategories', ctrl.productSubcategories.list);
router.post('/product-subcategories', adminOnly, ctrl.productSubcategories.create);
router.put('/product-subcategories/:id', adminOnly, ctrl.productSubcategories.update);
router.delete('/product-subcategories/:id', adminOnly, ctrl.productSubcategories.remove);
router.get('/business-categories', ctrl.businessCategories.list);
router.post('/business-categories', adminOnly, ctrl.businessCategories.create);
router.put('/business-categories/:id', adminOnly, ctrl.businessCategories.update);
router.delete('/business-categories/:id', adminOnly, ctrl.businessCategories.remove);
router.get('/business-units', ctrl.businessUnits.list);
router.post('/business-units', adminOnly, ctrl.businessUnits.create);
router.put('/business-units/:id', adminOnly, ctrl.businessUnits.update);
router.delete('/business-units/:id', adminOnly, ctrl.businessUnits.remove);
router.get('/deal-stages', ctrl.dealStages.list);
router.post('/deal-stages', adminOnly, ctrl.dealStages.create);
router.put('/deal-stages/:id', adminOnly, ctrl.dealStages.update);
router.delete('/deal-stages/:id', adminOnly, ctrl.dealStages.remove);
router.get('/confidence-levels', ctrl.confidenceLevels.list);
router.post('/confidence-levels', adminOnly, ctrl.confidenceLevels.create);
router.put('/confidence-levels/:id', adminOnly, ctrl.confidenceLevels.update);
router.delete('/confidence-levels/:id', adminOnly, ctrl.confidenceLevels.remove);
exports.default = router;
