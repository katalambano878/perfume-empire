/**
 * Create an admin user directly in PostgreSQL (auth.users + profiles).
 * Run from project root: node scripts/create-admin.mjs
 *
 * Loads DATABASE_URL from .env.local if present.
 * ADMIN_EMAIL / ADMIN_PASSWORD optional (see defaults below).
 */

import pg from 'pg';
import bcrypt from 'bcryptjs';
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
const adminEmail = (env.ADMIN_EMAIL || 'admin@theperfumeempire.com').toLowerCase();
const adminPassword = env.ADMIN_PASSWORD || 'Admin123!';

if (!databaseUrl) {
  console.error('Missing DATABASE_URL in .env.local or environment.');
  process.exit(1);
}

const ssl =
  env.DATABASE_SSL === 'disable'
    ? false
    : /@(localhost|127\.0\.0\.1)/.test(databaseUrl)
      ? false
      : { rejectUnauthorized: false };

const client = new pg.Client({ connectionString: databaseUrl, ssl });

async function main() {
  await client.connect();
  console.log('Creating admin user...');
  console.log('Email:', adminEmail);

  const hash = await bcrypt.hash(adminPassword, 10);

  const res = await client.query(
    `INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, last_sign_in_at)
     VALUES ($1, $2, now(), now())
     ON CONFLICT (email) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password
     RETURNING id`,
    [adminEmail, hash]
  );
  const userId = res.rows[0].id;

  await client.query(
    `INSERT INTO public.profiles (id, email, role)
     VALUES ($1, $2, 'admin')
     ON CONFLICT (id) DO UPDATE SET role = 'admin', email = EXCLUDED.email`,
    [userId, adminEmail]
  );

  console.log('Admin user ready.');
  console.log('  id   :', userId);
  console.log('  email:', adminEmail);
  console.log('Log in at /admin/login');
  await client.end();
}

main().catch(async (err) => {
  console.error('Failed:', err.message);
  try {
    await client.end();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
