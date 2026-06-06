import { ReportsService } from '@/modules/reports/service/reports.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';

export async function GET() {
  try {
    const { userId } = await getCurrentUser();
    const service = new ReportsService();
    const result = await service.getBillHistory(userId);
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
