import { TransactionsService } from '@/modules/transactions/service/transactions.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';
import { ApiResponse } from '@/core/responses';

export async function GET(request: Request) {
  try {
    const { userId } = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const query = {
      limit,
      offset,
      accountId: searchParams.get('accountId'),
      categoryId: searchParams.get('categoryId'),
      billingCycleId: searchParams.get('billingCycleId'),
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
      deletedOnly: true,
    };

    const service = new TransactionsService();
    const { data, total } = await service.getAll(userId, query);
    
    const page = Math.floor(offset / limit) + 1;

    return ApiResponse.list(data, {
      page,
      limit,
      total,
      hasNext: offset + limit < total,
    }, 'Deleted transactions retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
