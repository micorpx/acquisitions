import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

const connectionString = process.env.DATABASE_URL;
const useSsl = connectionString?.includes('sslmode=require') || process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString,
  // Neon connections require TLS; local Postgres can run without it.
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  max: process.env.DB_POOL_SIZE ? parseInt(process.env.DB_POOL_SIZE) : 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const db = drizzle(pool);
const sql = (query, params) => pool.query(query, params);

export { db, sql };
