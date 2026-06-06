import { z } from 'zod';

export const createTransactionSchema = z.object({
  accountId: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  kind: z.enum(['expense', 'income', 'transfer', 'payment', 'refund']),
  direction: z.enum(['inflow', 'outflow']),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  transactionDatetime: z.string().datetime(),
  settlementDate: z.string().datetime().optional(),
  merchantName: z.string().optional(),
  particulars: z.string().optional(),
  cardStatementReference: z.string().optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();