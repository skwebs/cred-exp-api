import { AccountsRepository } from '../repository/accounts.repository';
import { AppError } from '@/core/errors';

export class AccountsService {
  private repository: AccountsRepository;

  constructor() {
    this.repository = new AccountsRepository();
  }

  async getAll(userId: string, query: any) {
    return this.repository.findAll(userId, query);
  }

  async create(userId: string, data: any) {
    return this.repository.create({ ...data, userId });
  }

  async update(id: string, userId: string, data: any) {
    const account = await this.repository.findById(id, userId);
    if (!account) {
      throw new AppError('Account not found', 404);
    }
    return this.repository.update(id, userId, data);
  }

  async delete(id: string, userId: string) {
    const account = await this.repository.findById(id, userId);
    if (!account) {
      throw new AppError('Account not found', 404);
    }
    return this.repository.softDelete(id, userId);
  }
}