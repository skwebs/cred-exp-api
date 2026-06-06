import { defineConfig } from 'drizzle-kit';
import { env } from './core/env';

export default defineConfig({
  schema: './lib/database/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
