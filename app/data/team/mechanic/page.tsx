import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdTeamMembers, mdWorkOrders, mdVehicles } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Wrench, Plus, Clock, CheckCircle2 } from 'lucide-react'

export const metadata = { title: 'Mechanic Notes — Motorsport Data' }

async function getTeamId(userId: string) {
  const [m] = await db.select({ teamId: mdTeamMembers.teamId })
    .from(mdTeamMembers).where(eq(mdTeamMembers.userId, userId)).limit(1)
  return m?.teamId ?? null
}

export default async function MechanicPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/auth/sign-in')

  const teamId = await getTeamId(session.user.id)
  if (!teamId) redirect('/auth/sign-up')

  const [workOrders, vehicles] = await Promise.all([
    db.select().from(mdWorkOrders)
      .where(eq(mdWorkOrders.teamId, teamId))
      .orderBy(desc(mdWorkOrders.createdAt)),
    db.select().from(mdVehicles)
      .where(eq(mdVehicles.teamId, teamId)),
  ])

  const vehicleMap = Object.fromEntries(vehicles.map(v => [v.id, v]))
  const open   = workOrders.filter(w => w.status === 'open')
  const closed = workOrders.filter(w => w.status === 'closed')

  return (
    <div className="p-6 max-w-4xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100"
            style={{ fontFamily: 'var(--font-barlow-condensed, system-ui)' }}>
            Mechanic Notes
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{open.length} open &middot; {closed.length} closed</p>
        </div>
        <button
          className="inline-flex items-center gap-2 bg-[var(--color-yamaha)] text-zinc-950 text-sm font-bold px-4 py-2 hover:bg-[var(--color-yamaha-light)] transition-colors"
          aria-label="New work order (demo — upgrade for full access)"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Work Order
        </button>
      </div>

      {/* Bikes */}
      {vehicles.length > 0 && (
        <section aria-labelledby="bikes-heading">
          <h2 id="bikes-heading" className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 mb-3">Bikes</h2>
          <div className="flex flex-col gap-2">
            {vehicles.map(v => (
              <div key={v.id} className="bg-zinc-900 border border-zinc-800 p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-zinc-100">{v.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 font-mono">{v.type} &middot; {v.discipline}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-[var(--color-yamaha)]">{v.engineHours?.toFixed(1)} hrs</p>
                  <p className="text-[10px] text-zinc-600 font-mono">Engine Hours</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Open work orders */}
      <section aria-labelledby="open-heading">
        <h2 id="open-heading" className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 mb-3">Open Work Orders</h2>
        {open.length === 0 ? (
          <p className="text-zinc-600 text-sm py-6 border border-dashed border-zinc-800 text-center">All work orders closed. No pending work.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {open.map(wo => (
              <WorkOrderCard key={wo.id} wo={wo} vehicle={vehicleMap[wo.vehicleId]} status="open" />
            ))}
          </div>
        )}
      </section>

      {/* Closed */}
      {closed.length > 0 && (
        <section aria-labelledby="closed-heading">
          <h2 id="closed-heading" className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 mb-3">Completed</h2>
          <div className="flex flex-col gap-4">
            {closed.map(wo => (
              <WorkOrderCard key={wo.id} wo={wo} vehicle={vehicleMap[wo.vehicleId]} status="closed" />
            ))}
          </div>
        </section>
      )}

      {workOrders.length === 0 && (
        <div className="border border-dashed border-zinc-800 p-16 text-center">
          <Wrench className="h-12 w-12 text-zinc-700 mx-auto mb-3" aria-hidden="true" />
          <p className="text-zinc-400 text-base font-semibold mb-1">No work orders yet.</p>
          <p className="text-zinc-600 text-sm">Track maintenance, suspension changes, and part swaps for each bike.</p>
        </div>
      )}
    </div>
  )
}

function WorkOrderCard({ wo, vehicle, status }: { wo: typeof mdWorkOrders.$inferSelect; vehicle?: typeof mdVehicles.$inferSelect; status: string }) {
  const isOpen = status === 'open'
  return (
    <article className={`bg-zinc-900 border p-5 flex flex-col gap-4 ${isOpen ? 'border-red-900/40' : 'border-zinc-800'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-zinc-100">{wo.title}</h3>
            <span className={`inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 border shrink-0 ${
              isOpen ? 'text-red-400 border-red-400/20' : 'text-green-500 border-green-500/20'
            }`}>
              {isOpen ? <Clock className="h-2.5 w-2.5" aria-hidden="true" /> : <CheckCircle2 className="h-2.5 w-2.5" aria-hidden="true" />}
              {status}
            </span>
          </div>
          {vehicle && <p className="text-xs text-zinc-500 mt-0.5">{vehicle.name}</p>}
        </div>
        {wo.laborHours && wo.laborHours > 0 && (
          <p className="text-xs font-mono text-zinc-500 shrink-0">{wo.laborHours}h labor</p>
        )}
      </div>

      {wo.description && (
        <p className="text-xs text-zinc-400 leading-relaxed">{wo.description}</p>
      )}

      {/* Suspension snapshot */}
      {wo.suspensionBefore && Object.keys(wo.suspensionBefore).length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {(['before', 'after'] as const).map(phase => {
            const snap = phase === 'before' ? wo.suspensionBefore : wo.suspensionAfter
            if (!snap || Object.keys(snap).length === 0) return null
            return (
              <div key={phase} className="bg-zinc-950 border border-zinc-800 p-3">
                <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-600 mb-2">Suspension {phase}</p>
                {Object.entries(snap).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2 py-0.5">
                    <span className="text-[10px] text-zinc-500 truncate">{k}</span>
                    <span className="text-[10px] font-mono text-zinc-300 shrink-0">{v}</span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </article>
  )
}
