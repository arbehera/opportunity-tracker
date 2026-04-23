import { z } from 'zod';

export const createDocumentSchema = z
  .object({
    title: z.string().min(1).max(300),
    documentType: z.enum([
      'PROPOSAL','QUOTATION','CONTRACT','SPECIFICATION','NDA',
      'MEETING_MINUTES','PURCHASE_ORDER','INVOICE',
      'TECHNICAL_DOCUMENT','CORRESPONDENCE','OTHER',
    ]),
    receivedDate: z.string().optional().nullable(),
    receivedById: z.string().uuid().optional().nullable(),
    customerId: z.string().uuid().optional().nullable(),
    opportunityId: z.string().uuid().optional().nullable(),
    sharepointUrl: z.string().url('Must be a valid URL'),
    sharepointFileId: z.string().optional().nullable(),
    sharepointLibrary: z.string().optional().nullable(),
    fileName: z.string().min(1),
    fileSizeKb: z.number().int().positive().optional().nullable(),
    mimeType: z.string().optional().nullable(),
    version: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    tags: z.array(z.string()).default([]),
    isConfidential: z.boolean().default(false),
  })
  .refine((d) => d.customerId || d.opportunityId, {
    message: 'Either customerId or opportunityId is required',
    path: ['customerId'],
  });

export const updateDocumentSchema = createDocumentSchema.partial();
