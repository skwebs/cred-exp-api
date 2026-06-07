import { CreditCardsService } from '@/modules/credit-cards/service/credit-cards.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';
import { createCreditCardSchema } from '@/modules/credit-cards/schema/credit-cards.schema';
import { ApiResponse } from '@/core/responses';

export async function GET(request: Request) {
  try {
    const { userId } = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeDeleted = searchParams.get('includeDeleted') === 'true';
    const deletedOnly = searchParams.get('deletedOnly') === 'true';

    const service = new CreditCardsService();
    const { data, total } = await service.getAll(userId, { 
      limit, 
      offset, 
      includeDeleted, 
      deletedOnly 
    });

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
    const validatedData = createCreditCardSchema.parse(body);

    const service = new CreditCardsService();
    const result = await service.create(userId, validatedData);
    return ApiResponse.success(result, 'Credit card created successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
