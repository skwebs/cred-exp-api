import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import { env } from '@/core/env';
import * as schema from './schema';

// Required for WebSocket support in Node.js environments (like local development or standard Vercel functions)
if (typeof window === 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

const pool = new Pool({ connectionString: env.DATABASE_URL });

export const db = drizzle(pool, { schema });
