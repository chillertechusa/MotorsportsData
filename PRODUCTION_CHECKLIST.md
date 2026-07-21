# Production Deployment Checklist — Motorsport Data

## Environment Variables

### Required for Production
- [ ] `NEXT_PUBLIC_SITE_URL` — Production domain (e.g., https://motorsportsdata.io)
- [ ] `NEXT_PUBLIC_APP_URL` — Full app URL for links
- [ ] `DATABASE_URL` — Neon PostgreSQL connection string
- [ ] `BETTER_AUTH_SECRET` — Generated with `openssl rand -base64 32`
- [ ] `SQUARE_ACCESS_TOKEN` — Production Square OAuth token
- [ ] `NEXT_PUBLIC_SQUARE_APPLICATION_ID` — Production Square App ID
- [ ] `NEXT_PUBLIC_SQUARE_LOCATION_ID` — Production Square Location ID
- [ ] `STRIPE_SECRET_KEY` — Stripe production secret
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe production public key
- [ ] `RESEND_API_KEY` — Resend email service API key
- [ ] `UPSTASH_REDIS_REST_URL` — Upstash Redis endpoint
- [ ] `UPSTASH_REDIS_REST_TOKEN` — Upstash Redis auth token
- [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — VAPID public key for push notifications
- [ ] `VAPID_PRIVATE_KEY` — VAPID private key for push notifications

### Analytics & Monitoring
- [ ] `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` — Google Search Console verification token
- [ ] `NEXT_PUBLIC_BING_SITE_VERIFICATION` — Bing Webmaster verification token
- [ ] `NEXT_PUBLIC_GA_ID` — Google Analytics 4 measurement ID (G-XXXXXXXXXX)
- [ ] `NEXT_PUBLIC_GOOGLE_ADS_ID` — Google Ads conversion ID (AW-XXXXXXXXXX)
- [ ] `NEXT_PUBLIC_GOOGLE_ADS_SUBSCRIBE_LABEL` — Google Ads subscribe conversion label
- [ ] `SENTRY_AUTH_TOKEN` — Sentry authentication token for error reporting
- [ ] `SENTRY_ORG` — Sentry organization slug
- [ ] `SENTRY_PROJECT` — Sentry project slug

### Optional (Feature-Gated)
- [ ] `TERRA_API_KEY` — Terra wearable API key (when launching wearable sync)
- [ ] `TERRA_DEV_ID` — Terra developer ID
- [ ] `TERRA_WEBHOOK_SECRET` — Terra webhook signature secret
- [ ] `LIVE_ADMIN_PASSCODE` — Legacy fallback for escalation console (if needed)

---

## Database & Infrastructure

### Database Setup
- [ ] Neon PostgreSQL cluster created and connected
- [ ] All migrations applied (`pnpm drizzle-kit migrate`)
- [ ] Database backups configured (Neon automated backups enabled)
- [ ] RLS policies enabled on all tables
- [ ] Database connection pooling configured (Neon auto-managed)

### Storage
- [ ] Vercel Blob storage initialized
- [ ] Upload bucket policies set to private by default
- [ ] CDN configured for optimized image serving

### Caching & Sessions
- [ ] Upstash Redis cluster created
- [ ] Redis connection tested and monitoring configured
- [ ] Session TTL set appropriately

---

## Security & Monitoring

### Security Headers
- [ ] HSTS enabled (1 year, includeSubDomains, preload)
- [ ] CSP headers deployed and tested
- [ ] X-Frame-Options set to SAMEORIGIN
- [ ] X-Content-Type-Options set to nosniff
- [ ] SSL/TLS certificate valid and auto-renewed

### Error Logging & Monitoring
- [ ] Sentry project created and DSN configured
- [ ] Error alerts configured for critical issues
- [ ] Performance monitoring enabled
- [ ] Replay sampling configured (e.g., 1% of errors, 0.1% of all sessions)

### Analytics & Telemetry
- [ ] Google Analytics 4 property created
- [ ] Google Tag Manager container deployed
- [ ] Google Ads conversion tracking verified
- [ ] Microsoft Clarity session recording enabled
- [ ] Vercel Analytics enabled for Core Web Vitals

---

## Deployment Readiness

### Code Quality
- [ ] `pnpm build` completes without errors
- [ ] `pnpm lint` passes (or disabled as needed)
- [ ] No console.log statements left in production code (or properly tagged)
- [ ] TypeScript strict mode passes

### Testing
- [ ] Mobile responsiveness tested (375px, 768px, 1440px viewports)
- [ ] Critical user paths tested (sign up → payment → dashboard)
- [ ] Payment flow tested with Stripe/Square test mode
- [ ] Email delivery tested via Resend
- [ ] Error handling verified (500 error page, 404 handling)

### Performance
- [ ] Lighthouse score >90 on all pages
- [ ] Core Web Vitals LCP <2.5s, FID <100ms, CLS <0.1
- [ ] Image optimization enabled (next/image)
- [ ] CSS/JS minified and bundled

### SEO & Discovery
- [ ] sitemap.xml generated and submitted to Google Search Console
- [ ] robots.txt configured correctly
- [ ] Meta tags and OG images set on all pages
- [ ] JSON-LD structured data validated
- [ ] Canonical URLs set appropriately

### Legal & Compliance
- [ ] Terms of Service page deployed (/legal/terms)
- [ ] Privacy Policy page deployed (/legal/privacy)
- [ ] Cookie Policy page deployed (/legal/cookies)
- [ ] GDPR compliance verified (data export, deletion endpoints)
- [ ] CCPA compliance verified (if applicable)
- [ ] Footer links updated with legal pages

---

## API & Third-Party Integration Testing

### Payment Processing
- [ ] Square test → live transition verified
- [ ] Subscription billing tested end-to-end
- [ ] Failed payment handling tested
- [ ] Refund process documented and tested

### Email Service
- [ ] Welcome email sends on signup
- [ ] Password reset emails functional
- [ ] Transactional emails branded correctly
- [ ] Email deliverability >98%

### Push Notifications (if applicable)
- [ ] VAPID keys configured
- [ ] Push subscription endpoint working
- [ ] Test push sent successfully

### External APIs
- [ ] Google Sheets/Drive API access verified
- [ ] Any third-party integrations tested in production environment

---

## Post-Deployment

### Monitoring Setup
- [ ] Uptime monitoring configured (e.g., Datadog, StatusPage.io)
- [ ] Error rate alerts configured
- [ ] Performance regression alerts set
- [ ] Database query performance monitored

### Backups & Disaster Recovery
- [ ] Database automated backups verified
- [ ] Backup retention policy set (e.g., 30-day retention)
- [ ] Restore procedure tested
- [ ] Business continuity plan documented

### Analytics Baseline
- [ ] Traffic baseline recorded
- [ ] Conversion funnel metrics established
- [ ] Key user journeys instrumented
- [ ] Weekly reporting scheduled

---

## Day-1 Production Checklist

### Before Public Announcement
- [ ] Health check: All critical endpoints responding 200
- [ ] Payment flow: Test transaction completed successfully
- [ ] Email: Verify transactional and marketing emails send
- [ ] Analytics: Verify Google Analytics capturing events
- [ ] Errors: Verify Sentry receiving error reports
- [ ] Search: Manual spot-check for indexing issues

### Public Announcement
- [ ] Marketing channels notified (email list, social media)
- [ ] Monitoring dashboard open and observed
- [ ] On-call rotation established for first week
- [ ] Customer support channel(s) active

---

## Monthly Production Verification

- [ ] Database backup restore test
- [ ] SSL/TLS certificate expiration checked
- [ ] Dependency security updates reviewed
- [ ] Error rates reviewed
- [ ] Performance metrics reviewed
- [ ] Traffic trends analyzed
- [ ] User feedback captured and prioritized
