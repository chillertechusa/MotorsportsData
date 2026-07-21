import { LegalDocLayout, LegalSection } from '@/components/legal/legal-doc-layout'

export const metadata = {
  title: 'Cookie Policy',
  description: 'How Motorsport Data uses cookies and tracking technologies, and your choices.',
  alternates: { canonical: 'https://motorsportsdata.io/legal/cookies' },
}

export default function CookiesPage() {
  return (
    <LegalDocLayout
      title="Cookie Policy"
      version="1.0"
      effectiveDate="July 2026"
      intro="This policy explains what cookies we use, why we use them, and how you can control them."
    >
      <LegalSection n={1} title="What Are Cookies?">
        <p>
          Cookies are small text files placed on your device when you visit our website. We also use
          similar technologies such as local storage and pixel tags. They help us operate the
          Platform securely, remember your preferences, and understand how you use our services.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Cookies We Use">
        <h3 className="mt-4 mb-2 font-semibold text-zinc-100">Essential</h3>
        <p>
          Required for authentication, session management, and core Platform security. These cannot
          be disabled without breaking the service.
        </p>

        <h3 className="mt-4 mb-2 font-semibold text-zinc-100">Performance and Analytics</h3>
        <p>
          We use Google Analytics and Vercel Analytics to understand traffic and usage patterns. Data
          is aggregated and anonymized. You may opt out using the controls described below.
        </p>

        <h3 className="mt-4 mb-2 font-semibold text-zinc-100">Advertising</h3>
        <p>
          We may use Google Ads conversion tracking to measure the effectiveness of our campaigns.
          This does not involve selling your personal data to advertisers.
        </p>

        <h3 className="mt-4 mb-2 font-semibold text-zinc-100">Preferences</h3>
        <p>
          We store UI preferences such as theme and notification settings so the Platform behaves as
          you expect on return visits.
        </p>
      </LegalSection>

      <LegalSection n={3} title="Third-Party Services">
        <ul className="list-inside list-disc space-y-2">
          <li><strong className="text-zinc-100">Google Analytics / Google Ads</strong> — usage and conversion tracking.</li>
          <li><strong className="text-zinc-100">Vercel Analytics</strong> — performance monitoring.</li>
          <li><strong className="text-zinc-100">Square</strong> — payment processing (their own cookie policy applies).</li>
        </ul>
      </LegalSection>

      <LegalSection n={4} title="Your Choices">
        <p>
          You can control or delete cookies through your browser settings. Disabling essential
          cookies will prevent login and platform use. To opt out of Google Analytics specifically,
          install the{' '}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            className="text-lime-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Analytics Opt-out Browser Add-on
          </a>
          . For advertising preferences, visit{' '}
          <a
            href="https://adssettings.google.com"
            className="text-lime-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            adssettings.google.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection n={5} title="GDPR Cookie Consent">
        <p>
          If you are in the European Union or UK, we request your consent before setting
          non-essential cookies. You can withdraw consent at any time by clearing your cookies or
          adjusting browser settings. Essential cookies do not require consent as they are necessary
          to provide the service you have requested.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Contact">
        <p>
          Questions about our cookie practices:{' '}
          <a href="mailto:privacy@motorsportsdata.io" className="text-lime-400 hover:underline">
            privacy@motorsportsdata.io
          </a>
        </p>
      </LegalSection>
    </LegalDocLayout>
  )
}
