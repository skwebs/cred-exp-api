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

  async getById(id: string, userId: string) {
    const account = await this.repository.findById(id, userId);
    if (!account) {
      throw new AppError('Account not found', 404);
    }
    return account;
  }

  async create(userId: string, data: any) {
    const [account] = await this.repository.create({ ...data, userId });
    return account;
  }

  async update(id: string, userId: string, data: any) {
    const account = await this.repository.findById(id, userId);
    if (!account) {
      throw new AppError('Account not found', 404);
    }
    const [updatedAccount] = await this.repository.update(id, userId, data);
    return updatedAccount;
  }

  async delete(id: string, userId: string) {
    const account = await this.repository.findById(id, userId);
    if (!account) {
      throw new AppError('Account not found', 404);
    }
    return this.repository.softDelete(id, userId);
  }

  async restore(id: string, userId: string) {
    const account = await this.repository.findById(id, userId);
    if (!account) {
      throw new AppError('Account not found', 404);
    }
    return this.repository.restore(id, userId);
  }

  async forceDelete(id: string, userId: string) {
    const account = await this.repository.findById(id, userId);
    if (!account) {
      throw new AppError('Account not found', 404);
    }
    return this.repository.hardDelete(id, userId);
  }

  async getAvailableForCard(userId: string) {
    return this.repository.findAvailableForCard(userId);
  }
}