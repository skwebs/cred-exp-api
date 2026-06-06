import { CategoriesService } from '@/modules/categories/service/categories.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';
import { updateCategorySchema } from '@/modules/categories/schema/categories.schema';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await getCurrentUser();
    const body = await request.json();
    const validatedData = updateCategorySchema.parse(body);

    const categoriesService = new CategoriesService();
    const result = await categoriesService.update(id, userId, validatedData);
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
    const categoriesService = new CategoriesService();
    await categoriesService.delete(id, userId);
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
