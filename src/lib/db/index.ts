import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("CRITICAL: DATABASE_URL environment variable is missing. Please add it to your Vercel project settings.");
}

const pool = new pg.Pool({
  connectionString,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 10,
});

export const db = drizzle(pool, { schema });
