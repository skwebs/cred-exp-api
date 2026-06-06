import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(8),
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.warn('⚠️ Missing or invalid environment variables. Some features may not work.');
}

export const env = _env.success ? _env.data : {
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://user:pass@localhost/db',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-for-build',
  PORT: process.env.PORT || '3000',
  NODE_ENV: (process.env.NODE_ENV as any) || 'development',
};
