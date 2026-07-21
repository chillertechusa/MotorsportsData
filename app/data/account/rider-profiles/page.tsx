import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdTeams } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import MdLogo from '@/components/md-logo'
import RiderProfilesDashboard from '@/components/data/rider-profiles-dashboard'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Rider Profiles — Motorsport Data',
  robots: { index: false, follow: false },
}

export default async function RiderProfilesPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/data/sign-in?redirect=/data/account/rider-profiles')

  // Get the team owned by this parent user
  const [team] = await db
    .select({ id: mdTeams.id })
    .from(mdTeams)
    .where(eq(mdTeams.userId, session.user.id))
    .limit(1)

  const teamId = team?.id ?? null

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <header className="flex h-16 items-center gap-4 border-b border-zinc-800 px-5 lg:px-8">
        <MdLogo size="sm" showWordmark={true} asLink={true} />
        <span className="font-mono text-xs text-zinc-700">/</span>
        <Link
          href="/data/account/billing"
          className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Account
        </Link>
        <span className="font-mono text-xs text-zinc-700">/</span>
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">
          Rider Profiles
        </span>
      </header>

      <main className="flex flex-1 flex-col items-center px-6 py-10">
        <div className="w-full max-w-2xl">

          {/* Account nav tabs */}
          <nav className="flex gap-1 mb-8 border-b border-zinc-800 pb-0">
            <Link
              href="/data/account/billing"
              className="px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors border-b-2 border-transparent hover:border-zinc-600"
            >
              Billing
            </Link>
            <Link
              href="/data/account/rider-profiles"
              className="px-4 py-2.5 text-sm font-medium text-zinc-100 border-b-2 border-lime-400"
            >
              Rider Profiles
            </Link>
            <Link
              href="/data/account/2fa"
              className="px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors border-b-2 border-transparent hover:border-zinc-600"
            >
              Security
            </Link>
          </nav>

          {teamId ? (
            <RiderProfilesDashboard teamId={teamId} />
          ) : (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
              <p className="text-sm font-semibold text-zinc-300">No team found</p>
              <p className="mt-1 text-sm text-zinc-500">
                You need an active subscription to manage rider profiles.
              </p>
              <Link
                href="/data/pricing"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-lime-400 text-zinc-950 font-semibold text-sm px-5 py-2.5 hover:bg-lime-300 transition-colors"
              >
                View Plans
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
