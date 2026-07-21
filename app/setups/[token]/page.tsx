import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { mdSessions, mdSetupLogs, mdVehicles, mdTeams } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import type { Metadata } from 'next'
import { Thermometer, Wind, Droplets, MapPin, Calendar, Bike } from 'lucide-react'
import Link from 'next/link'

type Params = { token: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { token } = await params
  const row = await getPublicSheet(token)
  if (!row) return { title: 'Setup Sheet — Motorsport Data' }
  return {
    title: `${row.vehicle.name} @ ${row.session.trackName} — Setup Sheet | Motorsport Data`,
    description: `Motocross setup sheet for ${row.vehicle.name} at ${row.session.trackName}. Suspension, tires, jetting, and weather conditions logged by ${row.team.name}.`,
    openGraph: {
      title: `${row.vehicle.name} Setup @ ${row.session.trackName}`,
      description: `Setup sheet including suspension settings, tire selection, jetting, and weather. Shared by ${row.team.name} on Motorsport Data.`,
    },
  }
}

async function getPublicSheet(token: string) {
  const [row] = await db
    .select({
      session: mdSessions,
      vehicle: { id: mdVehicles.id, name: mdVehicles.name, type: mdVehicles.type },
      team: { id: mdTeams.id, name: mdTeams.name },
    })
    .from(mdSessions)
    .innerJoin(mdVehicles, eq(mdSessions.vehicleId, mdVehicles.id))
    .innerJoin(mdTeams, eq(mdVehicles.teamId, mdTeams.id))
    .where(and(eq(mdSessions.shareToken, token), eq(mdSessions.isPublic, true)))
    .limit(1)

  if (!row) return null

  const suspensionLogs = await db
    .select({ key: mdSetupLogs.parameterKey, value: mdSetupLogs.parameterValue })
    .from(mdSetupLogs)
    .where(eq(mdSetupLogs.sessionId, row.session.id))

  return { ...row, suspensionLogs }
}

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2">
      <span className="text-zinc-500">{icon}</span>
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-sm font-bold text-zinc-100">{value}</p>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">{title}</p>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-0">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className="text-sm font-semibold text-zinc-100">{value}</span>
    </div>
  )
}

export default async function PublicSetupSheetPage({ params }: { params: Promise<Params> }) {
  const { token } = await params
  const data = await getPublicSheet(token)
  if (!data) notFound()

  const { session: s, vehicle, team, suspensionLogs } = data
  const hasWeather = s.ambientTempF != null || s.humidityPct != null || s.windMph != null
  const hasTires = s.tireFront || s.tireRear
  const hasEngine = s.fuelMix || s.jetNeedle || s.airFilterCondition || s.engineMap
  const hasSuspension = suspensionLogs.length > 0

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            name: `${vehicle.name} Setup Sheet at ${s.trackName}`,
            description: `Motocross setup sheet for ${vehicle.name} at ${s.trackName}`,
            author: { '@type': 'Organization', name: team.name },
            datePublished: s.sessionDate,
          }),
        }}
      />

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/data/pricing" className="text-xs uppercase tracking-widest text-lime-400 font-bold mb-4 block">
            Motorsport Data
          </Link>
          <h1 className="text-2xl font-black text-zinc-50 text-balance">
            {vehicle.name} @ {s.trackName}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Setup sheet shared by {team.name}</p>
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {s.sessionDate && (
            <StatPill icon={<Calendar className="h-4 w-4" />} label="Date" value={s.sessionDate} />
          )}
          <StatPill icon={<Bike className="h-4 w-4" />} label="Bike" value={`${vehicle.name} (${vehicle.type})`} />
          {s.trackSurface && (
            <StatPill icon={<MapPin className="h-4 w-4" />} label="Surface" value={s.trackSurface} />
          )}
        </div>

        {/* Weather */}
        {hasWeather && (
          <Section title="Weather conditions">
            <div className="grid grid-cols-3 gap-3">
              {s.ambientTempF != null && (
                <div className="text-center">
                  <Thermometer className="h-5 w-5 text-orange-400 mx-auto mb-1" />
                  <p className="text-xl font-black text-zinc-50">{s.ambientTempF}°F</p>
                  <p className="text-xs text-zinc-500">Temp</p>
                </div>
              )}
              {s.humidityPct != null && (
                <div className="text-center">
                  <Droplets className="h-5 w-5 text-sky-400 mx-auto mb-1" />
                  <p className="text-xl font-black text-zinc-50">{s.humidityPct}%</p>
                  <p className="text-xs text-zinc-500">Humidity</p>
                </div>
              )}
              {s.windMph != null && (
                <div className="text-center">
                  <Wind className="h-5 w-5 text-zinc-400 mx-auto mb-1" />
                  <p className="text-xl font-black text-zinc-50">{s.windMph} mph</p>
                  <p className="text-xs text-zinc-500">Wind</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Tires */}
        {hasTires && (
          <Section title="Tires">
            <Row label="Front" value={s.tireFront && s.tirePressureFront ? `${s.tireFront} @ ${s.tirePressureFront} psi` : s.tireFront} />
            <Row label="Rear" value={s.tireRear && s.tirePressureRear ? `${s.tireRear} @ ${s.tirePressureRear} psi` : s.tireRear} />
          </Section>
        )}

        {/* Engine / jetting */}
        {hasEngine && (
          <Section title="Engine / Jetting">
            <Row label="Fuel mix" value={s.fuelMix} />
            <Row label="Jet needle" value={s.jetNeedle} />
            <Row label="Air filter" value={s.airFilterCondition} />
            <Row label="Engine map" value={s.engineMap} />
          </Section>
        )}

        {/* Suspension */}
        {hasSuspension && (
          <Section title="Suspension">
            {suspensionLogs.map((log) => (
              <Row key={log.key} label={log.key} value={log.value} />
            ))}
          </Section>
        )}

        {/* Rider notes */}
        {s.riderFeedback && (
          <Section title="Rider feel notes">
            <p className="text-sm text-zinc-300 leading-relaxed">{s.riderFeedback}</p>
          </Section>
        )}

        {/* CTA */}
        <div className="mt-8 rounded-2xl bg-zinc-900 border border-zinc-800 p-6 text-center">
          <p className="text-sm text-zinc-400 mb-3">Log your own setup sheets, track progression, and get AI recommendations.</p>
          <Link
            href="/data/pricing"
            className="inline-block rounded-xl bg-lime-400 text-zinc-950 font-bold text-sm px-6 py-3"
          >
            Get started free
          </Link>
        </div>
      </div>
    </div>
  )
}
