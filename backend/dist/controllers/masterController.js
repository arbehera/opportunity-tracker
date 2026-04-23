"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confidenceLevelController = exports.dealStageController = exports.businessUnitController = exports.businessCategoryController = exports.productSubcategoryController = exports.productCategoryController = exports.customerController = void 0;
const masterService_1 = require("../services/masterService");
function makeController(entity) {
    return {
        async list(req, res) {
            const data = await masterService_1.masterService[entity].list(req.query);
            res.json({ success: true, data });
        },
        async create(req, res) {
            const data = await masterService_1.masterService[entity].create(req.body);
            res.status(201).json({ success: true, data });
        },
        async update(req, res) {
            const data = await masterService_1.masterService[entity].update(req.params.id, req.body);
            res.json({ success: true, data });
        },
        async remove(req, res) {
            await masterService_1.masterService[entity].remove(req.params.id);
            res.json({ success: true, message: 'Deleted' });
        },
    };
}
exports.customerController = makeController('customers');
exports.productCategoryController = makeController('productCategories');
exports.productSubcategoryController = makeController('productSubcategories');
exports.businessCategoryController = makeController('businessCategories');
exports.businessUnitController = makeController('businessUnits');
exports.dealStageController = makeController('dealStages');
exports.confidenceLevelController = makeController('confidenceLevels');
