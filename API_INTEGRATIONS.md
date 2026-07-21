# Motorsports Data — API Integrations Checklist

## Required Integrations (Production-Ready)

### Authentication & Database
- **Better Auth** — User authentication, sessions, account management
  - Status: ✅ BUILT
  - Setup: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
  - Connection: Neon PostgreSQL (via DATABASE_URL)

### Payment Processing
- **Square** — Checkout, subscriptions, tier billing
  - Status: ✅ BUILT
  - Env Vars: `NEXT_PUBLIC_SQUARE_APPLICATION_ID`, `NEXT_PUBLIC_SQUARE_LOCATION_ID`, `SQUARE_ACCESS_TOKEN`
  - Docs: https://developer.squareup.com

### Email & Notifications
- **Resend** — Transactional emails (expiry alerts, notifications, invites)
  - Status: ✅ BUILT
  - Env Vars: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
  - Docs: https://resend.com

### Analytics & Tracking
- **Google Analytics 4** — User behavior, conversion tracking
  - Status: ✅ BUILT
  - Env Vars: `NEXT_PUBLIC_GA4_ID` (stored in gtag.ts)
  - ID: `G-TDDBD84WMF`

- **Google Ads** — Conversion pixels for ROI tracking
  - Status: ✅ BUILT
  - Env Vars: `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_GOOGLE_ADS_SUBSCRIBE_LABEL`
  - ID: `AW-18280838051`, Label: `EeN5CMXvt8gcEKPn_YxE`

### Search & Indexing
- **Bing Webmaster Tools** — Search engine indexing
  - Status: ✅ CONFIGURED
  - Env Var: `NEXT_PUBLIC_BING_SITE_VERIFICATION`

- **Google Search Console** — SEO monitoring
  - Status: ✅ CONFIGURED
  - Env Var: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`

### Cache & Storage
- **Upstash Redis** — Session store, rate limiting, caching
  - Status: ✅ BUILT
  - Env Vars: `KV_REST_API_URL`, `KV_REST_API_TOKEN`
  - Used for: Daily expiry alerts cron, cache layer

### Cron & Scheduled Tasks
- **Vercel Cron** — Daily expiry alert job at 9 AM UTC
  - Status: ✅ BUILT
  - Env Var: `CRON_SECRET`
  - Endpoint: `/api/cron/expiry-alerts`

### Push Notifications & PWA
- **Web Push Protocol (VAPID)** — Push notifications for riders
  - Status: ✅ BUILT
  - Env Vars: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
  - Docs: https://developer.mozilla.org/en-US/docs/Web/API/Push_API

---

## Wearable & Telemetry Integrations (Implemented)

### Terra (Wearable Data Layer) — PENDING ACCOUNT SETUP
- **Status:** Code ready, credentials not configured
- **Env Vars:** `TERRA_API_KEY`, `TERRA_DEV_ID`, `TERRA_WEBHOOK_SECRET`
- **Supported Devices via Terra:**
  - Garmin (HR monitors, smartwatches)
  - Polar (H10, sports watches)
  - Apple Watch (via Apple HealthKit)
  - Whoop
  - Oura Ring
  - Fitbit
- **Docs:** https://docs.terraapi.com
- **Account:** https://console.terraapi.com

### Direct Wearable OAuth (Configured)
- **Garmin OAuth** — Direct integration
  - Auth URL: https://connect.garmin.com/oauth-service/oauth/authorize
  - Token URL: https://connect.garmin.com/oauth-service/oauth/access_token
  - Status: Code ready, credentials not configured

- **Polar OAuth** — Direct integration
  - Auth URL: https://flow.polar.com/oauth2/authorization
  - Token URL: https://api.polar.com/oauth2/token
  - Status: Code ready, credentials not configured

### Telemetry Device Parsers (File-Based, No Account Needed)
- **MYLAPSTR2, Westhold G3, Anubesport Stella** — CSV/XML parsers built
- **RaceBox LIT Pro, Crossbox CBX20** — Binary parser framework ready
- **AiM Solo 2.X / Taipan ECU** — XRK/DRK parser (external SDK integration pending)
- **Alpinestars Tech-Air MX** — Data import ready
- **Apple Watch** — CoreData sync (iOS app)
- **Garmin FIT SDK** — External library integration pending

---

## External Services (Reference/Non-Account)

### Public Data APIs
- **USDA NASS (Demo Key)** — Agricultural data for sand/soil conditions
  - Key: `DEMO_KEY` (hardcoded, 30 req/hr per IP)
  - Status: Placeholder for future nutrition/track surface analysis

- **IndexNow** — Search engine indexing notification
  - Key: `6ef3c7339f654a96b52269b874127173` (hardcoded)
  - Status: SEO automation, no account needed

---

## Environment Variables Summary

### Production Required
```
DATABASE_URL                           (Neon PostgreSQL)
BETTER_AUTH_SECRET                     (Random 32-byte)
SQUARE_ACCESS_TOKEN                    (Square dashboard)
SQUARE_LOCATION_ID                     (Square dashboard)
RESEND_API_KEY                         (Resend dashboard)
TERRA_API_KEY                          (PENDING - Terra console)
TERRA_DEV_ID                           (PENDING - Terra console)
TERRA_WEBHOOK_SECRET                   (PENDING - Terra console)
KV_REST_API_URL                        (Upstash dashboard)
KV_REST_API_TOKEN                      (Upstash dashboard)
CRON_SECRET                            (Random string)
VAPID_PUBLIC_KEY                       (Generated)
VAPID_PRIVATE_KEY                      (Generated)
VAPID_SUBJECT                          (Email or URL)
```

### Public/Client-Side
```
NEXT_PUBLIC_SQUARE_APPLICATION_ID      (Square dashboard)
NEXT_PUBLIC_SQUARE_LOCATION_ID         (Square dashboard)
NEXT_PUBLIC_GOOGLE_ADS_ID              (Google Ads)
NEXT_PUBLIC_GOOGLE_ADS_SUBSCRIBE_LABEL (Google Ads)
NEXT_PUBLIC_GA4_ID                     (Google Analytics)
NEXT_PUBLIC_SUPABASE_URL               (If using Supabase, currently Neon)
NEXT_PUBLIC_BING_SITE_VERIFICATION    (Bing)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION  (Google)
NEXT_PUBLIC_VAPID_PUBLIC_KEY           (For push notifications)
```

---

## Setup Priority

### Phase 1: Critical (Must Have Before Launch)
1. ✅ Better Auth + Neon Database
2. ✅ Square (payments)
3. ✅ Resend (emails)
4. ✅ Google Analytics + Ads
5. 🔴 **Terra (Wearable data) — PENDING**

### Phase 2: Important (Within 30 Days)
6. Garmin OAuth (direct integration)
7. Polar OAuth (direct integration)
8. Upstash Redis (caching optimization)

### Phase 3: Nice-to-Have (Future)
9. Sentry (error tracking)
10. PostHog (product analytics)
11. AiM / FIT SDK integrations

---

## Next Steps

1. **Create Terra account:** https://console.terraapi.com → Generate API key, Dev ID, webhook secret
2. **Configure env vars** on Vercel project settings
3. **Test wearable flows** — Garmin/Polar/Apple sync
4. **Set up Garmin/Polar OAuth apps** for direct integrations (lower latency than Terra)
5. **Enable push notifications** — Generate VAPID keys and distribute to PWA

