import { NextRequest, NextResponse } from 'next/server'
import { requireMdOwner } from '@/lib/md-owner-auth'

const legalContent = {
  terms: `MOTORSPORTS DATA — TERMS OF SERVICE

Effective Date: July 11, 2026

1. ACCEPTANCE OF TERMS
By accessing and using Motorsports Data ("Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.

2. PLATFORM DESCRIPTION
Motorsports Data is a cloud-based telemetry, coaching, and team management platform for motorsports professionals (riders, coaches, mechanics, teams). The Platform includes session logging, real-time coaching, wearable integration, analytics, and team collaboration tools.

3. ELIGIBILITY
- You must be 18+ years old to use this Platform
- Team owners must be authorized representatives of their organization
- All users must provide accurate information during account creation

4. USER ACCOUNTS & RESPONSIBILITY
- You are responsible for maintaining account security and password confidentiality
- You are liable for all activities under your account
- You agree to notify us immediately of unauthorized access
- We are not responsible for unauthorized account access

5. ACCEPTABLE USE
You agree NOT to:
- Use the Platform for illegal activities
- Disrupt, interfere with, or overload Platform services
- Reverse engineer, decompile, or attempt to discover Platform source code
- Copy or scrape user data without authorization
- Engage in harassment, abuse, or hate speech
- Share your login credentials with unauthorized parties

6. INTELLECTUAL PROPERTY
- All Platform content, features, and functionality are owned by or licensed to Motorsports Data
- Your uploaded session data and telemetry files remain your property
- You grant us a license to host, process, and analyze your data to provide services
- You may not reproduce, distribute, or transmit Platform content without permission

7. PRICING & PAYMENT
- Subscription fees are listed on the Pricing page
- Billing occurs monthly or annually based on your selected plan
- Prices may change with 30 days' notice
- Refunds are not available except where required by law
- Failed payments may result in account suspension

8. TIER-SPECIFIC TERMS
- Rookie Tier: 1 vehicle, 3 users, basic coaching
- Privateer Tier: 3 vehicles, 10 users, advanced features
- Factory Rig Tier: Unlimited vehicles/seats, all features, priority support

9. CANCELLATION
- You may cancel your subscription at any time
- Cancellation takes effect at the end of your billing cycle
- No refunds for unused time in current billing period
- Your data remains accessible for 30 days after cancellation

10. WARRANTY DISCLAIMER
The Platform is provided "AS IS" without warranties of any kind. We do not guarantee:
- Uninterrupted service availability
- Error-free Platform operation
- Specific results or coaching outcomes
- Fitness for particular purposes

11. LIMITATION OF LIABILITY
To the maximum extent allowed by law, Motorsports Data shall not be liable for:
- Indirect, incidental, special, or consequential damages
- Loss of revenue, profits, or business opportunities
- Data loss or corruption
- Third-party services or integrations

OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID IN THE PAST 12 MONTHS.

12. GOVERNING LAW
These Terms are governed by the laws of Delaware, USA, without regard to conflicts of law principles.

13. DISPUTE RESOLUTION
Any disputes shall be resolved through binding arbitration, not litigation. Both parties waive the right to jury trial.

14. CHANGES TO TERMS
We may update these Terms at any time. Continued use of the Platform constitutes acceptance of updated Terms.

15. CONTACT
For legal questions: legal@motorsportsdata.io
For support: support@motorsportsdata.io`,

  privacy: `MOTORSPORTS DATA — PRIVACY POLICY

Effective Date: July 11, 2026

1. INFORMATION WE COLLECT
- Account information: name, email, organization, team structure
- Telemetry data: GPS, accelerometer, heart rate (when integrated with wearables)
- Session data: lap times, performance metrics, coaching notes
- Usage data: login timestamps, feature usage, error logs
- Device data: IP address, browser type, device type
- Payment information: billing address, payment method (processed securely via Stripe/Square)

2. HOW WE USE YOUR INFORMATION
- Providing and improving Platform services
- Sending transactional emails (billing, password resets, account notifications)
- Analyzing usage patterns to improve features
- Coaching recommendations powered by AI
- Legal compliance and fraud prevention
- Performance monitoring and error tracking

3. DATA RETENTION
- Account data: retained while account is active, deleted 90 days after cancellation
- Session/telemetry data: retained for the life of your subscription, deleted upon request
- Backups: retained for 30 days for disaster recovery
- Logs: retained for 90 days for security and performance analysis

4. DATA SECURITY
- All data transmitted via HTTPS encryption
- Passwords hashed with bcrypt
- Database encrypted at rest
- Regular security audits and penetration testing
- Compliance with SOC 2 standards

5. THIRD-PARTY INTEGRATIONS
We may share data with:
- Terra (wearable data aggregation) — for health metrics
- Stripe/Square (payment processing) — for billing
- Google Analytics (anonymized usage analytics)
- Sentry (error monitoring) — for crash reporting

You can opt out of non-essential integrations in Settings.

6. GDPR RIGHTS (EU Users)
You have the right to:
- Access your personal data
- Correct inaccurate data
- Request deletion ("Right to be Forgotten")
- Data portability (download your data)
- Object to processing

Submit requests to: legal@motorsportsdata.io

7. CCPA RIGHTS (California Users)
You have the right to:
- Know what personal information is collected
- Know whether personal information is sold or shared
- Delete personal information
- Opt-out of sales or sharing of personal information
- Non-discrimination for exercising CCPA rights

Submit requests to: legal@motorsportsdata.io

8. COOKIES & TRACKING
- Essential cookies: session management (required)
- Analytics cookies: usage tracking via Google Analytics
- You can disable non-essential cookies in browser settings

9. CHILDREN'S PRIVACY
The Platform is not intended for users under 13. We do not knowingly collect data from children. If we discover we have collected children's data, we will delete it immediately.

10. DATA BREACHES
In the event of a data breach:
- We will notify affected users within 72 hours
- We will report to relevant authorities as required by law
- We will disclose the nature and scope of the breach

11. CONTACT & REQUESTS
For privacy requests or concerns:
- Email: privacy@motorsportsdata.io
- Data Subject Access Requests: legal@motorsportsdata.io
- Response time: 30 days (or as required by law)`,

  cookies: `MOTORSPORTS DATA — COOKIE POLICY

Effective Date: July 11, 2026

1. WHAT ARE COOKIES?
Cookies are small text files stored on your device that help websites recognize you, remember preferences, and track usage patterns.

2. COOKIES WE USE

ESSENTIAL COOKIES (Required for Platform function):
- session_id: Maintains your login session
- csrf_token: Prevents cross-site request forgery attacks
- preferences: Remembers your UI preferences (dark mode, language)

ANALYTICS COOKIES (Optional - Google Analytics):
- _ga: Tracks unique visitors and sessions
- _gid: Identifies device for session
- _gat: Throttles request rate to Google Analytics
Purpose: Understand how users interact with the Platform to improve features

THIRD-PARTY COOKIES:
- Stripe/Square: Payment processing verification
- Sentry: Error tracking and monitoring

3. YOUR COOKIE CHOICES
ACCEPTING COOKIES:
Using the Platform constitutes acceptance of essential cookies. Analytics cookies are optional and can be disabled:
- Settings → Privacy → Disable Analytics Tracking
- Browser settings → Block third-party cookies
- Do Not Track signals are respected

DISABLING COOKIES:
- You can disable cookies in your browser settings
- Some Platform features may not work without essential cookies
- You can delete cookies at any time

4. THIRD-PARTY COOKIES
Third-party services on the Platform may set their own cookies. View their privacy policies:
- Google Analytics: policies.google.com/privacy
- Stripe: stripe.com/en/privacy
- Square: squareup.com/us/en/legal/privacy

5. COOKIES & GDPR/CCPA
GDPR (EU Users):
- Non-essential cookies require your explicit consent
- You can withdraw consent at any time
- Legitimate interest basis: session management, fraud prevention

CCPA (California Users):
- Cookies may be considered "personal information"
- You can opt out via Settings → Privacy
- "Do Not Sell My Personal Information" button available in footer

6. COOKIE RETENTION
- Session cookies: deleted when you log out
- Persistent cookies: typically retained for 1 year
- Analytics data: retained for 26 months

7. CONTACT
For cookie-related questions:
- Email: privacy@motorsportsdata.io
- View full cookie list: motorsportsdata.io/legal/cookies/detailed`,
}

export async function GET(request: NextRequest) {
  try {
    // Verify owner authorization
    const user = await requireMdOwner()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const doc = searchParams.get('doc') as keyof typeof legalContent
    const format = searchParams.get('format') || 'text'

    if (!doc || !(doc in legalContent)) {
      return NextResponse.json({ error: 'Invalid document' }, { status: 400 })
    }

    const content = legalContent[doc]

    if (format === 'pdf') {
      // Simple PDF generation - in production, use a library like PDFKit or html2pdf
      const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>
endobj
4 0 obj
<< /Length 500 >>
stream
BT
/F1 12 Tf
50 750 Td
(${content.substring(0, 100)}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000273 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
823
%%EOF`

      return new NextResponse(pdfContent, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="md-${doc}.pdf"`,
        },
      })
    }

    // Plain text format
    return NextResponse.json({ content, format: 'text' })
  } catch (error) {
    console.error('[v0] Legal export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
