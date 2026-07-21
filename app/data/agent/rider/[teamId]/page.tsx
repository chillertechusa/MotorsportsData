import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Lock, Gauge, MapPin, Clock, Bike } from 'lucide-react'
import { auth } from '@/lib/auth'
import { getRiderProfileForAgent } from '@/app/actions/agent-portal'
import { denialMessage, type AccessDenialReason } from '@/lib/external-access'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Rider Profile — Agent Portal',
  description: 'Performance profile and history for a represented rider.',
}

function fmtLap(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '—'
  const m = Math.floor(seconds / 60)
  const s = (seconds % 60).toFixed(2)
  return m > 0 ? `${m}:${s.padStart(5, '0')}` : `${s}s`
}

export default async function RiderProfilePage({
  params,
}: {
  params: Promise<{ teamId: string }>
}) {
  const { teamId } = await params

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    redirect(`/data/sign-in?redirect=/data/agent/rider/${teamId}`)
  }

  const result = await getRiderProfileForAgent(teamId)

  if (!result.ok) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 ring-1 ring-zinc-800">
            <Lock className="h-6 w-6 text-zinc-500" />
          </div>
          <h1 className="text-2xl font-black">Access unavailable</h1>
          <p className="mt-2 text-zinc-400">{denialMessage(result.reason as AccessDenialReason)}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/data/agent"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-bold text-zinc-200 hover:border-zinc-500"
            >
              <ArrowLeft className="h-4 w-4" /> Back to portal
            </Link>
            {result.reason === 'not_entitled' && (
              <Link
                href="/checkout/tier?tier=agent"
                className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-2.5 text-sm font-black uppercase tracking-widest text-zinc-950 hover:bg-lime-300"
              >
                Subscribe
              </Link>
            )}
          </div>
        </div>
      </main>
    )
  }

  const { profile } = result
  const age = profile.riderBirthYear ? new Date().getFullYear() - profile.riderBirthYear : null

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/data/agent"
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back to roster
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-lime-400">Rider Profile</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-balance">{profile.riderName}</h1>
            <p className="mt-1 text-zinc-400">
              {[profile.riderClass, profile.discipline, age ? `Age ${age}` : null]
                .filter(Boolean)
                .join(' • ') || 'No class info'}
            </p>
          </div>
          <a
            href={`/api/agent/pitch/${profile.teamId}`}
            className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-2.5 text-sm font-black uppercase tracking-widest text-zinc-950 transition-colors hover:bg-lime-300"
          >
            <FileText className="h-4 w-4" /> Export Pitch PDF
          </a>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={<Gauge className="h-4 w-4" />} label="Best Lap" value={fmtLap(profile.stats.bestLapSeconds)} />
          <StatCard icon={<MapPin className="h-4 w-4" />} label="Tracks" value={String(profile.stats.tracksRidden)} />
          <StatCard icon={<Clock className="h-4 w-4" />} label="Sessions" value={String(profile.stats.totalSessions)} />
          <StatCard icon={<Clock className="h-4 w-4" />} label="Ride Hours" value={String(profile.stats.totalSessionHours)} />
        </div>

        {/* Vehicles */}
        <section className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
            <Bike className="h-4 w-4" /> Equipment
          </h2>
          {profile.vehicles.length === 0 ? (
            <p className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-500">
              No vehicles on record.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {profile.vehicles.map((v) => (
                <div key={v.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
                  <p className="font-semibold text-zinc-100">{v.name}</p>
                  <p className="text-xs text-zinc-500">
                    {[v.type, v.discipline].filter(Boolean).join(' • ') || '—'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent sessions */}
        <section>
          <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
            Recent Sessions
          </h2>
          {profile.recentSessions.length === 0 ? (
            <p className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-500">
              No session history yet.
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-zinc-800">
              <table className="w-full text-sm">
                <thead className="bg-zinc-900/60 text-left font-mono text-xs uppercase tracking-widest text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Track</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Surface</th>
                    <th className="px-4 py-3 text-right">Best Lap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {profile.recentSessions.map((s) => (
                    <tr key={s.id} className="bg-zinc-900/20">
                      <td className="px-4 py-3 font-medium text-zinc-100">{s.trackName || '—'}</td>
                      <td className="px-4 py-3 text-zinc-400">{s.sessionDate || '—'}</td>
                      <td className="px-4 py-3 text-zinc-400">
                        {[s.trackSurface, s.trackConditions].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-lime-400">{fmtLap(s.bestLapSeconds)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
      <div className="flex items-center gap-1.5 text-zinc-500">{icon}</div>
      <p className="mt-1 text-xl font-black text-zinc-100">{value}</p>
      <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">{label}</p>
    </div>
  )
}
