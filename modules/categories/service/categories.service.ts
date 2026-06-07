import { CategoriesRepository } from '../repository/categories.repository';
import { AppError } from '@/core/errors';

export class CategoriesService {
  private repository: CategoriesRepository;

  constructor() {
    this.repository = new CategoriesRepository();
  }

  async getAll(userId: string, query: any) {
    return this.repository.findAll(userId, query);
  }

  async getById(id: string, userId: string) {
    const category = await this.repository.findById(id, userId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return category;
  }

  async create(userId: string, data: any) {
    const [category] = await this.repository.create({ ...data, userId });
    return category;
  }

  async update(id: string, userId: string, data: any) {
    const category = await this.repository.findById(id, userId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    const [updatedCategory] = await this.repository.update(id, userId, data);
    return updatedCategory;
  }

  async delete(id: string, userId: string) {
    const category = await this.repository.findById(id, userId, true);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    if (category.deletedAt) {
      throw new AppError('Category is already deleted', 409);
    }
    return this.repository.softDelete(id, userId);
  }

  async restore(id: string, userId: string) {
    const category = await this.repository.findById(id, userId, true);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    if (!category.deletedAt) {
      throw new AppError('Category is already active', 409);
    }
    return this.repository.restore(id, userId);
  }

  async forceDelete(id: string, userId: string) {
    const category = await this.repository.findById(id, userId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return this.repository.hardDelete(id, userId);
  }
}