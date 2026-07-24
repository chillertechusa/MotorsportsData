import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdTeamMembers, mdTeams } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { DealsDashboard } from '@/components/data/deals-dashboard'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Deals | Motorsport Data',
  description: 'Seat fees, appearance contracts, camp invoices, and rider payments — all in one place.',
}

export default async function DealsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    redirect('/data/sign-in?redirect=/data/deals')
  }

  const [membership] = await db
    .select({ teamId: mdTeamMembers.teamId, role: mdTeamMembers.role })
    .from(mdTeamMembers)
    .where(eq(mdTeamMembers.userId, session.user.id))
    .limit(1)

  if (!membership) {
    redirect('/data/pricing?reason=no-team')
  }

  const [team] = await db
    .select({ subscriptionTier: mdTeams.subscriptionTier, name: mdTeams.name })
    .from(mdTeams)
    .where(eq(mdTeams.id, membership.teamId))
    .limit(1)

  const allowedTiers = ['race_team', 'factory_rig', 'rms_race_team', 'rms_factory_command']
  if (!team || !allowedTiers.includes(team.subscriptionTier ?? '')) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full border border-zinc-800 bg-zinc-900/60 p-8 text-center">
          <div className="w-12 h-12 border border-lime-400/30 bg-lime-400/5 flex items-center justify-center mx-auto mb-5">
            <svg className="h-6 w-6 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1
            className="text-zinc-100 uppercase mb-3"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: '1.75rem' }}
          >
            Deals — Race Team+
          </h1>
          <p className="text-zinc-400 text-sm mb-2 leading-relaxed">
            The Deals module is available on <strong className="text-zinc-200">Race Team</strong> and{' '}
            <strong className="text-zinc-200">Factory Command</strong> plans.
          </p>
          <p className="text-zinc-500 text-xs mb-6 leading-relaxed">
            Create seat fee contracts, appearance invoices, camp charges, and Square payment links
            from a single dashboard. Every dollar tracked.
          </p>
          <a
            href="/#pricing"
            className="inline-flex items-center gap-2 bg-lime-400 text-zinc-950 font-bold px-6 py-3 hover:bg-lime-300 transition-colors"
          >
            Upgrade to Race Team &rarr;
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <DealsDashboard teamId={membership.teamId} teamName={team.name ?? 'My Team'} userRole={membership.role ?? 'member'} />
    </div>
  )
}
