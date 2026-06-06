import { db } from '@/lib/database';
import { transactions, accounts, categories, creditCards, billingCycles } from '@/lib/database/schema';
import { eq, and, isNull, sql, gte, lte, desc, ilike } from 'drizzle-orm';
import { BillingCycleEngine } from '../../billing-cycles/service/billing-cycle-engine.service';
import { AppError } from '@/core/errors';

export class ReportsService {
  async getTransactionTimeline(userId: string, query: any) {
    const {
      limit = 20,
      offset = 0,
      dateFrom,
      dateTo,
      month, // format YYYY-MM
      accountId,
      cardId,
      categoryId,
      billingCycleId,
      transactionKind,
    } = query;

    let where = and(
      eq(transactions.userId, userId),
      isNull(transactions.deletedAt)
    );

    if (dateFrom) where = and(where, gte(transactions.transactionDatetime, new Date(dateFrom)));
    if (dateTo) where = and(where, lte(transactions.transactionDatetime, new Date(dateTo)));
    if (accountId) where = and(where, eq(transactions.accountId, accountId));
    if (categoryId) where = and(where, eq(transactions.categoryId, categoryId));
    if (billingCycleId) where = and(where, eq(transactions.billingCycleId, billingCycleId));
    if (transactionKind) where = and(where, eq(transactions.kind, transactionKind));

    if (month) {
      const startOfMonth = new Date(`${month}-01`);
      const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0, 23, 59, 59);
      where = and(where, gte(transactions.transactionDatetime, startOfMonth), lte(transactions.transactionDatetime, endOfMonth));
    }

    if (cardId) {
      // Need to join with creditCards to filter by cardId
      const card = await db.query.creditCards.findFirst({
        where: and(eq(creditCards.id, cardId), eq(creditCards.userId, userId)),
      });
      if (card) {
        where = and(where, eq(transactions.accountId, card.accountId));
      }
    }

    const transactionData = await db.query.transactions.findMany({
      where,
      limit: parseInt(limit.toString()),
      offset: parseInt(offset.toString()),
      orderBy: [desc(transactions.transactionDatetime)],
      with: {
        account: true,
        category: true,
        billingCycle: true,
      },
    });

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(where);

    const summary = await db
      .select({
        totalInflow: sql<number>`sum(case when direction = 'inflow' then amount else 0 end)`,
        totalOutflow: sql<number>`sum(case when direction = 'outflow' then amount else 0 end)`,
        count: sql<number>`count(*)`,
      })
      .from(transactions)
      .where(where);

    const totals = summary[0] || { totalInflow: 0, totalOutflow: 0, count: 0 };

