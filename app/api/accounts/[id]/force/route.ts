import { AccountsService } from '@/modules/accounts/service/accounts.service';
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
    const accountsService = new AccountsService();
    await accountsService.forceDelete(id, userId);
    return ApiResponse.success(null, 'Account permanently deleted');
  } catch (error) {
    return handleApiError(error);
  }
}
