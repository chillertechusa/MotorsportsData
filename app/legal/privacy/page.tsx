import { LegalDocLayout, LegalSection } from '@/components/legal/legal-doc-layout'

export const metadata = {
  title: 'Privacy Policy',
  description: 'How Motorsport Data collects, uses, and protects data, including minors (COPPA) and EU/UK (GDPR).',
  alternates: { canonical: 'https://motorsportsdata.io/legal/privacy' },
}

export default function PrivacyPage() {
  return (
    <LegalDocLayout
      title="Privacy Policy"
      version="2.0"
      effectiveDate="July 2026"
      intro={
        <>
          This Policy explains what we collect, how we use it, and your choices. Because many riders
          on the Platform are minors, we place special emphasis on{' '}
          <strong className="text-zinc-100">children&apos;s privacy (COPPA)</strong> and on the
          rights of users in the EU and UK <strong className="text-zinc-100">(GDPR)</strong>.
        </>
      }
    >
      <LegalSection n={1} title="Information We Collect">
        <ul className="list-inside list-disc space-y-2">
          <li><strong className="text-zinc-100">Account data:</strong> name, email, password (hashed), date of birth, and account type.</li>
          <li><strong className="text-zinc-100">Rider data:</strong> vehicle setups, session logs, lap times, and telemetry you upload.</li>
          <li><strong className="text-zinc-100">Human/biometric data</strong> (only if you connect it): heart rate and related metrics from compatible gear.</li>
          <li><strong className="text-zinc-100">Guardian data:</strong> for riders under 13, a parent/guardian&apos;s name, email, and relationship.</li>
          <li><strong className="text-zinc-100">Payment data:</strong> processed securely by our payment processor; we do not store full card numbers.</li>
          <li><strong className="text-zinc-100">Usage data:</strong> device, IP address, and interactions, used for security and to operate the Platform.</li>
        </ul>
      </LegalSection>

      <LegalSection n={2} title="Children&apos;s Privacy (COPPA)">
        <p>
          We do not knowingly collect personal information from a child under 13 without verifiable
          parental consent. At signup we collect a date of birth. If a rider is under 13, we require
          a parent or legal guardian to provide identifying information and to consent before the
          child&apos;s personal data is collected or used. A guardian may review the child&apos;s
          information, request its deletion, and withdraw consent at any time by contacting{' '}
          <a href="mailto:privacy@motorsportsdata.io" className="text-lime-400 hover:underline">privacy@motorsportsdata.io</a>.
          If we learn we have collected data from a child under 13 without the required consent, we
          will delete it.
        </p>
      </LegalSection>

      <LegalSection n={3} title="EU/UK Users (GDPR)">
        <p>
          If you are in the EU or UK, we process personal data under lawful bases including consent,
          contract, and legitimate interests. Where a rider is below the applicable age of digital
          consent (13&ndash;16 depending on country), a guardian must consent. You have rights to
          access, rectify, erase, restrict, and port your data, and to object to certain processing.
          Contact us to exercise these rights.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Data Ownership: Raw vs. Aggregate">
        <p>
          You own the <strong className="text-zinc-100">raw data</strong> you upload. We use it to
          provide the Platform and to share with accounts you authorize. Separately, we create{' '}
          <strong className="text-zinc-100">anonymized, aggregated</strong> data that does not
          identify you; this aggregated data is owned by Motorsport Data and may be used to improve
          the Platform and in data products. Anonymized aggregate data cannot reasonably be used to
          re-identify an individual rider. See our{' '}
          <a href="/legal/data-consent" className="text-lime-400 hover:underline">Data Sharing &amp; Consent</a> policy.
        </p>
      </LegalSection>

      <LegalSection n={5} title="How We Use Information">
        <ul className="list-inside list-disc space-y-2">
          <li>To operate, maintain, and improve the Platform and its AI features;</li>
          <li>To provide rider data to accounts you have explicitly authorized;</li>
          <li>To secure the Platform, detect abuse, and enforce our Terms;</li>
          <li>To communicate with you about your account and the service.</li>
        </ul>
      </LegalSection>

      <LegalSection n={6} title="Sharing and Disclosure">
        <p>
          We do not sell your personal raw data. We share data with service providers who process it
          on our behalf (e.g. hosting, payments, analytics), with accounts you authorize, and where
          required by law. Aggregate, anonymized data may be shared as described in the Data Sharing
          &amp; Consent policy.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Security">
        <p>
          We use technical and organizational measures including encryption in transit, hashed
          passwords, access controls, per-account data scoping, and continuous monitoring for
          suspicious access. No system is perfectly secure, but we work to protect your data and to
          detect and respond to threats.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Data Retention">
        <p>
          We retain personal data while your account is active and as needed to provide the Platform,
          comply with legal obligations, resolve disputes, and enforce agreements. You may request
          deletion of your account and associated raw personal data; already-created anonymized
          aggregate data may be retained.
        </p>
      </LegalSection>

      <LegalSection n={9} title="Your Choices and Rights">
        <p>
          You can access and update account information, manage or revoke data-access grants to
          external accounts, and request export or deletion. Guardians can exercise these rights on
          behalf of a minor. Contact{' '}
          <a href="mailto:privacy@motorsportsdata.io" className="text-lime-400 hover:underline">privacy@motorsportsdata.io</a>.
        </p>
      </LegalSection>

      <LegalSection n={10} title="Cookies and Analytics">
        <p>
          We use cookies and similar technologies to operate the Platform, remember preferences, and
          understand usage. See our{' '}
          <a href="/legal/cookies" className="text-lime-400 hover:underline">Cookie Policy</a> for
          details and choices.
        </p>
      </LegalSection>

      <LegalSection n={11} title="Changes to This Policy">
        <p>
          We may update this Policy and will revise the version and effective date above. Material
          changes may be communicated in-app or by email.
        </p>
      </LegalSection>
    </LegalDocLayout>
  )
}
