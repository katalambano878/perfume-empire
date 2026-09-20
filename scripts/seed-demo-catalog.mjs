/**
 * Seed a local catalog so Gates A/B can be verified without a live dump.
 * Idempotent on slugs. Writes one public storage object.
 *
 * Run: node scripts/seed-demo-catalog.mjs
 */

import pg from 'pg';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
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

const ssl =
  env.DATABASE_SSL === 'disable'
    ? false
    : /@(localhost|127\.0\.0\.1)/.test(databaseUrl)
      ? false
      : { rejectUnauthorized: false };

const storageRoot = env.STORAGE_ROOT || join(root, '.storage');
const objectRel = join('product-images', 'seed', 'empire-oud.png');
const objectAbs = join(storageRoot, objectRel);
const imageUrl = '/storage/v1/object/public/product-images/seed/empire-oud.png';

// 64×64 gold PNG — enough for admin/storefront thumbnails
const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
  'base64'
);

const client = new pg.Client({ connectionString: databaseUrl, ssl });

async function main() {
  mkdirSync(dirname(objectAbs), { recursive: true });
  writeFileSync(objectAbs, PNG_1X1);
  writeFileSync(
    `${objectAbs}.meta.json`,
    JSON.stringify({ contentType: 'image/png' })
  );

  await client.connect();

  const cat = await client.query(
    `INSERT INTO public.categories (name, slug, description, status, position)
     VALUES ('Women', 'women', 'Women''s fragrances', 'active', 1)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, status = 'active'
     RETURNING id`
  );
  const categoryId = cat.rows[0].id;

  const prod = await client.query(
    `INSERT INTO public.products (
        name, slug, description, short_description, price, compare_at_price,
        sku, quantity, category_id, brand, status, featured, rating_avg, review_count
     ) VALUES (
        'Empire Oud', 'empire-oud',
        'A warm oud and amber fragrance for evening wear.',
        'Oud, amber, and vanilla.',
        450, 520, 'TPE-OUD-001', 24, $1, 'The Perfume Empire', 'active', true, 4.8, 12
     )
     ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        category_id = EXCLUDED.category_id,
        status = 'active',
        featured = true,
        quantity = EXCLUDED.quantity
     RETURNING id`,
    [categoryId]
  );
  const productId = prod.rows[0].id;

  await client.query(`DELETE FROM public.product_images WHERE product_id = $1`, [productId]);
  await client.query(
    `INSERT INTO public.product_images (product_id, url, alt_text, position)
     VALUES ($1, $2, 'Empire Oud bottle', 0)`,
    [productId, imageUrl]
  );

  await client.query(
    `INSERT INTO public.product_variants (product_id, name, sku, price, quantity, option1)
     VALUES ($1, '100ml', 'TPE-OUD-001-100', 450, 24, '100ml')
     ON CONFLICT (sku) DO UPDATE SET price = EXCLUDED.price, quantity = EXCLUDED.quantity`,
    [productId]
  );

  console.log('Demo catalog ready.');
  console.log('  category:', categoryId, 'women');
  console.log('  product :', productId, 'empire-oud (featured)');
  console.log('  image   :', imageUrl);
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
