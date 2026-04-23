import { z } from 'zod';

const docTypes = [
  'PROPOSAL', 'QUOTATION', 'CONTRACT', 'SPECIFICATION', 'NDA',
  'MEETING_MINUTES', 'PURCHASE_ORDER', 'INVOICE', 'TECHNICAL_DOCUMENT',
  'CORRESPONDENCE', 'OTHER',
] as const;

export const createDocumentSchema = z.object({
  title: z.string().min(1).max(300),
  documentType: z.enum(docTypes),
  receivedDate: z.string().optional().nullable(),
  receivedById: z.string().uuid().optional().nullable(),
  customerId: z.string().uuid().optional().nullable(),
  opportunityId: z.string().uuid().optional().nullable(),
  sharepointUrl: z.string().url(),
  sharepointFileId: z.string().optional().nullable(),
  sharepointLibrary: z.string().optional().nullable(),
  fileName: z.string().min(1).max(500),
  fileSizeKb: z.number().int().optional().nullable(),
  mimeType: z.string().max(100).optional().nullable(),
  version: z.string().max(50).optional().nullable(),
  description: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  isConfidential: z.boolean().optional().default(false),
});

export const updateDocumentSchema = createDocumentSchema.partial();
