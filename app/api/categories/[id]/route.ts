import { CategoriesService } from '@/modules/categories/service/categories.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';
import { updateCategorySchema } from '@/modules/categories/schema/categories.schema';
import { ApiResponse } from '@/core/responses';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await getCurrentUser();
    const categoriesService = new CategoriesService();
    const result = await categoriesService.getById(id, userId);
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
    const validatedData = updateCategorySchema.parse(body);

    const categoriesService = new CategoriesService();
    const result = await categoriesService.update(id, userId, validatedData);
    return ApiResponse.success(result, 'Category updated successfully');
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
    return ApiResponse.success(null, 'Category soft-deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
