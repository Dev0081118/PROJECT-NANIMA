import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { pool } from './client';

async function migrate(): Promise<void> {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  const client = await pool.connect();
  try {
    console.log('[migrate] Running database migrations...');
    await client.query(schema);
    console.log('[migrate] ✅ Schema applied successfully.');
  } catch (err) {
    console.error('[migrate] ❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
