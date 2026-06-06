import { z } from 'zod';

export const createAccountSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['cash', 'bank', 'credit_card']),
  balance: z.string().regex(/^\d+(\.\d{1,2})?$/).default('0'),
  currency: z.string().length(3).default('USD'),
});

export const updateAccountSchema = createAccountSchema.partial();