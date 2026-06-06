import { db } from '@/lib/database';
import { categories } from '@/lib/database/schema';
import { eq, and, isNull, ilike, sql } from 'drizzle-orm';

export class CategoriesRepository {
  async findAll(userId: string, { limit = 10, offset = 0, search = '' }) {
    const where = and(
      eq(categories.userId, userId),
      isNull(categories.deletedAt),
      search ? ilike(categories.name, `%${search}%`) : undefined
    );

    const data = await db.query.categories.findMany({
      where,
      limit,
      offset,
      orderBy: (categories, { desc }) => [desc(categories.createdAt)],
    });

    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(categories)
      .where(where);

    return { data, total: Number(total[0].count) };
  }

  async findById(id: string, userId: string) {
    return await db.query.categories.findFirst({
      where: and(
        eq(categories.id, id),
        eq(categories.userId, userId),
        isNull(categories.deletedAt)
      ),
    });
  }

  async create(data: any) {
    return await db.insert(categories).values(data).returning();
  }

  async update(id: string, userId: string, data: any) {
    return await db
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();
  }

  async softDelete(id: string, userId: string) {
    return await db
      .update(categories)
      .set({ deletedAt: new Date() })
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();
  }
}