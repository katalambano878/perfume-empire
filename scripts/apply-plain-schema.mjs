/**
 * Apply plain-Postgres schema (auth bootstrap + public schema) once.
 * Run from project root: node scripts/apply-plain-schema.mjs
 *
 * Loads DATABASE_URL from .env.local if present.
 * schema_plain.sql already includes 01_auth_bootstrap.sql — applied as a single file.
 */

import pg from 'pg';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  const env = { ...process.env };
  const path = resolve(root, '.env.local');
  if (!existsSync(path)) return env;
  const content = readFileSync(path, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const m = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m && env[m[1]] === undefined) {
      env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  }
  return env;
}

const env = loadEnv();
const databaseUrl = env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Missing DATABASE_URL in .env.local or environment.');
  process.exit(1);
}

const schemaPath = resolve(root, 'migration-artifacts/schema_plain.sql');
if (!existsSync(schemaPath)) {
  console.error('Missing migration-artifacts/schema_plain.sql');
  process.exit(1);
}

const sql = readFileSync(schemaPath, 'utf-8');

const ssl =
  env.DATABASE_SSL === 'disable'
    ? false
    : /@(localhost|127\.0\.0\.1)/.test(databaseUrl)
      ? false
      : { rejectUnauthorized: false };

const client = new pg.Client({ connectionString: databaseUrl, ssl });

async function main() {
  console.log('Applying plain Postgres schema...');
  await client.connect();
  try {
    await client.query(sql);
    console.log('Schema applied successfully.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Schema apply failed:', err.message);
  process.exit(1);
});
