import { z } from 'zod';

export const createCreditCardSchema = z.object({
  accountId: z.string().uuid(),
  cardName: z.string().min(1),
  shortCode: z.string().min(1).max(10),
  bankName: z.string().min(1),
  lastFourDigits: z.string().length(4),
  billingDay: z.number().min(1).max(31),
  gracePeriodDays: z.number().min(0).max(60),
});

export const updateCreditCardSchema = createCreditCardSchema.partial();