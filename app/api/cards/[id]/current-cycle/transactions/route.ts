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
    const { searchParams } = new URL(request.url);
    const query = {
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    };

    const service = new ReportsService();
    const result = await service.getCardCurrentCycleTransactions(userId, id, query);
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
