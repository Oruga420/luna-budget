import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("CRITICAL: DATABASE_URL is not set in environment variables.");
}

const pool = new pg.Pool({
  connectionString,
  ssl: connectionString?.includes("sslmode=require") ? { rejectUnauthorized: false } : false,
  max: 10, // Limit connections in serverless
});

export const db = drizzle(pool, { schema });
