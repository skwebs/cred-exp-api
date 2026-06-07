import { db } from '@/lib/database';
import { accounts } from '@/lib/database/schema';
import { eq, and, isNull, isNotNull, ilike, sql } from 'drizzle-orm';

export class AccountsRepository {
  async findAll(userId: string, { limit = 10, offset = 0, search = '', includeDeleted = false, deletedOnly = false }) {
    let where = eq(accounts.userId, userId);

    if (deletedOnly) {
      where = and(where, isNotNull(accounts.deletedAt)) as any;
    } else if (!includeDeleted) {
      where = and(where, isNull(accounts.deletedAt)) as any;
    }

    if (search) {
      where = and(where, ilike(accounts.name, `%${search}%`)) as any;
    }

    const data = await db.query.accounts.findMany({
      where,
      limit,
      offset,
      orderBy: (accounts, { desc }) => [desc(accounts.createdAt)],
    });

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(accounts)
      .where(where);

    const total = Number(totalResult[0].count);

    return { data, total };
  }

  async findById(id: string, userId: string, includeDeleted = true) {
    const where = and(
      eq(accounts.id, id),
      eq(accounts.userId, userId),
      includeDeleted ? undefined : isNull(accounts.deletedAt)
    );

    return await db.query.accounts.findFirst({
      where,
    });
  }

  async create(data: any) {
    return await db.insert(accounts).values(data).returning();
  }

  async update(id: string, userId: string, data: any) {
    return await db
      .update(accounts)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
      .returning();
  }

  async softDelete(id: string, userId: string) {
    return await db
      .update(accounts)
      .set({ deletedAt: new Date() })
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
      .returning();
  }

  async restore(id: string, userId: string) {
    return await db
      .update(accounts)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
      .returning();
  }

  async hardDelete(id: string, userId: string) {
    return await db
      .delete(accounts)
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
      .returning();
  }

  async findAvailableForCard(userId: string) {
    const { creditCards } = await import('@/lib/database/schema');

    return await db
      .select({
        id: accounts.id,
        name: accounts.name,
        type: accounts.type,
        balance: accounts.balance,
        currency: accounts.currency,
      })
      .from(accounts)
      .leftJoin(creditCards, eq(accounts.id, creditCards.accountId))
      .where(
        and(
          eq(accounts.userId, userId),
          eq(accounts.type, 'credit_card'),
          isNull(accounts.deletedAt),
          isNull(creditCards.id) // Only accounts with no linked credit card
        )
      );
  }
}