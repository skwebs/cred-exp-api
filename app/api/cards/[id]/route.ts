import { CreditCardsService } from '@/modules/credit-cards/service/credit-cards.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';
import { updateCreditCardSchema } from '@/modules/credit-cards/schema/credit-cards.schema';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await getCurrentUser();
    const service = new CreditCardsService();
    const result = await service.getById(id, userId);
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await getCurrentUser();
    const body = await request.json();
    const validatedData = updateCreditCardSchema.parse(body);

    const service = new CreditCardsService();
    const result = await service.update(id, userId, validatedData);
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await getCurrentUser();
    const service = new CreditCardsService();
    await service.delete(id, userId);
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
