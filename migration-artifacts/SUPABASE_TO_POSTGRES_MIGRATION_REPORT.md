# Supabase → Postgres Migration Report — The Perfume Empire

**Status:** Implemented; **local verification passed** (empty catalog). Staging/prod dump restore **blocked** — no live Supabase export in this workspace.

## Capability matrix

| Supabase capability | Used? | Replacement | Residual dependency |
|---|---|---|---|
| Hosted Postgres | Yes | `DATABASE_URL` + `pg` pool (`lib/db/pool.ts`) | None after cutover |
| PostgREST queries | Yes | In-process shim: `app/rest/v1/[table]/route.ts` + `lib/db/supabase-compat.ts` | Browser still uses `@supabase/supabase-js` pointed at app URL |
| Auth (GoTrue) | Yes | `auth.users` table + `app/auth/v1/[...path]/route.ts` + `lib/db/auth.ts` JWT | `@supabase/supabase-js` on client only (hits local shim) |
| RLS | Yes (Supabase) | Stripped in `schema_plain.sql`; app uses table-owner role via node-pg + route guards | Policies not enforced at DB layer |
| Storage | Yes | Local disk (`STORAGE_ROOT`) + `app/storage/v1/object/**` + `lib/db/storage.ts` | No `storage.buckets` in plain schema |
| RPC | Yes | `app/rest/v1/rpc/[fn]/route.ts` → PostgreSQL functions (`mark_order_paid`, etc.) | None |
| Realtime | No | — | N/A |
| Edge Functions | Partial | Next.js API routes (`app/api/**`) | Legacy `supabase/functions/` mirror only |

## Architecture (plain-Postgres mode)

When `DATABASE_URL` is set (or `NEXT_PUBLIC_USE_PLAIN_PG=true`):

1. **Server** — `supabaseAdmin` (`lib/supabase-admin.ts`) uses the pg compat client, not hosted Supabase.
2. **Browser** — `@supabase/supabase-js` targets `NEXT_PUBLIC_SUPABASE_URL` (the Next app), which serves `/rest/v1`, `/auth/v1`, `/storage/v1`.
3. **Auth** — bcrypt passwords in `auth.users`; JWT signed with `AUTH_JWT_SECRET` / `JWT_SECRET`.
4. **Media** — files under `.storage/` (or mounted volume in production); public URLs via `/storage/v1/object/public/...`.

## Schema artifacts

| File | Purpose |
|---|---|
| `migration-artifacts/01_auth_bootstrap.sql` | Standalone auth stub (also embedded in `schema_plain.sql`) |
| `migration-artifacts/schema_plain.sql` | Full apply-once schema: enums, tables, indexes, functions, triggers; RLS enabled without Supabase role policies; no storage schema |

## Residual Supabase dependencies

- `@supabase/supabase-js` — browser client + fallback when `DATABASE_URL` unset (dual-mode).
- `supabase/` folder — historical migrations; not executed in plain-Postgres deploy.
- `SUPABASE_SERVICE_ROLE_KEY` — only required in hosted-Supabase mode.

## Blocked / not verified

- Live data migration (products, orders, images) — requires Supabase dump via `~/Documents/Websites/Migration/toolkit/dump-site.mjs`.
- Staging restore + Gate A/B/C — requires fleet DB provision + Coolify app on big-vps.
- Payment key presence check before prod DNS flip (Moolre / Paystack / Resend).

## Local smoke (executed 2026-09-20)

```bash
npm run db:migrate
npm run create-admin
npm run dev
```

Evidence: `migration-artifacts/TEST_EVIDENCE.md`. Home/shop/admin login 200; wrong-password token 400; seeded admin password grant 200. Featured products array is empty until a source dump is restored.
