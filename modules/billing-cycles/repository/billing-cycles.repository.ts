import { db } from '@/lib/database';
import { billingCycles } from '@/lib/database/schema';
import { eq, and, isNull } from 'drizzle-orm';

export class BillingCyclesRepository {
  async findExisting(creditCardId: string, startDate: Date, endDate: Date) {
    return await db.query.billingCycles.findFirst({
      where: and(
        eq(billingCycles.creditCardId, creditCardId),
        eq(billingCycles.startDate, startDate),
        eq(billingCycles.endDate, endDate),
        isNull(billingCycles.deletedAt)
      ),
    });
  }

  async create(data: any) {
    return await db.insert(billingCycles).values(data).returning();
  }

  async findById(id: string) {
    return await db.query.billingCycles.findFirst({
      where: and(eq(billingCycles.id, id), isNull(billingCycles.deletedAt)),
    });
  }
}