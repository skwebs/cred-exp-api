import { GET as getAccounts, POST as postAccounts } from '@/app/api/accounts/route';
import { GET as getCards, POST as postCards } from '@/app/api/cards/route';
import { GET as getCategories, POST as postCategories } from '@/app/api/categories/route';
import { AccountsService } from '@/modules/accounts/service/accounts.service';
import { CreditCardsService } from '@/modules/credit-cards/service/credit-cards.service';
import { CategoriesService } from '@/modules/categories/service/categories.service';
import { verifyToken } from '@/modules/auth/service/jwt.service';

jest.mock('@/modules/accounts/service/accounts.service');
jest.mock('@/modules/credit-cards/service/credit-cards.service');
jest.mock('@/modules/categories/service/categories.service');
jest.mock('@/modules/auth/service/jwt.service');
jest.mock('next/headers', () => ({
  headers: jest.fn().mockResolvedValue({
    get: jest.fn().mockReturnValue('Bearer valid-token'),
  }),
}));

describe('Core Resource API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifyToken as jest.Mock).mockReturnValue({ userId: 'user-1' });
  });

  describe('Accounts', () => {
    it('GET /api/accounts', async () => {
      (AccountsService.prototype.getAll as jest.Mock).mockResolvedValue({ data: [], total: 0 });
      const request = new Request('http://localhost/api/accounts');
      const response = await getAccounts(request);
      expect(response.status).toBe(200);
    });

    it('POST /api/accounts', async () => {
      (AccountsService.prototype.create as jest.Mock).mockResolvedValue({ id: '1' });
      const request = new Request('http://localhost/api/accounts', {
        method: 'POST',
        body: JSON.stringify({ name: 'Bank', type: 'bank', balance: '1000.00' }),
      });
      const response = await postAccounts(request);
      expect(response.status).toBe(201);
    });
  });

  describe('Cards', () => {
    it('GET /api/cards', async () => {
      (CreditCardsService.prototype.getAll as jest.Mock).mockResolvedValue({ data: [], total: 0 });
      const request = new Request('http://localhost/api/cards');
      const response = await getCards(request);
      expect(response.status).toBe(200);
    });

    it('POST /api/cards', async () => {
      (CreditCardsService.prototype.create as jest.Mock).mockResolvedValue({ id: '1' });
      const request = new Request('http://localhost/api/cards', {
        method: 'POST',
        body: JSON.stringify({ 
          cardName: 'Visa', 
          accountId: '00000000-0000-0000-0000-000000000000',
          shortCode: 'VISA',
          bankName: 'MyBank',
          lastFourDigits: '1234',
          billingDay: 1,
          gracePeriodDays: 10
        }),
      });
      const response = await postCards(request);
      expect(response.status).toBe(201);
    });
  });

  describe('Categories', () => {
    it('GET /api/categories', async () => {
      (CategoriesService.prototype.getAll as jest.Mock).mockResolvedValue({ data: [], total: 0 });
      const request = new Request('http://localhost/api/categories');
      const response = await getCategories(request);
      expect(response.status).toBe(200);
    });

    it('POST /api/categories', async () => {
      (CategoriesService.prototype.create as jest.Mock).mockResolvedValue({ id: '1' });
      const request = new Request('http://localhost/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name: 'Food', color: '#ff0000', icon: 'food' }),
      });
      const response = await postCategories(request);
      expect(response.status).toBe(201);
    });
  });
});
