import { AccountsService } from './accounts.service';
import { AccountsRepository } from '../repository/accounts.repository';
import { AppError } from '@/core/errors';

jest.mock('../repository/accounts.repository');

describe('AccountsService', () => {
  let service: AccountsService;
  let repo: jest.Mocked<AccountsRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AccountsService();
    repo = (service as any).repository;
  });

  const userId = 'user-1';
  const accountId = 'acc-1';

  describe('delete (soft delete)', () => {
    it('should soft delete account when it exists and is active', async () => {
      repo.findById.mockResolvedValue({ id: accountId, userId, deletedAt: null } as any);
      repo.softDelete.mockResolvedValue([{ id: accountId, deletedAt: new Date() }] as any);

      await service.delete(accountId, userId);

      expect(repo.findById).toHaveBeenCalledWith(accountId, userId, true);
      expect(repo.softDelete).toHaveBeenCalledWith(accountId, userId);
    });

    it('should throw 409 when account is already deleted', async () => {
      repo.findById.mockResolvedValue({ id: accountId, userId, deletedAt: new Date() } as any);

      await expect(service.delete(accountId, userId)).rejects.toThrow('Account is already deleted');
    });

    it('should throw 404 when account does not exist', async () => {
      repo.findById.mockResolvedValue(null as any);

      await expect(service.delete(accountId, userId)).rejects.toThrow('Account not found');
    });
  });

  describe('restore', () => {
    it('should restore account when it exists and is deleted', async () => {
      repo.findById.mockResolvedValue({ id: accountId, userId, deletedAt: new Date() } as any);
      repo.restore.mockResolvedValue([{ id: accountId, deletedAt: null }] as any);

      await service.restore(accountId, userId);

      expect(repo.findById).toHaveBeenCalledWith(accountId, userId, true);
      expect(repo.restore).toHaveBeenCalledWith(accountId, userId);
    });

    it('should throw 409 when account is already active', async () => {
      repo.findById.mockResolvedValue({ id: accountId, userId, deletedAt: null } as any);

      await expect(service.restore(accountId, userId)).rejects.toThrow('Account is already active');
    });

    it('should throw 404 when account does not exist', async () => {
      repo.findById.mockResolvedValue(null as any);

      await expect(service.restore(accountId, userId)).rejects.toThrow('Account not found');
    });
  });

  describe('forceDelete', () => {
    it('should hard delete account when it exists', async () => {
      repo.findById.mockResolvedValue({ id: accountId, userId } as any);
      repo.hardDelete.mockResolvedValue([{ id: accountId }] as any);

      await service.forceDelete(accountId, userId);

      expect(repo.hardDelete).toHaveBeenCalledWith(accountId, userId);
    });
  });
});
