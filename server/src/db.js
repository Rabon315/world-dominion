const { Pool } = require('pg');
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
  max: Number(process.env.PG_POOL_MAX || 15), idleTimeoutMillis: 30000, connectionTimeoutMillis: 10000
});
pool.on('error', err => console.error('[db] idle client error', err.message));
async function migrate() {
  const fs = require('node:fs'); const path = require('node:path');
  await pool.query(fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8'));
}
module.exports = { pool, migrate };
