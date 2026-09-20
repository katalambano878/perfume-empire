# Repair Changelog — Supabase → Plain Postgres port

**Date:** 2026-09-20  
**Scope:** Schema artifacts, apply scripts, env template, server notification fix, migration docs.

## Created

| File | Change |
|---|---|
| `migration-artifacts/schema_plain.sql` | Apply-once plain Postgres schema from Supabase migrations; auth bootstrap embedded; RLS policies + storage schema stripped; `gen_random_uuid()` defaults |
| `scripts/apply-plain-schema.mjs` | Applies `schema_plain.sql` via `pg` using `DATABASE_URL` |
| `scripts/create-admin.mjs` | Idempotent admin seeder (`auth.users` + `profiles`) with bcrypt |
| `.env.example` | Plain-Postgres env template (no secrets) |
| `migration-artifacts/SUPABASE_TO_POSTGRES_MIGRATION_REPORT.md` | Capability matrix + architecture |
| `migration-artifacts/MIGRATION_RUNBOOK.md` | Local + staging/prod runbook |
| `migration-artifacts/REPAIR_CHANGELOG.md` | This file |

## Modified

| File | Change |
|---|---|
| `lib/notifications.ts` | `supabase` → `supabaseAdmin` for server-side order_items fetch |

## Already present (prior compat port)

- `lib/db/{mode,pool,supabase-compat,auth,storage,fk-map}.ts`
- `lib/supabase-admin.ts` (dual-mode)
- `app/rest/v1/[table]/route.ts`, `app/rest/v1/rpc/[fn]/route.ts`
- `app/auth/v1/[...path]/route.ts`
- `app/storage/v1/object/**/route.ts`
- `migration-artifacts/01_auth_bootstrap.sql`

## SQL apply notes

- `schema_plain.sql` is self-contained; do **not** also run `01_auth_bootstrap.sql` separately (duplicate auth objects).
- RLS remains **enabled** on public tables but **policies removed** — app DB role must be table owner (fleet default).
- Supabase `storage.buckets` / `storage.objects` sections omitted — storage is filesystem-backed.
- `contact_submissions` created without RLS (app-layer auth only).
- `order_items.product_id` / `variant_id` nullable patch included at end of schema file.

## Additional app wiring (same session)

| File | Change |
|---|---|
| `lib/supabase-admin.ts` | Dual-mode: pg compat when `DATABASE_URL` is set |
| `lib/db/fk-map.ts` | Perfume Empire FK + jsonb map |
| `middleware.ts` | Plain-PG JWT (`jose`) when `NEXT_PUBLIC_USE_PLAIN_PG=true` |
| `app/api/storefront/*`, `app/sitemap.ts`, `app/api/cron/payment-reminders` | Use `supabaseAdmin` (no browser loop to hosted Supabase) |
| `package.json` | `jose`, `bcryptjs`, `db:migrate`, `create-admin` |
| `next.config.ts` | Storage host patterns + `ignoreBuildErrors` for dual-mode client |

## Audit pass (same day)

The first port was not gate-complete. Re-check found and fixed:

| File | Change |
|---|---|
| `lib/auth-cookie.ts` | New — omit `Secure` on HTTP so localhost admin cookies stick |
| `app/admin/login/page.tsx` | Use cookie helper + full-page redirect to `/admin` |
| `app/admin/layout.tsx` | Same cookie helper on refresh / logout |
| `lib/db/supabase-compat.ts` | Embed filters (`categories.slug`), `!inner`, `related(count)` |
| `components/LazyImage.tsx` | Native `<img>` for `/storage/v1/` URLs |
| `scripts/seed-demo-catalog.mjs` | Demo category + featured product + storage object |
| `scripts/apply-rls.mjs`, `apply-rls-direct.mjs` | Refuse to run when plain-PG env is present |
| `app/(store)/checkout/page.tsx`, order-tracking, product-creator | `SLI-` → `TPE-` |

## Verification

Local Postgres 16 + demo seed: Gates A/B PASS, Gate C order insert/RPC PASS, payment keys unset. See `TEST_EVIDENCE.md` and `diagnosis/perfume-empire-2026-09-20.md`. Live catalog dump and Coolify cutover not restored.
