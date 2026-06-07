import { AccountsService } from '@/modules/accounts/service/accounts.service';
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
    const accountsService = new AccountsService();
    await accountsService.restore(id, userId);
    return ApiResponse.success(null, 'Account restored successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
