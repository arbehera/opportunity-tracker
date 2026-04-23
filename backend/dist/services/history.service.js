"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordChanges = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const TRACKED_FIELDS = [
    'customerId', 'description', 'businessUnitId', 'productCategoryId',
    'productSubcategoryId', 'businessCategoryId', 'pinSalesId', 'pinPresalesId',
    'dealStageId', 'confidenceLevelId', 'estimatedClosureDate', 'lifetimeVolume',
    'unitPriceInr', 'unitPriceUsd', 'comments', 'pms', 'remarks',
];
const recordChanges = async (opportunityId, userId, oldRecord, newRecord, changeNote) => {
    const entries = [];
    for (const field of TRACKED_FIELDS) {
        const oldVal = oldRecord[field] !== null && oldRecord[field] !== undefined
            ? String(oldRecord[field])
            : null;
        const newVal = newRecord[field] !== null && newRecord[field] !== undefined
            ? String(newRecord[field])
            : null;
        if (oldVal !== newVal) {
            entries.push({
                opportunityId,
                changedById: userId,
                fieldName: field,
                oldValue: oldVal,
                newValue: newVal,
                changeNote: changeNote ?? null,
            });
        }
    }
    if (entries.length > 0) {
        await prisma.opportunityHistory.createMany({ data: entries });
    }
};
exports.recordChanges = recordChanges;
