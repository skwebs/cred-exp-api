import { db } from '@/lib/database';
import { transactions, transactionLinks, billingCycles, accounts, creditCards } from '@/lib/database/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { AppError } from '@/core/errors';

export class PaymentsService {
  async payCreditCardBill(userId: string, data: any) {
    const {
      sourceAccountId,
      creditCardId,
      billingCycleId,
      amount,
      transactionDatetime,
      notes,
    } = data;

    return await db.transaction(async (tx) => {
      // 1. Validate
      const sourceAccount = await tx.query.accounts.findFirst({
        where: and(eq(accounts.id, sourceAccountId), eq(accounts.userId, userId)),
      });
      if (!sourceAccount) throw new AppError('Source account not found', 404);

      const card = await tx.query.creditCards.findFirst({
        where: and(eq(creditCards.id, creditCardId), eq(creditCards.userId, userId)),
      });
      if (!card) throw new AppError('Credit card not found', 404);

      const cycle = await tx.query.billingCycles.findFirst({
        where: eq(billingCycles.id, billingCycleId),
      });
      if (!cycle) throw new AppError('Billing cycle not found', 404);

      // 2. Create source transaction (Bank Outflow)
      const [sourceTx] = await tx.insert(transactions).values({
        userId,
        accountId: sourceAccountId,
        kind: 'payment',
        direction: 'outflow',
        amount: amount.toString(),
        transactionDatetime: new Date(transactionDatetime),
        settlementDate: new Date(transactionDatetime),
        notes: `Payment to ${card.cardName}. ${notes || ''}`,
      }).returning();

      // Update source account balance
      await tx
        .update(accounts)
        .set({ balance: sql`balance - ${amount}` })
        .where(eq(accounts.id, sourceAccountId));

      // 3. Create target transaction (Card Inflow)
      const [targetTx] = await tx.insert(transactions).values({
        userId,
        accountId: card.accountId,
        billingCycleId,
        kind: 'payment',
        direction: 'inflow',
        amount: amount.toString(),
        transactionDatetime: new Date(transactionDatetime),
        settlementDate: new Date(transactionDatetime),
        notes: `Payment from ${sourceAccount.name}. ${notes || ''}`,
      }).returning();

      // Update card account balance
      await tx
        .update(accounts)
        .set({ balance: sql`balance + ${amount}` })
        .where(eq(accounts.id, card.accountId));

      // 4. Create Link
      await tx.insert(transactionLinks).values({
        sourceTransactionId: sourceTx.id,
        targetTransactionId: targetTx.id,
        linkType: 'credit_card_payment',
      });

      // 5. Update Billing Cycle Status
      // Calculate total paid so far
      const payments = await tx
        .select({ total: sql<number>`sum(amount)` })
        .from(transactions)
        .where(and(
          eq(transactions.billingCycleId, billingCycleId),
          eq(transactions.kind, 'payment'),
          eq(transactions.direction, 'inflow'),
          isNull(transactions.deletedAt)
        ));
      
      const totalPaid = Number(payments[0]?.total || 0);

      const expenses = await tx
        .select({ total: sql<number>`sum(amount)` })
        .from(transactions)
        .where(and(
          eq(transactions.billingCycleId, billingCycleId),
          eq(transactions.kind, 'expense'),
          isNull(transactions.deletedAt)
        ));
      
      const refunds = await tx
        .select({ total: sql<number>`sum(amount)` })
        .from(transactions)
        .where(and(
          eq(transactions.billingCycleId, billingCycleId),
          eq(transactions.kind, 'refund'),
          isNull(transactions.deletedAt)
        ));

      const totalBilled = Number(expenses[0]?.total || 0) - Number(refunds[0]?.total || 0);

      let status = 'partial';
      if (totalPaid >= totalBilled) {
        status = 'paid';
      } else if (totalPaid === 0) {
        status = 'billed';
      }

      await tx
        .update(billingCycles)
        .set({ status, updatedAt: new Date() })
        .where(eq(billingCycles.id, billingCycleId));

      return { sourceTx, targetTx, status };
    });
  }
}
