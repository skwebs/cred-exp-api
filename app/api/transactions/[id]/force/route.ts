import { TransactionsService } from '@/modules/transactions/service/transactions.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';
import { ApiResponse } from '@/core/responses';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await getCurrentUser();
    const service = new TransactionsService();
    await service.forceDelete(id, userId);
    return ApiResponse.success(null, 'Transaction permanently deleted');
  } catch (error) {
    return handleApiError(error);
  }
}
