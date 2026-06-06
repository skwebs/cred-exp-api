import { PaymentsService } from './payments.service';
import { db } from '@/lib/database';

jest.mock('@/lib/database', () => ({
  db: {
    transaction: jest.fn((callback) => callback({
      query: {
        accounts: { findFirst: jest.fn().mockResolvedValue({ id: 'acc-1', name: 'Bank' }) },
        creditCards: { findFirst: jest.fn().mockResolvedValue({ id: 'card-1', cardName: 'Visa', accountId: 'card-acc-1' }) },
        billingCycles: { findFirst: jest.fn().mockResolvedValue({ id: 'cycle-1' }) },
      },
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([{ id: 'tx-1' }]),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
    })),
  },
}));

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(() => {
    service = new PaymentsService();
  });

  it('should process a credit card payment successfully', async () => {
    const data = {
      sourceAccountId: 'acc-1',
      creditCardId: 'card-1',
      billingCycleId: 'cycle-1',
      amount: 100,
      transactionDatetime: new Date().toISOString(),
    };

    const result = await service.payCreditCardBill('user-1', data);
    expect(result).toBeDefined();
    expect(db.transaction).toHaveBeenCalled();
  });
});
