import { CategoriesService } from '@/modules/categories/service/categories.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';
import { ApiResponse } from '@/core/responses';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await getCurrentUser();
    const categoriesService = new CategoriesService();
    await categoriesService.restore(id, userId);
    return ApiResponse.success(null, 'Category restored successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
