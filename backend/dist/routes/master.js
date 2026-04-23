"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const validation_1 = require("../middleware/validation");
const masterController_1 = require("../controllers/masterController");
const master_1 = require("../validators/master");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const adminOnly = (0, rbac_1.requireRole)('ADMIN');
function crudRoutes(ctrl, createSchema) {
    const r = (0, express_1.Router)({ mergeParams: true });
    r.get('/', ctrl.list);
    r.post('/', adminOnly, (0, validation_1.validate)(createSchema), ctrl.create);
    r.put('/:id', adminOnly, ctrl.update);
    r.delete('/:id', adminOnly, ctrl.remove);
    return r;
}
router.use('/customers', crudRoutes(masterController_1.customerController, master_1.createCustomerSchema));
router.use('/product-categories', crudRoutes(masterController_1.productCategoryController, master_1.createProductCategorySchema));
router.use('/product-subcategories', crudRoutes(masterController_1.productSubcategoryController, master_1.createProductSubcategorySchema));
router.use('/business-categories', crudRoutes(masterController_1.businessCategoryController, master_1.createBusinessCategorySchema));
router.use('/business-units', crudRoutes(masterController_1.businessUnitController, master_1.createBusinessUnitSchema));
router.use('/deal-stages', crudRoutes(masterController_1.dealStageController, master_1.createDealStageSchema));
router.use('/confidence-levels', crudRoutes(masterController_1.confidenceLevelController, master_1.createConfidenceLevelSchema));
exports.default = router;
