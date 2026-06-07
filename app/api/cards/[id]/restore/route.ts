import { CreditCardsService } from '@/modules/credit-cards/service/credit-cards.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';
import { ApiResponse } from '@/core/responses';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await getCurrentUser();
    const service = new CreditCardsService();
    await service.restore(id, userId);
    return ApiResponse.success(null, 'Credit card restored successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
