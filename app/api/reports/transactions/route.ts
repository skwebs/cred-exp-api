import { ReportsService } from '@/modules/reports/service/reports.service';
import { handleApiError } from '@/core/errors';
import { getCurrentUser } from '@/core/auth';

export async function GET(request: Request) {
  try {
    const { userId } = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    
    const query = {
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
      month: searchParams.get('month'),
      accountId: searchParams.get('accountId'),
      cardId: searchParams.get('cardId'),
      categoryId: searchParams.get('categoryId'),
      billingCycleId: searchParams.get('billingCycleId'),
      transactionKind: searchParams.get('transactionKind'),
    };

    const service = new ReportsService();
    const result = await service.getTransactionTimeline(userId, query);
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
