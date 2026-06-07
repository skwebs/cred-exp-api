import { CategoriesService } from '@/modules/categories/service/categories.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';
import { ApiResponse } from '@/core/responses';

export async function GET(request: Request) {
  try {
    const { userId } = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';

    const categoriesService = new CategoriesService();
    const { data, total } = await categoriesService.getAll(userId, { 
      limit, 
      offset, 
      search,
      deletedOnly: true
    });

    const page = Math.floor(offset / limit) + 1;

    return ApiResponse.list(data, {
      page,
      limit,
      total,
      hasNext: offset + limit < total,
    }, 'Deleted categories retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
