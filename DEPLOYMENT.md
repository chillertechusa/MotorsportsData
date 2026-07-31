# Bike Doctor — Deployment Guide

## Prerequisites
- GitHub account connected
- Vercel account (vercel.com)
- Environment variables ready (see below)

## Environment Variables Required

```bash
# Database
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=<run: openssl rand -base64 32>

# Email (Resend)
RESEND_API_KEY=re_...

# AI/Inference
VERCEL_AI_GATEWAY_API_KEY=... (or provider keys)

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G_...
NEXT_PUBLIC_GTAG_ID=GT-...

# Demo/Features
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## Step 1: Deploy to Vercel

```bash
git push origin main
```

Then connect your GitHub repo at https://vercel.com/new and select the `MotorsportsData` repository.

## Step 2: Add Environment Variables

In Vercel Project Settings → Environment Variables:
1. Add `DATABASE_URL` (Neon connection string)
2. Add `BETTER_AUTH_SECRET` (generate with `openssl rand -base64 32`)
3. Add `RESEND_API_KEY` (from https://resend.com)
4. Add `VERCEL_AI_GATEWAY_API_KEY` (if using third-party LLMs)
5. Add `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_BASE_URL`

## Step 3: Run Database Migration

After deployment, run the migration to create tables:

```bash
npm run db:migrate
# or
pnpm exec drizzle-kit migrate
```

## Step 4: Seed Demo Data

```bash
npm run seed
# or
node scripts/seed-data.ts
```

This populates:
- Shop directory (100+ local shops)
- Bike models (KTM, Yamaha, Honda, Suzuki, Kawasaki)
- Popular tracks (50+ US motocross venues)
- Martinez family demo + Moto Dad family + Coach demo

## Step 5: Configure Email (Resend)

1. Go to https://resend.com and create account
2. Create API key and add to `RESEND_API_KEY` env var
3. Set your "From" domain (e.g., noreply@yourdomain.com)

## Step 6: Set Up Analytics

**Google Analytics (Optional):**
1. Create GA4 property at https://analytics.google.com
2. Get Measurement ID (G_...)
3. Add to `NEXT_PUBLIC_GA_ID` env var

**PostHog (Optional for session recording):**
1. Create account at https://posthog.com
2. Get API key and add to `NEXT_PUBLIC_POSTHOG_KEY`

## Step 7: Verify Deployment

- Landing page: `https://yourdomain.com`
- Pricing: `https://yourdomain.com/pricing`
- Demo: `https://yourdomain.com/data/rider`
- Admin: `https://yourdomain.com/admin`
- FAQ: `https://yourdomain.com/faq`
- Help: `https://yourdomain.com/help`

## Scaling Considerations

- **Database:** Neon auto-scales. For high volume, upgrade plan.
- **API Rate Limits:** AI Gateway has built-in rate limiting. Monitor usage.
- **Email:** Resend allows up to 100 emails/day on free tier. Upgrade for production.
- **Storage:** Blob storage (if added) auto-scales with usage.

## Monitoring

Track these key metrics:
- Demo starts (`trackDemoStarted`)
- Sign-ups (`trackSignup`)
- Coach invites (`trackCoachInvited`)
- Diagnosis generations (`trackDiagnosisGenerated`)
- Work orders sent (`trackWorkOrderSent`)

All events are logged to analytics backend + GA4.

## Support

- Vercel Status: https://www.vercel-status.com
- Neon Dashboard: https://console.neon.tech
- Resend Docs: https://resend.com/docs
