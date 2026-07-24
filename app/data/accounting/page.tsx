import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdTeamMembers, mdTeams } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { AccountingDashboard } from '@/components/data/accounting-dashboard'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Accounting | Motorsport Data',
  description: 'Full program P&L — income vs. expense, budget vs. actual, and season financial health.',
}

export default async function AccountingPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    redirect('/data/sign-in?redirect=/data/accounting')
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1
            className="text-zinc-100 uppercase mb-3"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: '1.75rem' }}
          >
            Accounting — Race Team+
          </h1>
          <p className="text-zinc-400 text-sm mb-2 leading-relaxed">
            The Accounting module is available on <strong className="text-zinc-200">Race Team</strong> and{' '}
            <strong className="text-zinc-200">Factory Command</strong> plans.
          </p>
          <p className="text-zinc-500 text-xs mb-6 leading-relaxed">
            Full P&L dashboard, income vs. expense tracking, budget vs. actual, CSV export,
            and QuickBooks sync queue coming Q1 27.
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
      <AccountingDashboard teamId={membership.teamId} teamName={team.name ?? 'My Team'} userRole={membership.role ?? 'member'} />
    </div>
  )
}
