import { PaymentsService } from '@/modules/transactions/service/payments.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';
import { z } from 'zod';

const paymentSchema = z.object({
  sourceAccountId: z.string().uuid(),
  creditCardId: z.string().uuid(),
  billingCycleId: z.string().uuid(),
  amount: z.number().positive(),
  transactionDatetime: z.string().datetime(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const { userId } = await getCurrentUser();
    const body = await request.json();
    const validatedData = paymentSchema.parse(body);

    const service = new PaymentsService();
    const result = await service.payCreditCardBill(userId, validatedData);
    return Response.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
