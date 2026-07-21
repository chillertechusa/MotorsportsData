import { requireMdOwner } from '@/lib/md-owner-auth'
import { getConsentAudit } from '@/app/actions/owner-consent-audit'
import Link from 'next/link'
import { ShieldCheck, Users, Baby, AlertTriangle, FileCheck2, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

const BRACKET_LABELS: Record<string, string> = {
  under_13: 'Under 13',
  teen_13_15: 'Age 13–15',
  teen_16_17: 'Age 16–17',
  adult: 'Adult (18+)',
  unknown: 'Unknown',
}

function fmtDate(d: Date | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default async function OwnerConsentAuditPage() {
  await requireMdOwner()
  const audit = await getConsentAudit()

  const stats = [
    { label: 'Consent Records', value: audit.totalConsentRecords, icon: FileCheck2 },
    { label: 'Users w/ Compliance', value: audit.totalUsersWithCompliance, icon: Users },
    { label: 'Minors (under 18)', value: audit.minors, icon: ShieldCheck },
    { label: 'Under 13 (COPPA)', value: audit.under13, icon: Baby },
    { label: 'Guardian Pending', value: audit.guardianPending, icon: AlertTriangle },
    { label: 'Guardian Verified', value: audit.guardianVerified, icon: ShieldCheck },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/data/owner/legal"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-500 hover:text-lime-400 transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Legal Documents
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-100 mb-2">Consent Audit</h1>
          <p className="text-zinc-400">
            Versioned consent records and COPPA / guardian compliance across all accounts.
          </p>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <s.icon className="h-4 w-4 text-lime-400 mb-3" />
              <p className="text-2xl font-bold text-zinc-100">{s.value}</p>
              <p className="text-xs text-zinc-500 mt-1 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          {/* Age brackets */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-sm font-bold text-zinc-100 mb-4 uppercase tracking-wide">Age Brackets</h2>
            {audit.byBracket.length === 0 ? (
              <p className="text-sm text-zinc-500">No compliance records yet.</p>
            ) : (
              <ul className="space-y-2">
                {audit.byBracket.map((b) => (
                  <li key={b.bracket} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">{BRACKET_LABELS[b.bracket] ?? b.bracket}</span>
                    <span className="font-mono text-zinc-100">{b.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Consents by document version */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-sm font-bold text-zinc-100 mb-4 uppercase tracking-wide">
              Acceptances by Document
            </h2>
            {audit.byDoc.length === 0 ? (
              <p className="text-sm text-zinc-500">No consent records yet.</p>
            ) : (
              <ul className="space-y-2">
                {audit.byDoc.map((d) => (
                  <li key={`${d.docKey}-${d.docVersion}`} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">
                      {d.docKey}{' '}
                      <span className="font-mono text-[11px] text-zinc-600">{d.docVersion}</span>
                    </span>
                    <span className="font-mono text-zinc-100">{d.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent consent records */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <div className="p-6 pb-3">
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
              Recent Consent Records
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Immutable audit trail — most recent 25 acceptances.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-zinc-800 text-left text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-3 font-medium">When</th>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Document</th>
                  <th className="px-6 py-3 font-medium">Version</th>
                  <th className="px-6 py-3 font-medium">Basis</th>
                  <th className="px-6 py-3 font-medium">Guardian</th>
                </tr>
              </thead>
              <tbody>
                {audit.recentConsents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                      No consent records yet. Create an account to generate the first records.
                    </td>
                  </tr>
                ) : (
                  audit.recentConsents.map((c) => (
                    <tr key={c.id} className="border-t border-zinc-800/60">
                      <td className="px-6 py-3 text-zinc-400 whitespace-nowrap">{fmtDate(c.createdAt)}</td>
                      <td className="px-6 py-3 font-mono text-[11px] text-zinc-500">
                        {c.userId.slice(0, 12)}…
                      </td>
                      <td className="px-6 py-3 text-zinc-300">{c.docKey}</td>
                      <td className="px-6 py-3 font-mono text-[11px] text-zinc-500">{c.docVersion}</td>
                      <td className="px-6 py-3">
                        <span
                          className={
                            c.consentBasis === 'guardian'
                              ? 'rounded-full bg-amber-400/10 px-2 py-0.5 text-[11px] font-medium text-amber-400'
                              : 'rounded-full bg-zinc-700/40 px-2 py-0.5 text-[11px] font-medium text-zinc-300'
                          }
                        >
                          {c.consentBasis}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-zinc-400">{c.guardianName ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
