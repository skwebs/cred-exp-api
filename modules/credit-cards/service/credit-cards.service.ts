import { CreditCardsRepository } from '../repository/credit-cards.repository';
import { AccountsRepository } from '@/modules/accounts/repository/accounts.repository';
import { AppError } from '@/core/errors';

export class CreditCardsService {
  private repository: CreditCardsRepository;
  private accountsRepository: AccountsRepository;

  constructor() {
    this.repository = new CreditCardsRepository();
    this.accountsRepository = new AccountsRepository();
  }

  async getAll(userId: string, query: any) {
    return this.repository.findAll(userId, query);
  }

  async getById(id: string, userId: string) {
    const card = await this.repository.findById(id, userId);
    if (!card) {
      throw new AppError('Credit card not found', 404);
    }
    return card;
  }

  /**
   * Business Rule: A credit card record can only be created if the selected account 
   * exists and its account type is exactly 'credit_card'.
   * 
   * One-to-One Relationship: One account of type "credit_card" can have only one 
   * credit card detail record.
   */
  async create(userId: string, data: any) {
    const account = await this.accountsRepository.findById(data.accountId, userId);

    // 1. If the account does not exist, return 404.
    if (!account) {
      throw new AppError('Account not found', 404);
    }

    // 2. If account.type is not "credit_card", reject the request with 400.
    if (account.type !== 'credit_card') {
      throw new AppError(
        "Credit card can only be linked to an account of type 'credit_card'.",
        400,
        {
          accountId: ['Selected account is not a credit card account.'],
        }
      );
    }

    // 3. Verify no existing credit card record already uses this account (One-to-One)
    const existingCard = await this.repository.findByAccountId(data.accountId, userId);
    if (existingCard) {
      throw new AppError(
        'Credit card already exists for this account.',
        409,
        {
          accountId: ['The selected account is already linked to a credit card.'],
        }
      );
    }

    const [card] = await this.repository.create({ ...data, userId });
    return card;
  }

  async update(id: string, userId: string, data: any) {
    const card = await this.repository.findById(id, userId);
    if (!card) {
      throw new AppError('Credit card not found', 404);
    }

    // If accountId is being updated, we should apply the same business rule.
    if (data.accountId && data.accountId !== card.accountId) {
      const account = await this.accountsRepository.findById(data.accountId, userId);
      if (!account) {
        throw new AppError('Account not found', 404);
      }
      if (account.type !== 'credit_card') {
        throw new AppError(
          "Credit card can only be linked to an account of type 'credit_card'.",
          400,
          {
            accountId: ['Selected account is not a credit card account.'],
          }
        );
      }

      const existingCard = await this.repository.findByAccountId(data.accountId, userId);
      if (existingCard && existingCard.id !== id) {
        throw new AppError(
          'Credit card already exists for this account.',
          409,
          {
            accountId: ['The selected account is already linked to a credit card.'],
          }
        );
      }
    }

    const [updatedCard] = await this.repository.update(id, userId, data);
    return updatedCard;
  }

  async delete(id: string, userId: string) {
    const card = await this.repository.findById(id, userId, true);
    if (!card) {
      throw new AppError('Credit card not found', 404);
    }
    if (card.deletedAt) {
      throw new AppError('Credit card is already deleted', 409);
    }
    return this.repository.softDelete(id, userId);
  }

  async restore(id: string, userId: string) {
    const card = await this.repository.findById(id, userId, true);
    if (!card) {
      throw new AppError('Credit card not found', 404);
    }
    if (!card.deletedAt) {
      throw new AppError('Credit card is already active', 409);
    }
    return this.repository.restore(id, userId);
  }

  async forceDelete(id: string, userId: string) {
    const card = await this.repository.findById(id, userId);
    if (!card) {
      throw new AppError('Credit card not found', 404);
    }
    return this.repository.hardDelete(id, userId);
  }
}