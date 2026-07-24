import { redirect } from 'next/navigation'
import { getSessionTeamId } from '@/lib/md-auth'
import { getFoundingRigs, FOUNDING_SLOT_CAP } from '@/app/actions/founding-rigs'
import { CheckCircle2, Clock, Users, DollarSign, Lock } from 'lucide-react'

export const metadata = { title: 'Founding Rigs | Owner Console' }

export default async function FoundingRigsPage() {
  const auth = await getSessionTeamId()
  if (!auth.ok || (auth.role !== 'owner' && auth.role !== 'manager')) {
    redirect('/data/sign-in?redirect=/data/owner/founding-rigs')
  }

  const { rigs } = await getFoundingRigs()
  const used = rigs.length
  const remaining = Math.max(0, FOUNDING_SLOT_CAP - used)
  const pct = Math.round((used / FOUNDING_SLOT_CAP) * 100)

  const totalMRR = rigs.reduce((sum, r) => sum + r.lockedCents, 0)
  const onboarded = rigs.filter((r) => r.onboardingComplete).length

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-xs text-lime-400 uppercase tracking-widest mb-1">King Console</p>
        <h1
          className="text-zinc-100 text-4xl uppercase"
          style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900 }}
        >
          Founding Rigs Cohort
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          50-slot enrollment &mdash; August 31, 2026 close date
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Slots Used', value: `${used} / ${FOUNDING_SLOT_CAP}`, icon: Users, color: 'text-lime-400' },
          { label: 'Slots Remaining', value: String(remaining), icon: Lock, color: remaining <= 10 ? 'text-red-400' : 'text-zinc-100' },
          { label: 'Founding MRR', value: `$${(totalMRR / 100).toLocaleString()}`, icon: DollarSign, color: 'text-lime-400' },
          { label: 'Onboarded', value: `${onboarded} / ${used}`, icon: CheckCircle2, color: 'text-lime-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">{label}</span>
              <Icon className="h-4 w-4 text-zinc-700" aria-hidden="true" />
            </div>
            <p className={`text-2xl font-black ${color}`} style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Slot fill bar */}
      <div className="mb-8 bg-zinc-900 border border-zinc-800 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Enrollment Progress</span>
          <span className="font-mono text-xs text-lime-400 font-black">{pct}% full</span>
        </div>
        <div className="h-2 w-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-lime-400 transition-all duration-700"
            style={{ width: `${pct}%` }}
            aria-label={`${pct}% of founding slots claimed`}
          />
        </div>
      </div>

      {/* Rig table */}
      {rigs.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 p-12 text-center">
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">No founding rigs enrolled yet</p>
          <p className="text-zinc-600 text-sm mt-2">The first paying founding team will appear here after checkout.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Slot', 'Team ID', 'Plan', 'Locked Price', 'Frequency', 'Enrolled', 'Onboarding'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left font-mono text-[10px] text-zinc-500 uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rigs.map((rig) => (
                <tr key={rig.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3.5 font-black text-lime-400" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
                    #{String(rig.slotNumber).padStart(2, '0')}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-zinc-400 max-w-[140px] truncate">
                    {rig.teamId}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 border ${rig.planId === 'factory_rig' ? 'border-zinc-500 text-zinc-300' : 'border-lime-400/40 text-lime-400'}`}>
                      {rig.planId === 'factory_rig' ? 'Factory Rig' : 'Race Team'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-100 font-semibold">
                    ${(rig.lockedCents / 100).toLocaleString()}/mo
                  </td>
                  <td className="px-5 py-3.5 text-zinc-400 capitalize font-mono text-xs">{rig.frequency}</td>
                  <td className="px-5 py-3.5 text-zinc-500 font-mono text-xs">
                    {rig.enrolledAt ? new Date(rig.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    {rig.onboardingComplete ? (
                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-lime-400">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Done
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
