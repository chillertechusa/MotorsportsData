import { LegalDocLayout, LegalSection } from '@/components/legal/legal-doc-layout'

export const metadata = {
  title: 'Data Sharing & Consent',
  description: 'How rider data is shared with external accounts, aggregate data licensing, and rider platform credit.',
  alternates: { canonical: 'https://motorsportsdata.io/legal/data-consent' },
}

export default function DataConsentPage() {
  return (
    <LegalDocLayout
      title="Data Sharing & Consent"
      version="1.0"
      effectiveDate="July 2026"
      intro={
        <>
          This policy explains, in plain terms, how your rider data may be shared, who can see it,
          and what you get in return. The core principle:{' '}
          <strong className="text-zinc-100">
            you own your raw data and nobody sees it without your consent.
          </strong>{' '}
          Read it together with our{' '}
          <a href="/legal/privacy" className="text-lime-400 hover:underline">Privacy Policy</a>.
        </>
      }
    >
      <LegalSection n={1} title="You Control Access to Your Raw Data">
        <p>
          Your setups, sessions, telemetry, and profile are yours. External accounts &mdash; agents,
          sponsors, promoters, and brand partners &mdash; cannot see any of it unless you (or your
          team, or your guardian if you are a minor) grant access. You can review pending requests,
          approve or deny them, and revoke access at any time.
        </p>
      </LegalSection>

      <LegalSection n={2} title="The Hard Consent Gate">
        <p>
          Access to your rider data requires two conditions at the same time: (a) the requesting
          account holds an active, paid entitlement, and (b) you have an active grant to that
          account. If either condition is missing, access is blocked. We log access attempts and
          denials to protect you.
        </p>
      </LegalSection>

      <LegalSection n={3} title="What a Grant Allows">
        <p>
          When you grant access, the account may view the specific rider information shown in your
          profile (such as best lap times, tracks, sessions, and equipment) for as long as the grant
          is active. Grants do not transfer ownership of your data and do not permit bulk export,
          resale, or use to train external models.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Guardian Consent for Minors">
        <p>
          If a rider is under 18, a parent or guardian manages data-sharing decisions. For riders
          under 13, a guardian must provide verifiable consent before any data is collected or
          shared. Guardians can revoke access and request deletion at any time.
        </p>
      </LegalSection>

      <LegalSection n={5} title="Aggregate Data (Anonymized)">
        <p>
          We create <strong className="text-zinc-100">anonymized, aggregated</strong> data &mdash;
          combined statistics across many riders that do not identify any individual. This aggregate
          data is owned by Motorsport Data and may be used to improve the Platform and in data
          products offered to partners. It is designed so it cannot reasonably be traced back to you.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Rider Platform Credit">
        <p>
          When you consent to share your data with an external account, you may earn{' '}
          <strong className="text-zinc-100">platform credit</strong> &mdash; the people who generate
          the data participate in what it earns. Credit can be applied toward your subscription or
          other platform benefits. Details and amounts are shown at the time of consent and may
          change prospectively.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Revoking Consent">
        <p>
          You can revoke any grant at any time from your account. Revocation stops future access
          immediately. It does not retroactively delete anonymized aggregate data already created,
          and does not reverse credit already earned.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Data License Summary">
        <ul className="list-inside list-disc space-y-2">
          <li><strong className="text-zinc-100">Raw data:</strong> owned by you; shared only with your consent.</li>
          <li><strong className="text-zinc-100">Aggregate data:</strong> anonymized; owned by Motorsport Data.</li>
          <li><strong className="text-zinc-100">Coach materials:</strong> owned by the coach; we are custodian only.</li>
          <li><strong className="text-zinc-100">External access:</strong> requires active entitlement AND your grant.</li>
        </ul>
      </LegalSection>

      <LegalSection n={9} title="Questions">
        <p>
          For any question about data sharing or to exercise your rights, contact{' '}
          <a href="mailto:privacy@motorsportsdata.io" className="text-lime-400 hover:underline">privacy@motorsportsdata.io</a>.
        </p>
      </LegalSection>
    </LegalDocLayout>
  )
}
