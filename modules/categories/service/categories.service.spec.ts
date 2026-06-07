import { CategoriesService } from './categories.service';
import { CategoriesRepository } from '../repository/categories.repository';
import { AppError } from '@/core/errors';

jest.mock('../repository/categories.repository');

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repo: jest.Mocked<CategoriesRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CategoriesService();
    repo = (service as any).repository;
  });

  const userId = 'user-1';
  const categoryId = 'cat-1';

  describe('delete (soft delete)', () => {
    it('should soft delete category when it exists and is active', async () => {
      repo.findById.mockResolvedValue({ id: categoryId, userId, deletedAt: null } as any);
      repo.softDelete.mockResolvedValue([{ id: categoryId, deletedAt: new Date() }] as any);

      await service.delete(categoryId, userId);

      expect(repo.findById).toHaveBeenCalledWith(categoryId, userId, true);
      expect(repo.softDelete).toHaveBeenCalledWith(categoryId, userId);
    });

    it('should throw 409 when category is already deleted', async () => {
      repo.findById.mockResolvedValue({ id: categoryId, userId, deletedAt: new Date() } as any);

      await expect(service.delete(categoryId, userId)).rejects.toThrow('Category is already deleted');
    });

    it('should throw 404 when category does not exist', async () => {
      repo.findById.mockResolvedValue(null as any);

      await expect(service.delete(categoryId, userId)).rejects.toThrow('Category not found');
    });
  });

  describe('restore', () => {
    it('should restore category when it exists and is deleted', async () => {
      repo.findById.mockResolvedValue({ id: categoryId, userId, deletedAt: new Date() } as any);
      repo.restore.mockResolvedValue([{ id: categoryId, deletedAt: null }] as any);

      await service.restore(categoryId, userId);

      expect(repo.findById).toHaveBeenCalledWith(categoryId, userId, true);
      expect(repo.restore).toHaveBeenCalledWith(categoryId, userId);
    });

    it('should throw 409 when category is already active', async () => {
      repo.findById.mockResolvedValue({ id: categoryId, userId, deletedAt: null } as any);

      await expect(service.restore(categoryId, userId)).rejects.toThrow('Category is already active');
    });

    it('should throw 404 when category does not exist', async () => {
      repo.findById.mockResolvedValue(null as any);

      await expect(service.restore(categoryId, userId)).rejects.toThrow('Category not found');
    });
  });
});
