import { CreditCardsService } from './credit-cards.service';
import { AccountsRepository } from '@/modules/accounts/repository/accounts.repository';
import { CreditCardsRepository } from '../repository/credit-cards.repository';
import { AppError } from '@/core/errors';

jest.mock('@/modules/accounts/repository/accounts.repository');
jest.mock('../repository/credit-cards.repository');

describe('CreditCardsService', () => {
  let service: CreditCardsService;
  let accountsRepo: jest.Mocked<AccountsRepository>;
  let cardsRepo: jest.Mocked<CreditCardsRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CreditCardsService();
    accountsRepo = (service as any).accountsRepository;
    cardsRepo = (service as any).repository;
  });

  describe('create', () => {
    const userId = 'user-1';
    const cardData = {
      accountId: 'acc-1',
      cardName: 'Visa',
      shortCode: 'V1',
      bankName: 'Bank',
      lastFourDigits: '1234',
      billingDay: 5,
      gracePeriodDays: 20
    };

    it('should create a credit card when account exists and type is credit_card', async () => {
      accountsRepo.findById.mockResolvedValue({ id: 'acc-1', type: 'credit_card' } as any);
      cardsRepo.create.mockResolvedValue([{ id: 'card-1', ...cardData }] as any);

      const result = await service.create(userId, cardData);

      expect(result).toBeDefined();
      expect(accountsRepo.findById).toHaveBeenCalledWith('acc-1', userId);
      expect(cardsRepo.create).toHaveBeenCalled();
    });

    it('should throw 404 when account does not exist', async () => {
      accountsRepo.findById.mockResolvedValue(null as any);

      const promise = service.create(userId, cardData);
      
      await expect(promise).rejects.toThrow('Account not found');
      await expect(promise).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw 400 when account type is bank', async () => {
      accountsRepo.findById.mockResolvedValue({ id: 'acc-1', type: 'bank' } as any);

      try {
        await service.create(userId, cardData);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Credit card can only be linked to an account of type 'credit_card'.");
        expect(error.errors).toEqual({
          accountId: ['Selected account is not a credit card account.'],
        });
      }
    });

    it('should throw 400 when account type is cash', async () => {
      accountsRepo.findById.mockResolvedValue({ id: 'acc-1', type: 'cash' } as any);

      try {
        await service.create(userId, cardData);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(400);
        expect(error.errors).toEqual({
          accountId: ['Selected account is not a credit card account.'],
        });
      }
    });

    it('should throw 409 when account is already linked to a credit card', async () => {
      accountsRepo.findById.mockResolvedValue({ id: 'acc-1', type: 'credit_card' } as any);
      cardsRepo.findByAccountId.mockResolvedValue({ id: 'existing-card-1' } as any);

      try {
        await service.create(userId, cardData);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(409);
        expect(error.message).toBe('Credit card already exists for this account.');
        expect(error.errors).toEqual({
          accountId: ['The selected account is already linked to a credit card.'],
        });
      }
    });
  });

  describe('delete (soft delete)', () => {
    const userId = 'user-1';
    const cardId = 'card-1';

    it('should soft delete card when it exists and is active', async () => {
      cardsRepo.findById.mockResolvedValue({ id: cardId, userId, deletedAt: null } as any);
      cardsRepo.softDelete.mockResolvedValue([{ id: cardId, deletedAt: new Date() }] as any);

      await service.delete(cardId, userId);

      expect(cardsRepo.findById).toHaveBeenCalledWith(cardId, userId, true);
      expect(cardsRepo.softDelete).toHaveBeenCalledWith(cardId, userId);
    });

    it('should throw 409 when card is already deleted', async () => {
      cardsRepo.findById.mockResolvedValue({ id: cardId, userId, deletedAt: new Date() } as any);

      await expect(service.delete(cardId, userId)).rejects.toThrow('Credit card is already deleted');
    });

    it('should throw 404 when card does not exist', async () => {
      cardsRepo.findById.mockResolvedValue(null as any);

      await expect(service.delete(cardId, userId)).rejects.toThrow('Credit card not found');
    });
  });

  describe('restore', () => {
    const userId = 'user-1';
    const cardId = 'card-1';

    it('should restore card when it exists and is deleted', async () => {
      cardsRepo.findById.mockResolvedValue({ id: cardId, userId, deletedAt: new Date() } as any);
      cardsRepo.restore.mockResolvedValue([{ id: cardId, deletedAt: null }] as any);

      await service.restore(cardId, userId);

      expect(cardsRepo.findById).toHaveBeenCalledWith(cardId, userId, true);
      expect(cardsRepo.restore).toHaveBeenCalledWith(cardId, userId);
    });

    it('should throw 409 when card is already active', async () => {
      cardsRepo.findById.mockResolvedValue({ id: cardId, userId, deletedAt: null } as any);

      await expect(service.restore(cardId, userId)).rejects.toThrow('Credit card is already active');
    });

    it('should throw 404 when card does not exist', async () => {
      cardsRepo.findById.mockResolvedValue(null as any);

      await expect(service.restore(cardId, userId)).rejects.toThrow('Credit card not found');
    });
  });
});
