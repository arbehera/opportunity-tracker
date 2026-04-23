"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDocumentSchema = exports.createDocumentSchema = void 0;
const zod_1 = require("zod");
exports.createDocumentSchema = zod_1.z
    .object({
    title: zod_1.z.string().min(1).max(300),
    documentType: zod_1.z.enum([
        'PROPOSAL', 'QUOTATION', 'CONTRACT', 'SPECIFICATION', 'NDA',
        'MEETING_MINUTES', 'PURCHASE_ORDER', 'INVOICE',
        'TECHNICAL_DOCUMENT', 'CORRESPONDENCE', 'OTHER',
    ]),
    receivedDate: zod_1.z.string().optional().nullable(),
    receivedById: zod_1.z.string().uuid().optional().nullable(),
    customerId: zod_1.z.string().uuid().optional().nullable(),
    opportunityId: zod_1.z.string().uuid().optional().nullable(),
    sharepointUrl: zod_1.z.string().url('Must be a valid URL'),
    sharepointFileId: zod_1.z.string().optional().nullable(),
    sharepointLibrary: zod_1.z.string().optional().nullable(),
    fileName: zod_1.z.string().min(1),
    fileSizeKb: zod_1.z.number().int().positive().optional().nullable(),
    mimeType: zod_1.z.string().optional().nullable(),
    version: zod_1.z.string().optional().nullable(),
    description: zod_1.z.string().optional().nullable(),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    isConfidential: zod_1.z.boolean().default(false),
})
    .refine((d) => d.customerId || d.opportunityId, {
    message: 'Either customerId or opportunityId is required',
    path: ['customerId'],
});
exports.updateDocumentSchema = exports.createDocumentSchema.partial();
