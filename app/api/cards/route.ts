import { CreditCardsService } from '@/modules/credit-cards/service/credit-cards.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';
import { createCreditCardSchema } from '@/modules/credit-cards/schema/credit-cards.schema';

export async function GET() {
  try {
    const { userId } = await getCurrentUser();
    const service = new CreditCardsService();
    const result = await service.getAll(userId);
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await getCurrentUser();
    const body = await request.json();
    const validatedData = createCreditCardSchema.parse(body);

    const service = new CreditCardsService();
    const result = await service.create(userId, validatedData);
    return Response.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
