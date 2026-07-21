import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getAgentRoster } from '@/app/actions/agent-portal'
import { AgentOnboarding } from '@/components/agent/agent-onboarding'
import { AgentRoster } from '@/components/agent/agent-roster'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Agent Portal — Motorsport Data',
  description: 'Manage your rider roster, view performance profiles, and export sponsor pitch reports.',
}

export default async function AgentPortalPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    redirect('/data/sign-in?redirect=/data/agent')
  }

  const { account, entitled, entries } = await getAgentRoster()

  if (!account) {
    return <AgentOnboarding contactName={session.user.name ?? ''} contactEmail={session.user.email ?? ''} />
  }

  return (
    <AgentRoster
      account={{
        orgName: account.orgName ?? 'Your Agency',
        verificationStatus: account.verificationStatus,
        seatIncludedRiders: account.seatIncludedRiders ?? 3,
      }}
      entitled={entitled}
      entries={entries.map((e) => ({
        ...e,
        requestedAt: e.requestedAt ? e.requestedAt.toISOString() : null,
        grantedAt: e.grantedAt ? e.grantedAt.toISOString() : null,
      }))}
    />
  )
}
