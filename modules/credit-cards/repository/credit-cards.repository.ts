import { db } from '@/lib/database';
import { creditCards } from '@/lib/database/schema';
import { eq, and, isNull, isNotNull, sql } from 'drizzle-orm';

export class CreditCardsRepository {
  async findAll(userId: string, { limit = 10, offset = 0, includeDeleted = false, deletedOnly = false } = {}) {
    let where = eq(creditCards.userId, userId);

    if (deletedOnly) {
      where = and(where, isNotNull(creditCards.deletedAt)) as any;
    } else if (!includeDeleted) {
      where = and(where, isNull(creditCards.deletedAt)) as any;
    }

    const data = await db.query.creditCards.findMany({
      where,
      limit,
      offset,
      orderBy: (creditCards, { desc }) => [desc(creditCards.createdAt)],
      with: {
        account: true,
      },
    });

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(creditCards)
      .where(where);

    const total = Number(totalResult[0].count);

    return { data, total };
  }

  async findById(id: string, userId: string, includeDeleted = true) {
    const where = and(
      eq(creditCards.id, id),
      eq(creditCards.userId, userId),
      includeDeleted ? undefined : isNull(creditCards.deletedAt)
    );

    return await db.query.creditCards.findFirst({
      where,
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

  async restore(id: string, userId: string) {
    return await db
      .update(creditCards)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(and(eq(creditCards.id, id), eq(creditCards.userId, userId)))
      .returning();
  }

  async hardDelete(id: string, userId: string) {
    return await db
      .delete(creditCards)
      .where(and(eq(creditCards.id, id), eq(creditCards.userId, userId)))
      .returning();
  }
}