import { AccountsService } from '@/modules/accounts/service/accounts.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';
import { ApiResponse } from '@/core/responses';

export async function GET(request: Request) {
  try {
    const { userId } = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';

    const accountsService = new AccountsService();
    const { data, total } = await accountsService.getAll(userId, { 
      limit, 
      offset, 
      search, 
      deletedOnly: true 
    });

    const page = Math.floor(offset / limit) + 1;
    
    return ApiResponse.list(data, {
      page,
      limit,
      total,
      hasNext: offset + limit < total,
    }, 'Deleted accounts retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
