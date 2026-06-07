import { TransactionsService } from '@/modules/transactions/service/transactions.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';
import { createTransactionSchema } from '@/modules/transactions/schema/transactions.schema';
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
      includeDeleted: searchParams.get('includeDeleted') === 'true',
      deletedOnly: searchParams.get('deletedOnly') === 'true',
    };

    const service = new TransactionsService();
    const { data, total } = await service.getAll(userId, query);
    
    const page = Math.floor(offset / limit) + 1;

    return ApiResponse.list(data, {
      page,
      limit,
      total,
      hasNext: offset + limit < total,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await getCurrentUser();
    const body = await request.json();
    const validatedData = createTransactionSchema.parse(body);

    const service = new TransactionsService();
    const result = await service.create(userId, {
      ...validatedData,
      transactionDatetime: new Date(validatedData.transactionDatetime),
      settlementDate: validatedData.settlementDate ? new Date(validatedData.settlementDate) : undefined,
    });
    return ApiResponse.success(result, 'Transaction created successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
