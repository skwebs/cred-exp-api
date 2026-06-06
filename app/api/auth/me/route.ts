import { AuthService } from '@/modules/auth/service/auth.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';

export async function GET() {
  try {
    const { userId } = await getCurrentUser();
    const authService = new AuthService();
    const result = await authService.getMe(userId);
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
