import { TransactionsService } from '@/modules/transactions/service/transactions.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';
import { updateTransactionSchema } from '@/modules/transactions/schema/transactions.schema';
import { ApiResponse } from '@/core/responses';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await getCurrentUser();
    const service = new TransactionsService();
    const result = await service.getById(id, userId);
    return ApiResponse.success(result);
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
    const validatedData = updateTransactionSchema.parse(body);

    const service = new TransactionsService();
    const result = await service.update(id, userId, {
      ...validatedData,
      transactionDatetime: validatedData.transactionDatetime ? new Date(validatedData.transactionDatetime) : undefined,
      settlementDate: validatedData.settlementDate ? new Date(validatedData.settlementDate) : undefined,
    });
    return ApiResponse.success(result, 'Transaction updated successfully');
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
    const service = new TransactionsService();
    await service.delete(id, userId);
    return ApiResponse.success(null, 'Transaction soft-deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
