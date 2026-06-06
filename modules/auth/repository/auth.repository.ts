import { db } from '@/lib/database';
import { users } from '@/lib/database/schema';
import { eq } from 'drizzle-orm';

export class AuthRepository {
  async findByEmail(email: string) {
    return await db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  async findById(id: string) {
    return await db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  async create(data: any) {
    return await db.insert(users).values(data).returning();
  }
}
