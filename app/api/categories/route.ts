import { CategoriesService } from '@/modules/categories/service/categories.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';
import { createCategorySchema } from '@/modules/categories/schema/categories.schema';

export async function GET(request: Request) {
  try {
    const { userId } = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';

    const categoriesService = new CategoriesService();
    const result = await categoriesService.getAll(userId, { limit, offset, search });
    return Response.json(result);
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
    return Response.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