    return {
      summary: {
        totalInflow: Number(totals.totalInflow || 0),
        totalOutflow: Number(totals.totalOutflow || 0),
        netAmount: Number(totals.totalInflow || 0) - Number(totals.totalOutflow || 0),
        transactionCount: Number(totals.count || 0),
      },
      transactions: transactionData,
      pagination: {
        total: Number(totalCount[0].count),
        limit: parseInt(limit.toString()),
        offset: parseInt(offset.toString()),
      },
    };
  }

  async getMonthlyDashboard(userId: string, month: string) {
    const startOfMonth = new Date(`${month}-01`);
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0, 23, 59, 59);

    const where = and(
      eq(transactions.userId, userId),
      isNull(transactions.deletedAt),
      gte(transactions.transactionDatetime, startOfMonth),
      lte(transactions.transactionDatetime, endOfMonth)
    );

    // Monthly totals
    const monthlyTotals = await db
      .select({
        totalInflow: sql<number>`sum(case when direction = 'inflow' then amount else 0 end)`,
        totalOutflow: sql<number>`sum(case when direction = 'outflow' then amount else 0 end)`,
        transactionCount: sql<number>`count(*)`,
      })
      .from(transactions)
      .where(where);

    // Category totals
    const categoryTotals = await db
      .select({
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        totalAmount: sql<number>`sum(amount)`,
        direction: transactions.direction,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(where)
      .groupBy(transactions.categoryId, categories.name, transactions.direction);

    // Account totals
    const accountTotals = await db
      .select({
        accountId: transactions.accountId,
        accountName: accounts.name,
        totalAmount: sql<number>`sum(amount)`,
        direction: transactions.direction,
      })
      .from(transactions)
      .leftJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(where)
      .groupBy(transactions.accountId, accounts.name, transactions.direction);

    return {
      month,
      summary: monthlyTotals[0] || { totalInflow: 0, totalOutflow: 0, transactionCount: 0 },
      categories: categoryTotals,
      accounts: accountTotals,
    };
  }

  async getCardCurrentCycle(userId: string, cardId: string) {
    const card = await db.query.creditCards.findFirst({
      where: and(eq(creditCards.id, cardId), eq(creditCards.userId, userId)),
      with: { account: true },
    });

    if (!card) throw new AppError('Credit card not found', 404);

    const cycleInfo = BillingCycleEngine.calculateCycle(
      new Date(),
      parseInt(card.billingDay.toString()),
      parseInt(card.gracePeriodDays.toString())
    );

    const where = and(
      eq(transactions.userId, userId),
      eq(transactions.accountId, card.accountId),
      isNull(transactions.deletedAt),
      gte(transactions.transactionDatetime, cycleInfo.startDate),
      lte(transactions.transactionDatetime, cycleInfo.endDate)
    );

    const stats = await db
      .select({
        totalExpenses: sql<number>`sum(case when direction = 'outflow' and kind = 'expense' then amount else 0 end)`,
        totalRefunds: sql<number>`sum(case when direction = 'inflow' and kind = 'refund' then amount else 0 end)`,
        totalPayments: sql<number>`sum(case when direction = 'inflow' and kind = 'payment' then amount else 0 end)`,
      })
      .from(transactions)
      .where(where);

    const totals = stats[0] || { totalExpenses: 0, totalRefunds: 0, totalPayments: 0 };
    const netAmount = Number(totals.totalExpenses || 0) - Number(totals.totalRefunds || 0) - Number(totals.totalPayments || 0);

    return {
      card: {
        id: card.id,
        cardName: card.cardName,
        bankName: card.bankName,
        lastFourDigits: card.lastFourDigits,
      },
      cycle: cycleInfo,
      totals: {
        expenseTotal: Number(totals.totalExpenses || 0),
        refundTotal: Number(totals.totalRefunds || 0),
        paymentTotal: Number(totals.totalPayments || 0),
        netAmount,
      },
      dueDate: cycleInfo.dueDate,
    };
  }

  async getCardCurrentCycleTransactions(userId: string, cardId: string, query: any) {
    const summary = await this.getCardCurrentCycle(userId, cardId);
    
    const { limit = 20, offset = 0 } = query;

    const where = and(
      eq(transactions.userId, userId),
      eq(transactions.accountId, (await db.query.creditCards.findFirst({ where: eq(creditCards.id, cardId) }))?.accountId as string),
      isNull(transactions.deletedAt),
      gte(transactions.transactionDatetime, summary.cycle.startDate),
      lte(transactions.transactionDatetime, summary.cycle.endDate)
    );

    const transactionData = await db.query.transactions.findMany({
      where,
      limit: parseInt(limit.toString()),
      offset: parseInt(offset.toString()),
      orderBy: [desc(transactions.transactionDatetime)],
      with: {
        category: true,
      },
    });

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(where);

    return {
      cycleSummary: summary,
      transactions: transactionData,
      pagination: {
        total: Number(totalCount[0].count),
        limit: parseInt(limit.toString()),
        offset: parseInt(offset.toString()),
      },
    };
  }

  async getUpcomingBills(userId: string) {
    const cards = await db.query.creditCards.findMany({
      where: and(eq(creditCards.userId, userId), isNull(creditCards.deletedAt)),
    });

    const bills = await Promise.all(
      cards.map(async (card) => {
        const currentCycle = await this.getCardCurrentCycle(userId, card.id);
        return {
          cardId: card.id,
          cardName: card.cardName,
          bankName: card.bankName,
          amount: currentCycle.totals.netAmount,
          dueDate: currentCycle.dueDate,
          billDate: currentCycle.cycle.billDate,
        };
      })
    );

    const totalUpcomingLiability = bills.reduce((sum, bill) => sum + bill.amount, 0);

    return {
      cards: bills,
      totalUpcomingLiability,
    };
  }

  async getBillHistory(userId: string) {
    const cycles = await db
      .select({
        id: billingCycles.id,
        creditCardId: billingCycles.creditCardId,
        cardName: creditCards.cardName,
        startDate: billingCycles.startDate,
        endDate: billingCycles.endDate,
        billDate: billingCycles.billDate,
        dueDate: billingCycles.dueDate,
        status: billingCycles.status,
      })
      .from(billingCycles)
      .innerJoin(creditCards, eq(billingCycles.creditCardId, creditCards.id))
      .where(and(eq(creditCards.userId, userId), isNull(billingCycles.deletedAt)))
      .orderBy(desc(billingCycles.billDate));

    const history = await Promise.all(
      cycles.map(async (cycle) => {
        const stats = await db
          .select({
            totalExpenses: sql<number>`sum(case when direction = 'outflow' and kind = 'expense' then amount else 0 end)`,
            totalRefunds: sql<number>`sum(case when direction = 'inflow' and kind = 'refund' then amount else 0 end)`,
            totalPayments: sql<number>`sum(case when direction = 'inflow' and kind = 'payment' then amount else 0 end)`,
          })
          .from(transactions)
          .where(and(eq(transactions.billingCycleId, cycle.id), isNull(transactions.deletedAt)));

        const totals = stats[0] || { totalExpenses: 0, totalRefunds: 0, totalPayments: 0 };
        const generatedAmount = Number(totals.totalExpenses || 0) - Number(totals.totalRefunds || 0);
        const paidAmount = Number(totals.totalPayments || 0);

        return {
          ...cycle,
          generatedAmount,
          paidAmount,
          remainingAmount: generatedAmount - paidAmount,
        };
      })
    );

    return history;
  }
}
