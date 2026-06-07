import { db } from '@/lib/database';
import { transactions, accounts } from '@/lib/database/schema';
import { eq, and, isNull, isNotNull, sql, gte, lte, desc } from 'drizzle-orm';

export class TransactionsRepository {
  async findAll(userId: string, { limit = 20, offset = 0, filters = {}, includeDeleted = false, deletedOnly = false }: any) {
    let where = eq(transactions.userId, userId);

    if (deletedOnly) {
      where = and(where, isNotNull(transactions.deletedAt)) as any;
    } else if (!includeDeleted) {
      where = and(where, isNull(transactions.deletedAt)) as any;
    }

    if (filters.accountId) where = and(where, eq(transactions.accountId, filters.accountId)) as any;
    if (filters.categoryId) where = and(where, eq(transactions.categoryId, filters.categoryId)) as any;
    if (filters.billingCycleId) where = and(where, eq(transactions.billingCycleId, filters.billingCycleId)) as any;
    if (filters.dateFrom) where = and(where, gte(transactions.transactionDatetime, new Date(filters.dateFrom))) as any;
    if (filters.dateTo) where = and(where, lte(transactions.transactionDatetime, new Date(filters.dateTo))) as any;

    const data = await db.query.transactions.findMany({
      where,
      limit,
      offset,
      orderBy: [desc(transactions.transactionDatetime)],
      with: {
        account: true,
        category: true,
        billingCycle: true,
      },
    });

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(where);

    const total = Number(totalResult[0].count);

    return { data, total };
  }

  async findById(id: string, userId: string, includeDeleted = true) {
    const where = and(
      eq(transactions.id, id),
      eq(transactions.userId, userId),
      includeDeleted ? undefined : isNull(transactions.deletedAt)
    );

    return await db.query.transactions.findFirst({
      where,
      with: {
        account: true,
        category: true,
        billingCycle: true,
      },
    });
  }

  async create(data: any) {
    return await db.transaction(async (tx) => {
      const [transaction] = await tx.insert(transactions).values(data).returning();

      // Update account balance
      const amount = parseFloat(data.amount);
      const balanceChange = data.direction === 'inflow' ? amount : -amount;

      await tx
        .update(accounts)
        .set({ balance: sql`balance + ${balanceChange}` })
        .where(eq(accounts.id, data.accountId));

      return transaction;
    });
  }

  async update(id: string, userId: string, data: any) {
    return await db.transaction(async (tx) => {
      const oldTransaction = await tx.query.transactions.findFirst({
        where: and(eq(transactions.id, id), eq(transactions.userId, userId)),
      });

      if (!oldTransaction) return null;

      const [newTransaction] = await tx
        .update(transactions)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
        .returning();

      // Adjust account balance if amount, direction or account changed
      if (data.amount !== undefined || data.direction !== undefined || data.accountId !== undefined) {
        // Reverse old balance change
        const oldAmount = parseFloat(oldTransaction.amount);
        const oldBalanceChange = oldTransaction.direction === 'inflow' ? oldAmount : -oldAmount;

        await tx
          .update(accounts)
          .set({ balance: sql`balance - ${oldBalanceChange}` })
          .where(eq(accounts.id, oldTransaction.accountId));

        // Apply new balance change
        const newAmount = parseFloat(newTransaction.amount);
        const newBalanceChange = newTransaction.direction === 'inflow' ? newAmount : -newAmount;

        await tx
          .update(accounts)
          .set({ balance: sql`balance + ${newBalanceChange}` })
          .where(eq(accounts.id, newTransaction.accountId));
      }

      return newTransaction;
    });
  }

  async softDelete(id: string, userId: string) {
    return await db.transaction(async (tx) => {
      const transaction = await tx.query.transactions.findFirst({
        where: and(eq(transactions.id, id), eq(transactions.userId, userId), isNull(transactions.deletedAt)),
      });

      if (!transaction) return null;

      await tx
        .update(transactions)
        .set({ deletedAt: new Date() })
        .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));

      // Reverse account balance
      const amount = parseFloat(transaction.amount);
      const balanceChange = transaction.direction === 'inflow' ? amount : -amount;

      await tx
        .update(accounts)
        .set({ balance: sql`balance - ${balanceChange}` })
        .where(eq(accounts.id, transaction.accountId));

      return transaction;
    });
  }

  async restore(id: string, userId: string) {
    return await db.transaction(async (tx) => {
      const transaction = await tx.query.transactions.findFirst({
        where: and(eq(transactions.id, id), eq(transactions.userId, userId), isNotNull(transactions.deletedAt)),
      });

      if (!transaction) return null;

      await tx
        .update(transactions)
        .set({ deletedAt: null, updatedAt: new Date() })
        .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));

      // Re-apply account balance
      const amount = parseFloat(transaction.amount);
      const balanceChange = transaction.direction === 'inflow' ? amount : -amount;

      await tx
        .update(accounts)
        .set({ balance: sql`balance + ${balanceChange}` })
        .where(eq(accounts.id, transaction.accountId));

      return transaction;
    });
  }

  async hardDelete(id: string, userId: string) {
    return await db.transaction(async (tx) => {
      const transaction = await tx.query.transactions.findFirst({
        where: and(eq(transactions.id, id), eq(transactions.userId, userId)),
      });

      if (!transaction) return null;

      // If it's NOT already soft-deleted, we need to reverse balance
      if (!transaction.deletedAt) {
        const amount = parseFloat(transaction.amount);
        const balanceChange = transaction.direction === 'inflow' ? amount : -amount;

        await tx
          .update(accounts)
          .set({ balance: sql`balance - ${balanceChange}` })
          .where(eq(accounts.id, transaction.accountId));
      }

      await tx
        .delete(transactions)
        .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));

      return transaction;
    });
  }
}