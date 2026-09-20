# Test evidence — The Perfume Empire (local plain Postgres)

**Date:** 2026-09-20 (audit pass)  
**Environment:** local Next.js 15.1.11 + PostgreSQL 16 on 127.0.0.1  
**Mode:** `DATABASE_URL` set, `NEXT_PUBLIC_USE_PLAIN_PG=true`

## Commands

| Command | Result |
|---|---|
| `node scripts/apply-plain-schema.mjs` | PASS — schema applied (earlier) |
| `node scripts/create-admin.mjs` | PASS — admin profile role=admin |
| `node scripts/seed-demo-catalog.mjs` | PASS — Women + Empire Oud + storage PNG |

## HTTP smoke (localhost:3000)

| Check | Result |
|---|---|
| `GET /` `/shop` `/about` `/contact` `/cart` `/checkout` `/admin/login` | 200 |
| `GET /api/storefront/products?featured=true` | 200 JSON array length **1** |
| REST embed `product_images(url,position)` | 200 nested image URL |
| REST `categories.slug=in.(women)` + `categories!inner` | 200 Empire Oud |
| REST `product_variants(count)` | 200 `[{ count: 1 }]` |
| Storage public object | 200 `image/png` |
| Wrong password grant | **400** |
| Admin password grant | **200**, role admin |
| `/admin` with cookie | 200; without cookie 307 login |
| Homepage HTML `supabase.co` | none |

## Browser (headless Chrome)

| Check | Result |
|---|---|
| Home / shop dump-dom | Empire Oud + storage image path |
| Admin login form on HTTP | Redirects to `/admin` dashboard |
| Admin products | Empire Oud, SKU TPE-OUD-001, Women, GH₵ 450 |

## Gate C REST

| Check | Result |
|---|---|
| Insert order + order_item | 201 |
| `upsert_customer_from_order` | 200 UUID |
| Payment providers | not run (keys unset) |

## Remaining

Demo catalog only. Live dump, Coolify staging/prod, and payment keys are still outstanding. See `diagnosis/perfume-empire-2026-09-20.md`.
