import { AccountsService } from '@/modules/accounts/service/accounts.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';
import { createAccountSchema } from '@/modules/accounts/schema/accounts.schema';
import { ApiResponse } from '@/core/responses';

export async function GET(request: Request) {
  try {
    const { userId } = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';
    const includeDeleted = searchParams.get('includeDeleted') === 'true';
    const deletedOnly = searchParams.get('deletedOnly') === 'true';

    const accountsService = new AccountsService();
    const { data, total } = await accountsService.getAll(userId, { 
      limit, 
      offset, 
      search, 
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
    const validatedData = createAccountSchema.parse(body);

    const accountsService = new AccountsService();
    const result = await accountsService.create(userId, validatedData);
    return ApiResponse.success(result, 'Account created successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
