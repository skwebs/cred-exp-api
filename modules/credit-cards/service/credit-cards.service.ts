import { CreditCardsRepository } from '../repository/credit-cards.repository';
import { AppError } from '@/core/errors';

export class CreditCardsService {
  private repository: CreditCardsRepository;

  constructor() {
    this.repository = new CreditCardsRepository();
  }

  async getAll(userId: string) {
    return this.repository.findAll(userId);
  }

  async getById(id: string, userId: string) {
    const card = await this.repository.findById(id, userId);
    if (!card) {
      throw new AppError('Credit card not found', 404);
    }
    return card;
  }

  async create(userId: string, data: any) {
    return this.repository.create({ ...data, userId });
  }

  async update(id: string, userId: string, data: any) {
    const card = await this.repository.findById(id, userId);
    if (!card) {
      throw new AppError('Credit card not found', 404);
    }
    return this.repository.update(id, userId, data);
  }

  async delete(id: string, userId: string) {
    const card = await this.repository.findById(id, userId);
    if (!card) {
      throw new AppError('Credit card not found', 404);
    }
    return this.repository.softDelete(id, userId);
  }
}