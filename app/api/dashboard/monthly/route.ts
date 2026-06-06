import { ReportsService } from '@/modules/reports/service/reports.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';
import { format } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { userId } = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || format(new Date(), 'yyyy-MM');

    const service = new ReportsService();
    const result = await service.getMonthlyDashboard(userId, month);
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
