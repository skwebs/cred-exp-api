import { CategoriesService } from '@/modules/categories/service/categories.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';
import { createCategorySchema } from '@/modules/categories/schema/categories.schema';
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

    const categoriesService = new CategoriesService();
    const { data, total } = await categoriesService.getAll(userId, { 
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
    const validatedData = createCategorySchema.parse(body);

    const categoriesService = new CategoriesService();
    const result = await categoriesService.create(userId, validatedData);
    return ApiResponse.success(result, 'Category created successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
