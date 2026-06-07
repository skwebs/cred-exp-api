import { TransactionsRepository } from '../repository/transactions.repository';
import { AccountsRepository } from '../../accounts/repository/accounts.repository';
import { CreditCardsRepository } from '../../credit-cards/repository/credit-cards.repository';
import { BillingCycleEngine } from '../../billing-cycles/service/billing-cycle-engine.service';
import { BillingCyclesRepository } from '../../billing-cycles/repository/billing-cycles.repository';
import { AppError } from '@/core/errors';

export class TransactionsService {
  private repository: TransactionsRepository;
  private accountsRepository: AccountsRepository;
  private creditCardsRepository: CreditCardsRepository;
  private billingCyclesRepository: BillingCyclesRepository;

  constructor() {
    this.repository = new TransactionsRepository();
    this.accountsRepository = new AccountsRepository();
    this.creditCardsRepository = new CreditCardsRepository();
    this.billingCyclesRepository = new BillingCyclesRepository();
  }

  async getAll(userId: string, query: any) {
    const { limit, offset, includeDeleted, deletedOnly, ...filters } = query;
    return this.repository.findAll(userId, { limit, offset, filters, includeDeleted, deletedOnly });
  }

  async getById(id: string, userId: string) {
    const transaction = await this.repository.findById(id, userId);
    if (!transaction) throw new AppError('Transaction not found', 404);
    return transaction;
  }

  async create(userId: string, data: any) {
    const account = await this.accountsRepository.findById(data.accountId, userId);
    if (!account) throw new AppError('Account not found', 404);

    // Business Rule 3: settlement_date assignment
    if (!data.settlementDate) {
      // Extract date part from transactionDatetime
      const dt = new Date(data.transactionDatetime);
      data.settlementDate = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    }

    // Automatic billing cycle assignment
    if (account.type === 'credit_card') {
      const creditCard = await this.creditCardsRepository.findByAccountId(account.id, userId);
      if (creditCard) {
        const cycleInfo = BillingCycleEngine.calculateCycle(
          new Date(data.transactionDatetime),
          parseInt(creditCard.billingDay.toString()),
          parseInt(creditCard.gracePeriodDays.toString())
        );

        // Find or create billing cycle record
        let billingCycle = await this.billingCyclesRepository.findExisting(
          creditCard.id,
          cycleInfo.startDate,
          cycleInfo.endDate
        );

        if (!billingCycle) {
          [billingCycle] = await this.billingCyclesRepository.create({
            creditCardId: creditCard.id,
            startDate: cycleInfo.startDate,
            endDate: cycleInfo.endDate,
            billDate: cycleInfo.billDate,
            dueDate: cycleInfo.dueDate,
          });
        }
        data.billingCycleId = billingCycle.id;
      }
    }

    return this.repository.create({ ...data, userId });
  }

  async update(id: string, userId: string, data: any) {
    const transaction = await this.repository.findById(id, userId);
    if (!transaction) throw new AppError('Transaction not found', 404);

    // If date changes, we might need to re-assign billing cycle
    if (data.transactionDatetime && data.transactionDatetime !== transaction.transactionDatetime) {
       const account = await this.accountsRepository.findById(transaction.accountId, userId);
       if (account && account.type === 'credit_card') {
          const creditCard = await this.creditCardsRepository.findByAccountId(account.id, userId);
          if (creditCard) {
            const cycleInfo = BillingCycleEngine.calculateCycle(
              new Date(data.transactionDatetime),
              parseInt(creditCard.billingDay.toString()),
              parseInt(creditCard.gracePeriodDays.toString())
            );

            let billingCycle = await this.billingCyclesRepository.findExisting(
              creditCard.id,
              cycleInfo.startDate,
              cycleInfo.endDate
            );

            if (!billingCycle) {
              [billingCycle] = await this.billingCyclesRepository.create({
                creditCardId: creditCard.id,
                startDate: cycleInfo.startDate,
                endDate: cycleInfo.endDate,
                billDate: cycleInfo.billDate,
                dueDate: cycleInfo.dueDate,
              });
            }
            data.billingCycleId = billingCycle.id;
          }
       }
    }

    return this.repository.update(id, userId, data);
  }

  async delete(id: string, userId: string) {
    const transaction = await this.repository.findById(id, userId);
    if (!transaction) throw new AppError('Transaction not found', 404);
    return this.repository.softDelete(id, userId);
  }

  async restore(id: string, userId: string) {
    const transaction = await this.repository.findById(id, userId);
    if (!transaction) throw new AppError('Transaction not found', 404);
    return this.repository.restore(id, userId);
  }

  async forceDelete(id: string, userId: string) {
    const transaction = await this.repository.findById(id, userId);
    if (!transaction) throw new AppError('Transaction not found', 404);
    return this.repository.hardDelete(id, userId);
  }
}