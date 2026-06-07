import { CategoriesService } from '@/modules/categories/service/categories.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';
import { ApiResponse } from '@/core/responses';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await getCurrentUser();
    const categoriesService = new CategoriesService();
    await categoriesService.forceDelete(id, userId);
    return ApiResponse.success(null, 'Category permanently deleted');
  } catch (error) {
    return handleApiError(error);
  }
}
