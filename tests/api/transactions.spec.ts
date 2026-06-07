import { GET as getTransactions, POST as postTransactions } from '@/app/api/transactions/route';
import { GET as getDeletedTransactions } from '@/app/api/transactions/deleted/route';
import { POST as postPay } from '@/app/api/bills/pay/route';
import { TransactionsService } from '@/modules/transactions/service/transactions.service';
import { PaymentsService } from '@/modules/transactions/service/payments.service';
import { verifyToken } from '@/modules/auth/service/jwt.service';

jest.mock('@/modules/transactions/service/transactions.service');
jest.mock('@/modules/transactions/service/payments.service');
jest.mock('@/modules/auth/service/jwt.service');
jest.mock('next/headers', () => ({
  headers: jest.fn().mockResolvedValue({
    get: jest.fn().mockReturnValue('Bearer valid-token'),
  }),
}));

describe('Transactions and Payments API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyToken as jest.Mock).mockReturnValue({ userId: 'user-1' });
  });

  describe('Transactions', () => {
    it('GET /api/transactions', async () => {
      (TransactionsService.prototype.getAll as jest.Mock).mockResolvedValue({ data: [], total: 0 });
      const request = new Request('http://localhost/api/transactions');
      const response = await getTransactions(request);
      expect(response.status).toBe(200);
    });

    it('POST /api/transactions', async () => {
      (TransactionsService.prototype.create as jest.Mock).mockResolvedValue({ id: '1' });
      const request = new Request('http://localhost/api/transactions', {
        method: 'POST',
        body: JSON.stringify({ 
          accountId: '00000000-0000-0000-0000-000000000000',
          kind: 'expense',
          direction: 'outflow',
          amount: '50.00',
          transactionDatetime: new Date().toISOString()
        }),
      });
      const response = await postTransactions(request);
      expect(response.status).toBe(201);
    });

    it('GET /api/transactions/deleted', async () => {
      (TransactionsService.prototype.getAll as jest.Mock).mockResolvedValue({ data: [], total: 0 });
      const request = new Request('http://localhost/api/transactions/deleted');
      const response = await getDeletedTransactions(request);
      expect(response.status).toBe(200);
      expect(TransactionsService.prototype.getAll).toHaveBeenCalledWith('user-1', expect.objectContaining({ deletedOnly: true }));
    });
  });

  describe('Payments', () => {
    it('POST /api/bills/pay', async () => {
      (PaymentsService.prototype.payCreditCardBill as jest.Mock).mockResolvedValue({ id: 'tx-1' });
      const request = new Request('http://localhost/api/bills/pay', {
        method: 'POST',
        body: JSON.stringify({ 
          sourceAccountId: '00000000-0000-0000-0000-000000000000',
          creditCardId: '00000000-0000-0000-0000-000000000000',
          billingCycleId: '00000000-0000-0000-0000-000000000000',
          amount: 100,
          transactionDatetime: new Date().toISOString()
        }),
      });
      const response = await postPay(request);
      expect(response.status).toBe(201);
    });
  });
});
