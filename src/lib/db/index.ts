import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(client, { schema });
