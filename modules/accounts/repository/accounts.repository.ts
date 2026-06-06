import { db } from '@/lib/database';
import { accounts } from '@/lib/database/schema';
import { eq, and, isNull, ilike, sql } from 'drizzle-orm';

export class AccountsRepository {
  async findAll(userId: string, { limit = 10, offset = 0, search = '' }) {
    const where = and(
      eq(accounts.userId, userId),
      isNull(accounts.deletedAt),
      search ? ilike(accounts.name, `%${search}%`) : undefined
    );

    const data = await db.query.accounts.findMany({
      where,
      limit,
      offset,
      orderBy: (accounts, { desc }) => [desc(accounts.createdAt)],
    });

    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(accounts)
      .where(where);

    return { data, total: Number(total[0].count) };
  }

  async findById(id: string, userId: string) {
    return await db.query.accounts.findFirst({
      where: and(
        eq(accounts.id, id),
        eq(accounts.userId, userId),
        isNull(accounts.deletedAt)
      ),
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
}