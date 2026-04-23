import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TRACKED_FIELDS = [
  'customerId', 'description', 'businessUnitId', 'productCategoryId',
  'productSubcategoryId', 'businessCategoryId', 'pinSalesId', 'pinPresalesId',
  'dealStageId', 'confidenceLevelId', 'estimatedClosureDate', 'lifetimeVolume',
  'unitPriceInr', 'unitPriceUsd', 'comments', 'pms', 'remarks',
];

export const recordChanges = async (
  opportunityId: string,
  userId: string,
  oldRecord: any,
  newRecord: any,
  changeNote?: string
) => {
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
