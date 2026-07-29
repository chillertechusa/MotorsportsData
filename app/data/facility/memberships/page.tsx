import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdTeamMembers, mdCoachClients, mdCoachInvoices, mdCoachPackages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { CreditCard, Plus, CheckCircle2, Clock, FileText } from 'lucide-react'

export const metadata = { title: 'Memberships — Motorsport Data' }

async function getTeamId(userId: string) {
  const [m] = await db.select({ teamId: mdTeamMembers.teamId })
    .from(mdTeamMembers).where(eq(mdTeamMembers.userId, userId)).limit(1)
  return m?.teamId ?? null
}

const STATUS_CONFIG = {
  paid:   { icon: CheckCircle2, class: 'text-lime-400 border-lime-400/20 bg-lime-400/5',     label: 'Paid' },
  sent:   { icon: Clock,        class: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5', label: 'Pending' },
  draft:  { icon: FileText,     class: 'text-zinc-400 border-zinc-700 bg-zinc-800',           label: 'Draft' },
  void:   { icon: FileText,     class: 'text-red-400 border-red-400/20 bg-red-400/5',        label: 'Void' },
}

export default async function MembershipsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/auth/sign-in')

  const teamId = await getTeamId(session.user.id)
  if (!teamId) redirect('/auth/sign-up')

  const [invoices, clients, packages] = await Promise.all([
    db.select().from(mdCoachInvoices).where(eq(mdCoachInvoices.coachTeamId, teamId)),
    db.select().from(mdCoachClients).where(eq(mdCoachClients.coachTeamId, teamId)),
    db.select().from(mdCoachPackages).where(eq(mdCoachPackages.coachTeamId, teamId)),
  ])

  const clientMap  = Object.fromEntries(clients.map(c => [c.id, c]))
  const packageMap = Object.fromEntries(packages.map(p => [p.id, p]))

  const totalCollected = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amountCents, 0)
  const totalPending   = invoices.filter(i => i.status === 'sent').reduce((s, i) => s + i.amountCents, 0)

  return (
    <div className="p-6 max-w-4xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100"
            style={{ fontFamily: 'var(--font-barlow-condensed, system-ui)' }}>
            Memberships & Billing
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          className="inline-flex items-center gap-2 bg-sky-400 text-zinc-950 text-sm font-bold px-4 py-2 hover:bg-sky-300 transition-colors"
          aria-label="Create invoice (demo — upgrade for full access)"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create Invoice
        </button>
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Collected',     value: totalCollected, accent: 'text-lime-400' },
          { label: 'Outstanding',   value: totalPending,   accent: 'text-yellow-400' },
          { label: 'Total Invoiced',value: totalCollected + totalPending, accent: 'text-zinc-100' },
        ].map(({ label, value, accent }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 p-5">
            <p className={`text-2xl font-black ${accent}`}>${(value / 100).toLocaleString()}</p>
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Invoice list */}
      <section aria-labelledby="invoices-heading">
        <h2 id="invoices-heading" className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 mb-3">All Invoices</h2>
        {invoices.length === 0 ? (
          <div className="border border-dashed border-zinc-800 p-12 text-center">
            <CreditCard className="h-10 w-10 text-zinc-700 mx-auto mb-3" aria-hidden="true" />
            <p className="text-zinc-400 text-sm">No invoices yet. Create your first membership invoice.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {invoices.map(inv => {
              const client = inv.clientId ? clientMap[inv.clientId] : null
              const pkg    = inv.packageId ? packageMap[inv.packageId] : null
              const cfg    = STATUS_CONFIG[inv.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft
              const StatusIcon = cfg.icon
              return (
                <article key={inv.id} className="bg-zinc-900 border border-zinc-800 p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-zinc-100 font-mono">{inv.invoiceNumber}</p>
                      <span className={`inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 border shrink-0 ${cfg.class}`}>
                        <StatusIcon className="h-2.5 w-2.5" aria-hidden="true" />
                        {cfg.label}
                      </span>
                    </div>
                    {client && (
                      <p className="text-xs text-zinc-500 mt-0.5">{client.firstName} {client.lastName}</p>
                    )}
                    {pkg && (
                      <p className="text-[10px] font-mono text-zinc-600 mt-0.5">{pkg.name}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-zinc-100">${(inv.amountCents / 100).toLocaleString()}</p>
                    <p className="text-[10px] font-mono text-zinc-600 mt-0.5">
                      Due {new Date(inv.dueDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
