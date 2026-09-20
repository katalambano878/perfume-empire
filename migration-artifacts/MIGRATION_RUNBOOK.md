# Migration Runbook — The Perfume Empire

Plain-Postgres cutover using the fleet pattern (shopwithgg / badawiasimports compat layer).

**Verification status:** Not run — blocked without live Supabase credentials and staging DB.

---

## 1. Local development

### Prerequisites

- PostgreSQL 15+ (local or Docker)
- Node 20+
- `npm ci`

### Steps

```bash
cd "/Users/dr.barns/Documents/Websites/perfume empire"
cp .env.example .env.local
# Edit DATABASE_URL, AUTH_JWT_SECRET, JWT_SECRET, STORAGE_SIGNING_SECRET
```

Apply schema (single file; includes auth bootstrap):

```bash
npm run db:migrate
# equivalent: node scripts/apply-plain-schema.mjs
```

Seed admin:

```bash
npm run create-admin
# Uses ADMIN_EMAIL / ADMIN_PASSWORD from .env.local
```

Start app:

```bash
npm run dev
```

Smoke checks:

- `http://localhost:3000/` and `/shop` → 200
- `http://localhost:3000/admin/login` → login with admin credentials
- `http://localhost:3000/rest/v1/products?select=id,name&limit=1` → JSON array

Create `.storage/` buckets as needed (`products`, `avatars`, `blog`, `media`, `reviews`) or run existing storage setup scripts.

---

## 2. Staging — dump from live Supabase

Use the fleet migration toolkit:

```bash
cd ~/Documents/Websites/Migration

# Confirm site folder mapping (add perfume-empire to site-config if missing)
node toolkit/site-config.mjs --folder "perfume empire"

# Dump auth hashes + public data from hosted Supabase
node toolkit/dump-site.mjs --folder "perfume empire"
```

Requires `.env.local` in the project with `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (or Management API token in `~/.config/supabase/`).

---

## 3. Staging — provision + restore on big-vps

```bash
cd ~/Documents/Websites/Migration

# Full pipeline through Gate B (adjust when site-config entry exists)
node toolkit/run-site.mjs --folder "perfume empire" --to gateB
```

Toolkit stages: `dump` → `port` → `restore` → `coolify` → `gateB`.

Manual outline if running piecemeal:

1. **Provision DB** on fleet-postgres (Coolify / `fleet db provision`).
2. **Apply schema** if empty DB: copy `migration-artifacts/schema_plain.sql` or run `apply-plain-schema.mjs` against staging `DATABASE_URL`.
3. **Restore data** via `toolkit/prepare-and-restore.mjs` / `restore_generic.py` (preserves `auth.users.encrypted_password`).
4. **Sync storage** — rsync Supabase storage objects into app `STORAGE_ROOT` volume.
5. **Coolify app** — bind sslip FQDN, set env from `.env.example` (+ payment keys), deploy.
6. **Gate A/B/C** — run `Migration/scripts/diagnose-site.mjs --base <staging-url>`.

---

## 4. Production cutover

1. Confirm Gates A/B/C pass on staging (admin images, storefront, checkout).
2. Confirm Moolre / Paystack / Resend env vars present.
3. Provision production DB role + Coolify app on **big-vps**.
4. Restore prod dump; mount storage volume.
5. Update DNS for production domain.
6. Update Moolre callback URL to production `/api/payment/moolre/callback`.
7. Re-run diagnosis on production URL.

---

## 5. Rollback

- **Before DNS flip:** keep Supabase project live; discard empty staging DB if needed.
- **After customer writes on new DB:** do not drop Postgres; restore from `/data/fleet/backups` if rollback required.

---

## Key files

| Path | Role |
|---|---|
| `migration-artifacts/schema_plain.sql` | Apply-once DDL |
| `scripts/apply-plain-schema.mjs` | Local/staging schema apply |
| `scripts/create-admin.mjs` | Idempotent admin seeder |
| `lib/db/*` | pg pool, compat, auth, storage |
| `app/rest/v1/**`, `app/auth/v1/**`, `app/storage/v1/**` | Supabase API shims |
