import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdTeamMembers, mdExpenses } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { DollarSign, Plus, TrendingUp } from 'lucide-react'

export const metadata = { title: 'Budget — Motorsport Data' }

async function getTeamId(userId: string) {
  const [m] = await db.select({ teamId: mdTeamMembers.teamId })
    .from(mdTeamMembers).where(eq(mdTeamMembers.userId, userId)).limit(1)
  return m?.teamId ?? null
}

const CATEGORY_COLORS: Record<string, string> = {
  'Entry Fees': 'text-red-400 border-red-400/20 bg-red-400/5',
  'Travel':     'text-[var(--color-yamaha)] border-[var(--color-yamaha-border)] bg-[var(--color-yamaha)]/5',
  'Parts':      'text-[var(--color-yamaha)] border-[var(--color-yamaha-border)] bg-[var(--color-yamaha)]/5',
  'Gear':       'text-lime-400 border-lime-400/20 bg-lime-400/5',
  'Coaching':   'text-violet-400 border-violet-400/20 bg-violet-400/5',
}
const defaultColor = 'text-zinc-400 border-zinc-700 bg-zinc-800'

export default async function BudgetPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/auth/sign-in')

  const teamId = await getTeamId(session.user.id)
  if (!teamId) redirect('/auth/sign-up')

  const expenses = await db.select().from(mdExpenses)
    .where(eq(mdExpenses.teamId, teamId))
    .orderBy(desc(mdExpenses.expenseDate))

  // Category breakdown
  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amountCents
    return acc
  }, {})
  const categoryRows = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)

  const total = expenses.reduce((s, e) => s + e.amountCents, 0)
  const paid  = expenses.filter(e => new Date(e.expenseDate) <= new Date()).reduce((s, e) => s + e.amountCents, 0)
  const upcoming = total - paid

  return (
    <div className="p-6 max-w-4xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100"
            style={{ fontFamily: 'var(--font-barlow-condensed, system-ui)' }}>
            Budget Tracker
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{expenses.length} expense{expenses.length !== 1 ? 's' : ''} recorded</p>
        </div>
        <button
          className="inline-flex items-center gap-2 bg-[var(--color-yamaha)] text-zinc-950 text-sm font-bold px-4 py-2 hover:bg-[var(--color-yamaha-light)] transition-colors"
          aria-label="Add expense (demo — upgrade for full access)"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Expense
        </button>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Season',    value: total,    accent: 'text-zinc-100' },
          { label: 'Spent',           value: paid,     accent: 'text-[var(--color-yamaha)]' },
          { label: 'Upcoming',        value: upcoming, accent: 'text-yellow-400' },
        ].map(({ label, value, accent }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 p-5">
            <p className={`text-2xl font-black ${accent}`}>${(value / 100).toLocaleString()}</p>
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      <section aria-labelledby="category-heading">
        <h2 id="category-heading" className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 mb-3">By Category</h2>
        <div className="flex flex-col gap-2">
          {categoryRows.map(([cat, amt]) => {
            const pct = total > 0 ? Math.round((amt / total) * 100) : 0
            const colorClass = CATEGORY_COLORS[cat] ?? defaultColor
            return (
              <div key={cat} className="bg-zinc-900 border border-zinc-800 p-4 flex items-center gap-4">
                <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 border shrink-0 ${colorClass}`}>{cat}</span>
                <div className="flex-1 min-w-0">
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--color-yamaha)] rounded-full" style={{ width: `${pct}%` }} aria-label={`${pct}% of budget`} />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-zinc-100">${(amt / 100).toLocaleString()}</p>
                  <p className="text-[10px] text-zinc-500">{pct}%</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* All expenses */}
      <section aria-labelledby="all-expenses">
        <h2 id="all-expenses" className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 mb-3">All Expenses</h2>
        {expenses.length === 0 ? (
          <div className="border border-dashed border-zinc-800 p-12 text-center">
            <DollarSign className="h-10 w-10 text-zinc-700 mx-auto mb-3" aria-hidden="true" />
            <p className="text-zinc-400 text-sm">No expenses recorded yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {expenses.map((e) => {
              const colorClass = CATEGORY_COLORS[e.category] ?? defaultColor
              return (
                <div key={e.id} className="bg-zinc-900 border border-zinc-800 p-4 flex items-center gap-4">
                  <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 border shrink-0 ${colorClass}`}>{e.category}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-200 truncate">{e.description ?? e.category}</p>
                    <p className="text-[10px] font-mono text-zinc-600 mt-0.5">
                      {new Date(e.expenseDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-[var(--color-yamaha)] shrink-0">${(e.amountCents / 100).toLocaleString()}</p>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
