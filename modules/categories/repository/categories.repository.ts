import { db } from '@/lib/database';
import { categories } from '@/lib/database/schema';
import { eq, and, isNull, isNotNull, ilike, sql } from 'drizzle-orm';

export class CategoriesRepository {
  async findAll(userId: string, { limit = 10, offset = 0, search = '', includeDeleted = false, deletedOnly = false }) {
    let where = eq(categories.userId, userId);

    if (deletedOnly) {
      where = and(where, isNotNull(categories.deletedAt)) as any;
    } else if (!includeDeleted) {
      where = and(where, isNull(categories.deletedAt)) as any;
    }

    if (search) {
      where = and(where, ilike(categories.name, `%${search}%`)) as any;
    }

    const data = await db.query.categories.findMany({
      where,
      limit,
      offset,
      orderBy: (categories, { desc }) => [desc(categories.createdAt)],
    });

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(categories)
      .where(where);

    const total = Number(totalResult[0].count);

    return { data, total };
  }

  async findById(id: string, userId: string, includeDeleted = true) {
    const where = and(
      eq(categories.id, id),
      eq(categories.userId, userId),
      includeDeleted ? undefined : isNull(categories.deletedAt)
    );

    return await db.query.categories.findFirst({
      where,
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

  async restore(id: string, userId: string) {
    return await db
      .update(categories)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();
  }

  async hardDelete(id: string, userId: string) {
    return await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();
  }
}