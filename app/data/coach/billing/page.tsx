import { Suspense } from 'react'
import Link from 'next/link'
import { getCoachInvoices, getCoachPackages } from '@/app/actions/coach-business'
import { FileText, Plus, DollarSign, Package } from 'lucide-react'

function fmt$(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
}

const STATUS_STYLE: Record<string, string> = {
  draft:   'text-zinc-500 border-zinc-700',
  sent:    'text-amber-400 border-amber-400/30 bg-amber-400/5',
  paid:    'text-lime-400 border-lime-400/30 bg-lime-400/5',
  overdue: 'text-red-400 border-red-400/30 bg-red-400/5',
}

async function BillingContent() {
  const [invoiceRows, packages] = await Promise.all([getCoachInvoices(), getCoachPackages()])

  const totalOutstanding = invoiceRows
    .filter(({ invoice }) => invoice.status === 'sent')
    .reduce((s, { invoice }) => s + invoice.amountCents, 0)
  const totalPaid = invoiceRows
    .filter(({ invoice }) => invoice.status === 'paid')
    .reduce((s, { invoice }) => s + invoice.amountCents, 0)

  return (
    <div className="p-6 max-w-5xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
            Billing
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Invoices, packages, and revenue.</p>
        </div>
        <Link href="/data/coach/billing/new-invoice"
          className="inline-flex items-center gap-2 bg-lime-400 text-zinc-950 text-sm font-bold px-4 py-2 hover:bg-lime-300 transition-colors">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Invoice
        </Link>
      </div>

      {/* Revenue tiles */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-amber-400" aria-hidden="true" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Outstanding</span>
          </div>
          <p className="text-3xl font-black text-zinc-100" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
            {fmt$(totalOutstanding)}
          </p>
          <p className="text-xs text-zinc-600 mt-1">
            {invoiceRows.filter(({ invoice }) => invoice.status === 'sent').length} sent invoice{invoiceRows.filter(({ invoice }) => invoice.status === 'sent').length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-lime-400" aria-hidden="true" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Collected</span>
          </div>
          <p className="text-3xl font-black text-zinc-100" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
            {fmt$(totalPaid)}
          </p>
          <p className="text-xs text-zinc-600 mt-1">
            {invoiceRows.filter(({ invoice }) => invoice.status === 'paid').length} paid invoice{invoiceRows.filter(({ invoice }) => invoice.status === 'paid').length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Packages */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Coaching Packages</h2>
          <Link href="/data/coach/billing/new-package"
            className="flex items-center gap-1 text-xs text-lime-400 hover:text-lime-300">
            <Plus className="h-3 w-3" /> New Package
          </Link>
        </div>
        {packages.length === 0 ? (
          <div className="border border-dashed border-zinc-800 p-6 text-center">
            <Package className="h-8 w-8 text-zinc-700 mx-auto mb-2" aria-hidden="true" />
            <p className="text-zinc-600 text-sm">No packages yet. Define your coaching offers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {packages.map((p) => (
              <div key={p.id} className="bg-zinc-900 border border-zinc-800 p-4">
                <p className="font-semibold text-zinc-100 truncate mb-1">{p.name}</p>
                <p className="text-2xl font-black text-lime-400" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
                  {fmt$(p.priceCents)}<span className="text-xs font-normal text-zinc-500">/{p.cadence}</span>
                </p>
                {p.description && <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{p.description}</p>}
                <div className="flex gap-3 mt-3 text-xs text-zinc-600">
                  {p.sessionCount && <span>{p.sessionCount} sessions</span>}
                  {p.durationWeeks && <span>{p.durationWeeks} weeks</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Invoices */}
      <section>
        <h2 className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mb-3">All Invoices</h2>
        {invoiceRows.length === 0 ? (
          <div className="border border-dashed border-zinc-800 p-10 text-center">
            <FileText className="h-10 w-10 text-zinc-700 mx-auto mb-3" aria-hidden="true" />
            <p className="text-zinc-500 text-sm">No invoices yet. Create your first invoice for an athlete.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {invoiceRows.map(({ invoice, clientFirstName, clientLastName }) => (
              <div key={invoice.id} className="bg-zinc-900 border border-zinc-800 flex items-center gap-4 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-100 text-sm">{invoice.invoiceNumber}</p>
                  <p className="text-xs text-zinc-500">{clientFirstName} {clientLastName}</p>
                </div>
                <p className="font-mono text-sm font-bold text-zinc-100 shrink-0">{fmt$(invoice.amountCents)}</p>
                <p className="text-xs text-zinc-600 shrink-0 hidden sm:block">
                  Due {new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <span className={`font-mono text-[9px] uppercase tracking-wider border px-2.5 py-0.5 shrink-0 ${STATUS_STYLE[invoice.status] ?? STATUS_STYLE.draft}`}>
                  {invoice.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="p-6 space-y-3 animate-pulse">
        <div className="h-8 w-28 bg-zinc-800 rounded" />
        <div className="grid grid-cols-2 gap-3">
          {[1,2].map((i) => <div key={i} className="h-28 bg-zinc-900 border border-zinc-800" />)}
        </div>
      </div>
    }>
      <BillingContent />
    </Suspense>
  )
}
