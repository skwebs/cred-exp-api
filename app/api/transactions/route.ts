import { TransactionsService } from '@/modules/transactions/service/transactions.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';
import { createTransactionSchema } from '@/modules/transactions/schema/transactions.schema';

export async function GET(request: Request) {
  try {
    const { userId } = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    
    const query = {
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
      accountId: searchParams.get('accountId'),
      categoryId: searchParams.get('categoryId'),
      billingCycleId: searchParams.get('billingCycleId'),
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
    };

    const service = new TransactionsService();
    const result = await service.getAll(userId, query);
    return Response.json(result);
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
    return Response.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
