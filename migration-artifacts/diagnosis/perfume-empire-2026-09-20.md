# Diagnosis — perfume-empire local plain Postgres (2026-09-20)

**Base:** `http://127.0.0.1:3000`  
**Mode:** `DATABASE_URL` + `NEXT_PUBLIC_USE_PLAIN_PG=true`

## Gate A — Public / storefront

| Check | Result |
|---|---|
| `GET /` `/shop` `/about` `/contact` `/cart` `/checkout` | PASS 200 |
| `GET /api/storefront/products?featured=true` | PASS array length 1 (Empire Oud) |
| `GET /rest/v1/products?select=id,name,product_images(url,position)&limit=1` | PASS nested `product_images` non-null |
| `GET /storage/v1/object/public/product-images/seed/empire-oud.png` | PASS 200 `image/png` |
| Homepage / shop rendered product + storage image | PASS (Chrome dump-dom: Empire Oud, `product-images`) |
| Homepage HTML contains `supabase.co` | PASS none |

## Gate B — Admin

| Check | Result |
|---|---|
| `GET /admin/login` | PASS 200 |
| Wrong password `/auth/v1/token` | PASS 400 (not 404) |
| Admin password grant | PASS 200 `app_metadata.role=admin` |
| Cookie + middleware `/admin` | PASS 200; no cookie → 307 login |
| Browser login form (HTTP localhost) | PASS — dashboard + products list |
| Admin products thumbnail URL | PASS `product_images.url` host-relative `/storage/v1/...` |

## Gate C — Commerce

| Check | Result |
|---|---|
| Cart / checkout pages | PASS 200 |
| REST insert `orders` + `order_items` on seeded product | PASS 201 (no FK blow-up) |
| `upsert_customer_from_order` RPC | PASS 200 UUID |
| Payment (Moolre/Paystack) | BLOCKED — keys unset locally |
| Live catalog / orders dump | BLOCKED — demo seed only |

## Failures found in audit (fixed this pass)

1. `Secure` cookies on `http://localhost` — admin login never reached middleware.
2. Embed filters `categories.slug` / `!inner` — shop category query threw `Unsafe SQL identifier`.
3. `product_variants(count)` embed — admin product list would 500.
4. Empty catalog — featured ≥ 1 and admin images impossible until seed.
5. Next/Image on `/storage/` paths — switched to native `<img>`.
6. Leftover `SLI-` tracking/SKU prefix (non–Perfume Empire).
7. Legacy `apply-rls*.mjs` could still target hosted Supabase — now refuse when plain-PG env is present.

## Still not production-done

- No live Supabase dump/restore (catalog beyond one demo SKU).
- No Coolify staging/prod deploy.
- Payment / SMS / Resend not exercised.
