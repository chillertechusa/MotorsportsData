import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdTeamMembers, mdSponsors } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Award, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

export const metadata = { title: 'Sponsors — Motorsport Data' }

async function getTeamId(userId: string) {
  const [m] = await db.select({ teamId: mdTeamMembers.teamId })
    .from(mdTeamMembers).where(eq(mdTeamMembers.userId, userId)).limit(1)
  return m?.teamId ?? null
}

const STATUS_CONFIG = {
  active:  { icon: CheckCircle2, class: 'text-lime-400 border-lime-400/20 bg-lime-400/5',   label: 'Active' },
  pending: { icon: Clock,        class: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5', label: 'Pending' },
  expired: { icon: AlertCircle,  class: 'text-red-400 border-red-400/20 bg-red-400/5',    label: 'Expired' },
}

export default async function SponsorsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/auth/sign-in')

  const teamId = await getTeamId(session.user.id)
  if (!teamId) redirect('/auth/sign-up')

  const sponsors = await db.select().from(mdSponsors)
    .where(eq(mdSponsors.teamId, teamId))

  const totalValue  = sponsors.filter(s => s.status === 'active').reduce((sum, s) => sum + s.valueCents, 0)
  const cashValue   = sponsors.filter(s => s.status === 'active' && s.sponsorType === 'cash').reduce((sum, s) => sum + s.valueCents, 0)
  const productValue = sponsors.filter(s => s.status === 'active' && s.sponsorType === 'product').reduce((sum, s) => sum + s.valueCents, 0)

  return (
    <div className="p-6 max-w-4xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100"
            style={{ fontFamily: 'var(--font-barlow-condensed, system-ui)' }}>
            Sponsor Log
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{sponsors.filter(s => s.status === 'active').length} active sponsors</p>
        </div>
        <button
          className="inline-flex items-center gap-2 bg-sky-400 text-zinc-950 text-sm font-bold px-4 py-2 hover:bg-sky-300 transition-colors"
          aria-label="Add sponsor (demo — upgrade for full access)"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Sponsor
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Value',    value: totalValue,   accent: 'text-zinc-100' },
          { label: 'Cash Sponsors',  value: cashValue,    accent: 'text-lime-400' },
          { label: 'Product Value',  value: productValue, accent: 'text-sky-400' },
        ].map(({ label, value, accent }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 p-5">
            <p className={`text-2xl font-black ${accent}`}>${(value / 100).toLocaleString()}</p>
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Sponsor cards */}
      {sponsors.length === 0 ? (
        <div className="border border-dashed border-zinc-800 p-16 text-center">
          <Award className="h-12 w-12 text-zinc-700 mx-auto mb-3" aria-hidden="true" />
          <p className="text-zinc-400 text-base font-semibold mb-1">No sponsors yet.</p>
          <p className="text-zinc-600 text-sm">Track cash sponsors, product deals, and their deliverables in one place.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sponsors.map((s) => {
            const statusCfg = STATUS_CONFIG[s.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.active
            const StatusIcon = statusCfg.icon
            return (
              <article key={s.id} className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-black text-zinc-100">{s.sponsorName}</h2>
                    {s.season && <p className="text-xs text-zinc-500 font-mono mt-0.5">Season {s.season}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 border ${
                      s.sponsorType === 'cash' ? 'text-lime-400 border-lime-400/20' : 'text-sky-400 border-sky-400/20'
                    }`}>{s.sponsorType}</span>
                    <span className={`inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 border ${statusCfg.class}`}>
                      <StatusIcon className="h-2.5 w-2.5" aria-hidden="true" />
                      {statusCfg.label}
                    </span>
                    <span className="text-base font-black text-sky-400">${(s.valueCents / 100).toLocaleString()}</span>
                  </div>
                </div>

                {/* Deliverables */}
                {s.deliverables && (s.deliverables as string[]).length > 0 && (
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 mb-2">Deliverables</p>
                    <ul className="flex flex-col gap-1.5">
                      {(s.deliverables as string[]).map((d, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-3 w-3 text-zinc-600 mt-0.5 shrink-0" aria-hidden="true" />
                          <span className="text-xs text-zinc-400">{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Notes */}
                {s.notes && (
                  <p className="text-xs text-zinc-500 leading-relaxed border-l-2 border-zinc-800 pl-3">{s.notes}</p>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
