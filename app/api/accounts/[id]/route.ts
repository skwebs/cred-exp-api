import { AccountsService } from '@/modules/accounts/service/accounts.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';
import { updateAccountSchema } from '@/modules/accounts/schema/accounts.schema';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await getCurrentUser();
    const body = await request.json();
    const validatedData = updateAccountSchema.parse(body);

    const accountsService = new AccountsService();
    const result = await accountsService.update(id, userId, validatedData);
    return Response.json(result);
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
    const accountsService = new AccountsService();
    await accountsService.delete(id, userId);
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
