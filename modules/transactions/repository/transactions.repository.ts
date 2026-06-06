import { db } from '@/lib/database';
import { transactions, accounts, billingCycles } from '@/lib/database/schema';
import { eq, and, isNull, sql, gte, lte, desc } from 'drizzle-orm';

export class TransactionsRepository {
  async findAll(userId: string, { limit = 20, offset = 0, filters = {} }: any) {
    const where = and(
      eq(transactions.userId, userId),
      isNull(transactions.deletedAt),
      filters.accountId ? eq(transactions.accountId, filters.accountId) : undefined,
      filters.categoryId ? eq(transactions.categoryId, filters.categoryId) : undefined,
      filters.billingCycleId ? eq(transactions.billingCycleId, filters.billingCycleId) : undefined,
      filters.dateFrom ? gte(transactions.transactionDatetime, new Date(filters.dateFrom)) : undefined,
      filters.dateTo ? lte(transactions.transactionDatetime, new Date(filters.dateTo)) : undefined
    );

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

    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(where);

    return { data, total: Number(total[0].count) };
  }

  async findById(id: string, userId: string) {
    return await db.query.transactions.findFirst({
      where: and(
        eq(transactions.id, id),
        eq(transactions.userId, userId),
        isNull(transactions.deletedAt)
      ),
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

      // Adjust account balance if amount or direction changed
      if (data.amount !== undefined || data.direction !== undefined) {
        const oldAmount = parseFloat(oldTransaction.amount);
        const oldBalanceChange = oldTransaction.direction === 'inflow' ? oldAmount : -oldAmount;
        
        const newAmount = parseFloat(newTransaction.amount);
        const newBalanceChange = newTransaction.direction === 'inflow' ? newAmount : -newAmount;
        
        const diff = newBalanceChange - oldBalanceChange;

        await tx
          .update(accounts)
          .set({ balance: sql`balance + ${diff}` })
          .where(eq(accounts.id, oldTransaction.accountId));
      }

      return newTransaction;
    });
  }

  async softDelete(id: string, userId: string) {
    return await db.transaction(async (tx) => {
      const transaction = await tx.query.transactions.findFirst({
        where: and(eq(transactions.id, id), eq(transactions.userId, userId)),
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
}