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

  async create(userId: string, data: any) {
    return this.repository.create({ ...data, userId });
  }

  async update(id: string, userId: string, data: any) {
    const category = await this.repository.findById(id, userId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return this.repository.update(id, userId, data);
  }

  async delete(id: string, userId: string) {
    const category = await this.repository.findById(id, userId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return this.repository.softDelete(id, userId);
  }
}