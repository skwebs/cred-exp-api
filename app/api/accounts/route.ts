import { AccountsService } from '@/modules/accounts/service/accounts.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';
import { createAccountSchema } from '@/modules/accounts/schema/accounts.schema';

export async function GET(request: Request) {
  try {
    const { userId } = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';

    const accountsService = new AccountsService();
    const result = await accountsService.getAll(userId, { limit, offset, search });
    return Response.json(result);
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
    return Response.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
