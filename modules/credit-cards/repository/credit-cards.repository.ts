import { db } from '@/lib/database';
import { creditCards } from '@/lib/database/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';

export class CreditCardsRepository {
  async findAll(userId: string) {
    return await db.query.creditCards.findMany({
      where: and(eq(creditCards.userId, userId), isNull(creditCards.deletedAt)),
      with: {
        account: true,
      },
    });
  }

  async findById(id: string, userId: string) {
    return await db.query.creditCards.findFirst({
      where: and(
        eq(creditCards.id, id),
        eq(creditCards.userId, userId),
        isNull(creditCards.deletedAt)
      ),
      with: {
        account: true,
      },
    });
  }

  async findByAccountId(accountId: string, userId: string) {
    return await db.query.creditCards.findFirst({
      where: and(
        eq(creditCards.accountId, accountId),
        eq(creditCards.userId, userId),
        isNull(creditCards.deletedAt)
      ),
    });
  }

  async create(data: any) {
    return await db.insert(creditCards).values(data).returning();
  }

  async update(id: string, userId: string, data: any) {
    return await db
      .update(creditCards)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(creditCards.id, id), eq(creditCards.userId, userId)))
      .returning();
  }

  async softDelete(id: string, userId: string) {
    return await db
      .update(creditCards)
      .set({ deletedAt: new Date() })
      .where(and(eq(creditCards.id, id), eq(creditCards.userId, userId)))
      .returning();
  }
}