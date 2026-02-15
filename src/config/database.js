import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon Cloud connection settings
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: process.env.DB_POOL_SIZE ? parseInt(process.env.DB_POOL_SIZE) : 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const db = drizzle(pool);
const sql = (query, params) => pool.query(query, params);

export { db, sql };
