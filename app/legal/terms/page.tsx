import { LegalDocLayout, LegalSection } from '@/components/legal/legal-doc-layout'

export const metadata = {
  title: 'Terms of Service',
  description: 'Motorsport Data Terms of Service, intellectual property, acceptable use, and data licensing.',
  alternates: { canonical: 'https://motorsportsdata.io/legal/terms' },
}

export default function TermsPage() {
  return (
    <LegalDocLayout
      title="Terms of Service"
      version="2.0"
      effectiveDate="July 2026"
      intro={
        <>
          These Terms govern your use of Motorsport Data (the &quot;Platform&quot;). They cover who
          may use the Platform, what you may and may not do, who owns the data and intellectual
          property involved, and the terms for accounts that access rider data. Please read them
          alongside our{' '}
          <a href="/legal/privacy" className="text-lime-400 hover:underline">Privacy Policy</a> and{' '}
          <a href="/legal/data-consent" className="text-lime-400 hover:underline">Data Sharing &amp; Consent</a> policy.
        </>
      }
    >
      <LegalSection n={1} title="Acceptance of Terms">
        <p>
          By creating an account or otherwise using the Platform, you agree to be bound by these
          Terms. If you are under the age of 18, a parent or legal guardian must review and accept
          these Terms on your behalf. If a rider is under 13, verifiable parental consent is
          required before any personal data is collected (see our Privacy Policy). If you do not
          agree, do not use the Platform.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Accounts and Eligibility">
        <p>
          You are responsible for maintaining the confidentiality of your credentials and for all
          activity under your account. You agree to provide accurate information, including an
          accurate date of birth, and to keep it current. We offer several account types &mdash;
          rider, team, coach, and external accounts (agent, sponsor, promoter, and brand partner)
          &mdash; each subject to these Terms and any additional terms presented at signup.
        </p>
      </LegalSection>

      <LegalSection n={3} title="Platform Intellectual Property">
        <p>
          The Platform, including all software, source code, user interfaces, designs, text,
          graphics, and the selection and arrangement thereof, is owned by Motorsport Data and is
          protected by copyright, trademark, trade secret, and other intellectual property laws.
          The names and marks &quot;Motorsport Data,&quot; &quot;Rig Doctor,&quot; &quot;Free
          Rider,&quot; &quot;Command Rig,&quot; and related logos are trademarks of Motorsport Data.
          Except for the limited license below, no rights are granted to you.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Limited License and Restrictions">
        <p>We grant you a limited, revocable, non-exclusive, non-transferable license to use the Platform for its intended purpose. You may not:</p>
        <ul className="list-inside list-disc space-y-2">
          <li>Copy, modify, distribute, sell, or lease any part of the Platform;</li>
          <li>Reverse engineer, decompile, or attempt to extract the source code, models, or model weights;</li>
          <li>Scrape, harvest, crawl, or bulk-extract data from the Platform by any automated means;</li>
          <li>Circumvent, disable, or interfere with security, access controls, or rate limits;</li>
          <li>Access data belonging to other users except through features and consent grants we provide;</li>
          <li>Use the Platform to build a competing product or to train external models on our data.</li>
        </ul>
      </LegalSection>

      <LegalSection n={5} title="AI Features and Models">
        <p>
          The Platform&apos;s AI features (including Rig Doctor and related tools) and the underlying
          models, prompts, and model weights are our proprietary trade secrets. AI output is
          provided for informational purposes only, may be inaccurate, and is not a substitute for
          professional judgment regarding vehicle safety, tuning, medical, or training decisions.
          You are responsible for how you use AI output.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Your Content and Data License">
        <p>
          You retain ownership of the raw data and content you upload (setups, sessions, telemetry,
          media). You grant Motorsport Data a worldwide, royalty-free license to host, process, and
          display that content to operate the Platform and provide it to accounts you have
          authorized. You also grant us a license to create and use{' '}
          <strong className="text-zinc-100">anonymized and aggregated</strong> data derived from
          your content; such aggregated data is our property and may be used to improve the Platform
          and for data products, as described in our Data Sharing &amp; Consent policy.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Coach and Third-Party Intellectual Property">
        <p>
          Coaches and other users may store proprietary training programs, curricula, and materials
          on the Platform (the &quot;Coach IP Vault&quot;). Such materials remain the property of the
          coach or their owner. Motorsport Data acts solely as a custodian; we do not claim
          ownership of coach materials and will not disclose them to other users except as the owner
          directs. You may not access, copy, or use another user&apos;s proprietary materials without
          their authorization.
        </p>
      </LegalSection>

      <LegalSection n={8} title="External Accounts and Data Access">
        <p>
          Agent, sponsor, promoter, and brand-partner accounts may access rider data only where (a)
          the account holds an active, paid entitlement and (b) the rider or their team/guardian has
          granted access. Access is metered and billed according to the plan presented at signup.
          Attempting to access rider data without a valid entitlement and consent grant is a
          material breach of these Terms and may be logged and acted upon.
        </p>
      </LegalSection>

      <LegalSection n={9} title="Payment and Subscriptions">
        <p>
          Paid plans are billed on the frequency you select. Fees are non-refundable except as
          required by law or expressly stated. We may change pricing prospectively with notice.
          Failure to pay may result in suspension of access, including loss of access to rider data
          for external accounts.
        </p>
      </LegalSection>

      <LegalSection n={10} title="Acceptable Use">
        <p>
          You agree not to use the Platform to violate any law, infringe intellectual property,
          upload malicious code, harass others, or misrepresent your identity or affiliation. We may
          suspend or terminate accounts that violate these Terms.
        </p>
      </LegalSection>

      <LegalSection n={11} title="Disclaimers">
        <p>
          The Platform is provided &quot;as is&quot; and &quot;as available&quot; without warranties
          of any kind, express or implied, including merchantability, fitness for a particular
          purpose, and non-infringement. We do not warrant that the Platform will be uninterrupted,
          error-free, or that data or AI output will be accurate or complete.
        </p>
      </LegalSection>

      <LegalSection n={12} title="Limitation of Liability">
        <p>
          To the maximum extent permitted by law, Motorsport Data will not be liable for any
          indirect, incidental, special, consequential, or punitive damages, or for lost profits or
          data, arising from your use of the Platform. Our aggregate liability will not exceed the
          amounts you paid us in the twelve months preceding the claim.
        </p>
      </LegalSection>

      <LegalSection n={13} title="Termination">
        <p>
          You may stop using the Platform at any time. We may suspend or terminate access for breach
          of these Terms. Upon termination, the licenses you granted for already-created anonymized
          and aggregated data survive; provisions relating to intellectual property, disclaimers,
          and liability also survive.
        </p>
      </LegalSection>

      <LegalSection n={14} title="Changes and Governing Law">
        <p>
          We may revise these Terms and will update the version and effective date above. Material
          changes may require re-acceptance. These Terms are governed by the laws of the United
          States and the state in which Motorsport Data is organized, without regard to conflict of
          law rules.
        </p>
      </LegalSection>

      <LegalSection n={15} title="Dispute Resolution and Arbitration">
        <p>
          Any dispute arising out of or relating to these Terms or the Platform will be resolved by
          binding arbitration administered under the rules of a recognized arbitration body in the
          jurisdiction where Motorsport Data is organized, except that either party may seek
          injunctive relief in a court of competent jurisdiction to protect intellectual property or
          confidential information. You and Motorsport Data waive any right to a jury trial and agree
          that disputes will be resolved on an individual basis, not as a class action.
        </p>
      </LegalSection>
    </LegalDocLayout>
  )
}
