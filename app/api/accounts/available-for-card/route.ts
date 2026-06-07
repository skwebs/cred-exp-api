import { AccountsService } from '@/modules/accounts/service/accounts.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';

export async function GET() {
  try {
    const { userId } = await getCurrentUser();
    const service = new AccountsService();
    const result = await service.getAvailableForCard(userId);
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
