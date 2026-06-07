import { TransactionsService } from './transactions.service';
import { TransactionsRepository } from '../repository/transactions.repository';
import { AccountsRepository } from '../../accounts/repository/accounts.repository';
import { CreditCardsRepository } from '../../credit-cards/repository/credit-cards.repository';
import { BillingCyclesRepository } from '../../billing-cycles/repository/billing-cycles.repository';

jest.mock('../repository/transactions.repository');
jest.mock('../../accounts/repository/accounts.repository');
jest.mock('../../credit-cards/repository/credit-cards.repository');
jest.mock('../../billing-cycles/repository/billing-cycles.repository');

describe('TransactionsService', () => {
  let service: TransactionsService;
  let repo: jest.Mocked<TransactionsRepository>;
  let accountsRepo: jest.Mocked<AccountsRepository>;
  let cardsRepo: jest.Mocked<CreditCardsRepository>;
  let cyclesRepo: jest.Mocked<BillingCyclesRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TransactionsService();
    repo = (service as any).repository;
    accountsRepo = (service as any).accountsRepository;
    cardsRepo = (service as any).creditCardsRepository;
    cyclesRepo = (service as any).billingCyclesRepository;
  });

  const userId = 'user-1';

  describe('create', () => {
    it('should default settlementDate to transactionDatetime date when null', async () => {
      const txData = {
        accountId: 'acc-1',
        kind: 'expense',
        direction: 'outflow',
        amount: '100.00',
        transactionDatetime: new Date('2026-06-05T14:35:00'),
      };

      accountsRepo.findById.mockResolvedValue({ id: 'acc-1', type: 'bank' } as any);
      repo.create.mockResolvedValue({ id: 'tx-1', ...txData } as any);

      await service.create(userId, txData);

      const calledWith = repo.create.mock.calls[0][0];
      expect(calledWith.settlementDate).toBeDefined();
      // Settlement date should be 2026-06-05 (start of day)
      const expectedDate = new Date(2026, 5, 5); // Month is 0-indexed, so 5 is June
      expect(new Date(calledWith.settlementDate).toDateString()).toBe(expectedDate.toDateString());
    });

    it('should assign billing cycle for credit card accounts', async () => {
        const txData = {
          accountId: 'card-acc-1',
          kind: 'expense',
          direction: 'outflow',
          amount: '100.00',
          transactionDatetime: new Date('2026-06-05T14:35:00'),
        };
  
        accountsRepo.findById.mockResolvedValue({ id: 'card-acc-1', type: 'credit_card' } as any);
        cardsRepo.findByAccountId.mockResolvedValue({ id: 'card-1', billingDay: 5, gracePeriodDays: 20 } as any);
        cyclesRepo.findExisting.mockResolvedValue({ id: 'cycle-1' } as any);
        repo.create.mockResolvedValue({ id: 'tx-1' } as any);
  
        await service.create(userId, txData);
  
        const calledWith = repo.create.mock.calls[0][0];
        expect(calledWith.billingCycleId).toBe('cycle-1');
      });
  });
});
