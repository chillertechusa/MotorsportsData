import { Suspense } from 'react'
import Link from 'next/link'
import { getTrainingPlans } from '@/app/actions/coach-business'
import { ClipboardList, Plus, Zap } from 'lucide-react'

const STATUS_STYLE: Record<string, string> = {
  draft:     'text-zinc-500 border-zinc-700',
  active:    'text-lime-400 border-lime-400/30 bg-lime-400/5',
  completed: 'text-zinc-500 border-zinc-700 bg-zinc-800/40',
  archived:  'text-zinc-600 border-zinc-800',
}

async function PlansContent() {
  const rows = await getTrainingPlans()

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
            Training Plans
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{rows.length} total plan{rows.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/data/coach/plans/new"
          className="inline-flex items-center gap-2 bg-lime-400 text-zinc-950 text-sm font-bold px-4 py-2 hover:bg-lime-300 transition-colors">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Plan
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="border border-dashed border-zinc-800 p-16 text-center">
          <ClipboardList className="h-12 w-12 text-zinc-700 mx-auto mb-3" aria-hidden="true" />
          <p className="text-zinc-400 font-semibold mb-1">No training plans yet.</p>
          <p className="text-zinc-600 text-sm mb-4">Build weekly plans for your athletes — physical, technical, and mental blocks.</p>
          <Link href="/data/coach/plans/new"
            className="inline-flex items-center gap-2 bg-lime-400 text-zinc-950 text-sm font-bold px-5 py-2.5 hover:bg-lime-300 transition-colors">
            <Plus className="h-4 w-4" /> Create First Plan
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map(({ plan, clientFirstName, clientLastName }) => {
            const start = new Date(plan.weekStart)
            const end = new Date(plan.weekEnd)
            const physical = Array.isArray(plan.physicalBlocks) ? plan.physicalBlocks.length : 0
            const technical = Array.isArray(plan.technicalBlocks) ? plan.technicalBlocks.length : 0
            const mental = Array.isArray(plan.mentalBlocks) ? plan.mentalBlocks.length : 0

            return (
              <Link key={plan.id} href={`/data/coach/plans/${plan.id}`}
                className="block bg-zinc-900 border border-zinc-800 hover:border-lime-400/30 transition-colors px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-zinc-100 truncate">{plan.title}</p>
                      {plan.aiGenerated && (
                        <span className="inline-flex items-center gap-1 font-mono text-[8px] uppercase tracking-wider text-lime-400 border border-lime-400/20 px-1.5 py-0.5">
                          <Zap className="h-2.5 w-2.5" aria-hidden="true" />AI
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">
                      {clientFirstName} {clientLastName} &middot;{' '}
                      {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} &ndash;{' '}
                      {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-600">
                      <span>{physical}P</span>
                      <span>{technical}T</span>
                      <span>{mental}M</span>
                    </div>
                    <span className={`font-mono text-[9px] uppercase tracking-wider border px-2.5 py-0.5 ${STATUS_STYLE[plan.status] ?? STATUS_STYLE.draft}`}>
                      {plan.status}
                    </span>
                  </div>
                </div>
                {plan.goals && (
                  <p className="text-xs text-zinc-600 mt-2 line-clamp-1">{plan.goals}</p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function PlansPage() {
  return (
    <Suspense fallback={
      <div className="p-6 space-y-3 animate-pulse">
        <div className="h-8 w-40 bg-zinc-800 rounded" />
        {[1,2,3].map((i) => <div key={i} className="h-20 bg-zinc-900 border border-zinc-800" />)}
      </div>
    }>
      <PlansContent />
    </Suspense>
  )
}
