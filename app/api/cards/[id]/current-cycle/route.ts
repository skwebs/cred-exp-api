import { ReportsService } from '@/modules/reports/service/reports.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await getCurrentUser();
    const service = new ReportsService();
    const result = await service.getCardCurrentCycle(userId, id);
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
