# Bike Doctor — Deployment Guide

> This project uses **pnpm** (see `packageManager`/lockfile) and **Drizzle ORM**
> on top of `node-postgres`. Commands below use `pnpm`. All script names have
> been verified against `package.json`.

## Prerequisites
- GitHub repo connected (chillertechusa/MotorsportsData)
- Vercel account
- A Postgres database (Neon recommended)
- Environment variables ready (see below)

## Environment Variables

Required for the app to run:

```bash
# Database (Neon or any Postgres). Use the POOLED connection string on Vercel.
DATABASE_URL=postgresql://...

# Better Auth — session signing secret
BETTER_AUTH_SECRET=            # generate: openssl rand -base64 32
```

Required only for specific features (the app boots without them, but the
related feature is disabled until set):

```bash
# Transactional email (coach invites, notifications) — lib/md-email.ts
RESEND_API_KEY=re_...

# AI diagnosis. Zero-config providers (OpenAI/Anthropic/Bedrock/Vertex/Fireworks)
# work through the Vercel AI Gateway on Vercel with no key. For other providers:
AI_GATEWAY_API_KEY=...

# Absolute base URL — used by server-to-server fetches in the demo seeders
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

> NOTE: Verify each variable name against the code that reads it before relying
> on it — search with `grep -rn "process.env.NAME"`. Do not add variables the
> code never reads.

## Step 1 — Create the database schema

This is the critical first step. A fresh database has **no tables**; the app
will 500 on every query until the schema is applied. There are 93 tables.

Two supported options (run locally with `DATABASE_URL` pointing at the target DB,
or as a one-off in CI):

```bash
# Option A — push the schema straight to the DB (simplest for a fresh DB)
pnpm db:push

# Option B — apply the tracked SQL migration (drizzle/0000_init_schema.sql)
pnpm db:migrate
```

`drizzle.config.ts` loads `DATABASE_URL` from `.env.development.local` locally,
or from `process.env` in CI/Vercel. Inspect the schema visually with:

```bash
pnpm db:studio
```

Available db scripts (defined in `package.json`):
- `pnpm db:generate` — regenerate SQL migrations from `lib/db/schema.ts`
- `pnpm db:migrate`  — apply tracked migrations in `drizzle/`
- `pnpm db:push`     — diff the schema directly onto the DB (no migration files)
- `pnpm db:studio`   — open Drizzle Studio

## Step 2 — Deploy to Vercel

```bash
git push origin <your-branch>   # open a PR, or push to the connected branch
```

Import the repo at https://vercel.com/new, then add the environment variables
from above in Project Settings → Environment Variables. Redeploy after adding them.

## Step 3 — Create the owner/admin account

The King Console (`/admin`) requires a user whose `role` is `admin` or `owner`.
Create your first user through the normal sign-up flow at `/auth/sign-up`, then
promote it to `owner` directly in the database:

```sql
UPDATE "user" SET role = 'owner' WHERE email = 'you@example.com';
```

> The older `scripts/setup-owner-account.ts` and `scripts/seed-demo-data.ts` are
> STALE — they reference tables/columns that no longer exist in the schema
> (`mdUsers`, `mdTierPlans`, a `password` column on `user`) and depend on
> `bcryptjs`, which is not installed. Do not run them as-is. Better Auth stores
> credentials in the `account` table, so create real accounts via `/auth/sign-up`.

## Step 4 — Verify

- Landing page: `/`
- Pricing: `/pricing`
- Rider demo: click "Try it free" on `/`, or visit `/data/rider`
- Admin console: `/admin` (requires owner/admin role)
- FAQ / Help: `/faq`, `/help`

Health check (verifies env + DB connectivity):

```bash
pnpm health:check
```

## What is NOT wired yet (roadmap, not blockers)

- **Seed data for shops/bike catalog** — there is no `shops` or bike-catalog
  table in the schema; the demo uses `md_vehicles`, `md_tracks`, and the
  per-persona seed API routes (`/api/md-owner/seed-*`). A bulk shop directory
  would require a new table + a fresh seeder.
- **Payments** — pricing tiers are displayed but no Stripe/Square checkout is
  wired to them for self-serve upgrades.
- **Coach invite email delivery** — the template and API exist; delivery
  requires `RESEND_API_KEY` and a verified sending domain.

## Scaling & Monitoring

- **Database:** Neon auto-scales; use the pooled connection string in serverless.
- **Email:** Resend free tier is limited; upgrade for production volume.
- **Analytics events** (in `lib/analytics.ts`): `demo_started`, `signup`,
  `coach_invited`, `diagnosis_generated`, `work_order_sent`.

## Support

- Vercel status: https://www.vercel-status.com
- Neon console: https://console.neon.tech
- Resend docs: https://resend.com/docs
