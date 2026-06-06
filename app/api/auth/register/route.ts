import { AuthService } from '@/modules/auth/service/auth.service';
import { handleApiError } from '@/core/errors';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authService = new AuthService();
    const result = await authService.register(body);
    return Response.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
