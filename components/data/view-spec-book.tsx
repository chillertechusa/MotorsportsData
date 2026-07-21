'use client'

import { useState } from 'react'
import { BookOpen, ChevronDown, Wrench, Droplets, Gauge, Settings2, AlertTriangle } from 'lucide-react'
import { getSpecByKey } from '@/lib/md-specs/index'
import type { Vehicle } from './rig-shell'
import type { BikeSpec } from '@/lib/md-specs/types'

// ─── Section helpers ──────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title }: { icon: typeof BookOpen; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-4 w-4 text-lime-400 shrink-0" />
      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-lime-400">{title}</h3>
    </div>
  )
}

function SpecRow({ label, value, mono }: { label: string; value: string | number; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-zinc-800 last:border-0">
      <span className="text-xs text-zinc-500 shrink-0">{label}</span>
      <span className={`text-xs text-right font-semibold text-zinc-200 ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  )
}

function SpecCard({ title, icon, children }: { title: string; icon: typeof BookOpen; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <SectionHeader icon={icon} title={title} />
      {children}
    </div>
  )
}

// ─── No spec linked ───────────────────────────────────────────────────────────

function NoSpecLinked({ vehicleName }: { vehicleName: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 mb-5">
        <BookOpen className="h-8 w-8 text-zinc-500" />
      </div>
      <h3 className="text-lg font-black uppercase tracking-wide text-zinc-300 mb-2">No Spec Book Linked</h3>
      <p className="text-sm text-zinc-500 leading-relaxed mb-5">
        {vehicleName} doesn&apos;t have an OEM spec book attached yet. To link one, delete this vehicle and re-add it, selecting the matching OEM spec from the dropdown.
      </p>
      <p className="text-xs text-zinc-600 font-mono">
        More bikes coming — request yours in MD Intel
      </p>
    </div>
  )
}

// ─── Full spec display ────────────────────────────────────────────────────────

function SpecBookDisplay({ spec }: { spec: BikeSpec }) {
  const [showTorque, setShowTorque] = useState(false)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-lime-400/30 bg-lime-400/5 px-5 py-4 flex flex-wrap items-center gap-3 justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime-400 mb-0.5">OEM Spec Book</p>
          <h2 className="text-xl font-black uppercase tracking-wide text-zinc-50">
            {spec.year} {spec.make} {spec.model}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">{spec.engineType}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-600">Source</p>
          <p className="text-xs font-mono text-zinc-400">{spec.manualTitle}</p>
          {spec.manualPartNumber && (
            <p className="text-[10px] font-mono text-zinc-600">{spec.manualPartNumber}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Identity */}
        <SpecCard title="Engine Identity" icon={Gauge}>
          <SpecRow label="Displacement" value={spec.displacement} />
          <SpecRow label="Bore × Stroke" value={spec.boreStrokeMm} mono />
          <SpecRow label="Compression" value={spec.compressionRatio} />
          <SpecRow label="Transmission" value={`${spec.transmissionSpeeds}-speed`} />
          <SpecRow label="Weight" value={`${spec.weightKg} kg`} />
          <SpecRow label="Seat height" value={`${spec.seatHeightMm} mm`} />
          <SpecRow label="Wheelbase" value={`${spec.wheelbaseMm} mm`} />
        </SpecCard>

        {/* Fluids */}
        <SpecCard title="Fluids + Capacities" icon={Droplets}>
          <SpecRow label="Engine oil" value={`${spec.engineOilL} L`} />
          <SpecRow label="Oil spec" value={spec.engineOilSpec} />
          <SpecRow label="Coolant" value={`${spec.coolantL} L`} />
          {spec.coolantSpec && <SpecRow label="Coolant spec" value={spec.coolantSpec} />}
          <SpecRow label="Fuel tank" value={`${spec.fuelTankL} L`} />
          <SpecRow label="Fuel spec" value={spec.fuelSpec} />
        </SpecCard>

        {/* Tune */}
        <SpecCard title="Tune + Ignition" icon={Settings2}>
          <SpecRow label="Spark plug" value={spec.sparkPlug} mono />
          <SpecRow label="Plug gap" value={`${spec.sparkPlugGapMm} mm`} mono />
          <SpecRow label="Idle" value={`${spec.idleRpm} rpm`} mono />
          <SpecRow label="Valve IN clearance" value={`${spec.valveInletClearanceMm} mm`} mono />
          <SpecRow label="Valve EX clearance" value={`${spec.valveExhaustClearanceMm} mm`} mono />
        </SpecCard>

        {/* Drive */}
        <SpecCard title="Drive Train" icon={Settings2}>
          <SpecRow label="Front sprocket" value={`${spec.frontSprocketTeeth}T`} mono />
          <SpecRow label="Rear sprocket" value={`${spec.rearSprocketTeeth}T`} mono />
          <SpecRow label="Chain pitch" value={spec.chainPitch} mono />
          <SpecRow label="Chain links" value={`${spec.chainLinks}L`} mono />
          <SpecRow label="Chain slack" value={`${spec.chainSlackMm} mm`} mono />
          <SpecRow label="Front tire" value={spec.frontTireSize} mono />
          <SpecRow label="Rear tire" value={spec.rearTireSize} mono />
        </SpecCard>

        {/* Suspension */}
        <SpecCard title="Suspension Baseline" icon={Settings2}>
          <div className="mb-2 text-xs text-zinc-500 leading-relaxed">
            {spec.suspension.forkType}
          </div>
          {spec.suspension.forkAirPsi && (
            <SpecRow label="Fork air" value={`${spec.suspension.forkAirPsi} psi`} mono />
          )}
          {spec.suspension.forkSpringRate && (
            <SpecRow label="Fork spring" value={spec.suspension.forkSpringRate} />
          )}
          {spec.suspension.forkOilType && (
            <SpecRow label="Fork oil" value={spec.suspension.forkOilType} />
          )}
          {spec.suspension.forkOilVolumeMl && (
            <SpecRow label="Fork oil vol." value={`${spec.suspension.forkOilVolumeMl} mL/leg`} mono />
          )}
          {spec.suspension.forkRidingSagMm && (
            <SpecRow label="Fork ride sag" value={`${spec.suspension.forkRidingSagMm} mm`} mono />
          )}
          {spec.suspension.forkCompressionClicks && (
            <SpecRow label="Fork compression" value={`${spec.suspension.forkCompressionClicks} clicks out`} mono />
          )}
          {spec.suspension.forkReboundClicks && (
            <SpecRow label="Fork rebound" value={`${spec.suspension.forkReboundClicks} clicks out`} mono />
          )}
          {spec.suspension.shockSpringRate && (
            <SpecRow label="Shock spring" value={spec.suspension.shockSpringRate} />
          )}
          {spec.suspension.shockRidingSagMm && (
            <SpecRow label="Shock ride sag" value={`${spec.suspension.shockRidingSagMm} mm`} mono />
          )}
          {spec.suspension.standardRiderWeightKg && (
            <SpecRow label="Std. rider weight" value={spec.suspension.standardRiderWeightKg} />
          )}
        </SpecCard>

        {/* Service intervals */}
        <SpecCard title="Service Intervals" icon={Wrench}>
          <div className="space-y-2">
            {spec.serviceIntervals
              .slice()
              .sort((a, b) => a.intervalHours - b.intervalHours)
              .map((s, i) => (
                <div key={i} className="flex items-start gap-3 py-1.5 border-b border-zinc-800 last:border-0">
                  <span className="text-[10px] font-mono font-bold text-lime-400 bg-lime-400/10 rounded px-1.5 py-0.5 shrink-0 mt-0.5 whitespace-nowrap">
                    {s.intervalHours} hr
                  </span>
                  <div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{s.taskDescription}</p>
                    {s.note && <p className="text-[10px] text-zinc-600 mt-0.5">{s.note}</p>}
                  </div>
                </div>
              ))}
          </div>
        </SpecCard>
      </div>

      {/* Torque specs — collapsible */}
      {spec.torqueSpecs.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
          <button
            onClick={() => setShowTorque((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-zinc-800/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                Critical Torque Specs
              </span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-zinc-500 transition-transform ${showTorque ? 'rotate-180' : ''}`}
            />
          </button>
          {showTorque && (
            <div className="px-4 pb-4 border-t border-zinc-800">
              <p className="text-[10px] text-zinc-600 mt-3 mb-3">
                Always use a calibrated torque wrench. Values from OEM manual — not responsible for shop errors.
              </p>
              <div className="space-y-0">
                {spec.torqueSpecs.map((t, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 py-2 border-b border-zinc-800 last:border-0">
                    <span className="text-xs text-zinc-400">{t.fastener}</span>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-mono font-bold text-zinc-200">{t.nmValue} N·m / {t.ftLbValue} ft·lb</p>
                      {t.note && <p className="text-[10px] text-zinc-600">{t.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Source disclaimer */}
      {spec.sourceNotes && (
        <p className="text-[11px] text-zinc-600 leading-relaxed px-1">
          Note: {spec.sourceNotes}
        </p>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ViewSpecBook({ vehicles }: { vehicles: Vehicle[] }) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id ?? '')

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) ?? vehicles[0]
  const spec = selectedVehicle?.specKey ? getSpecByKey(selectedVehicle.specKey) : undefined

  return (
    <div className="space-y-6">
      {/* Vehicle picker (when more than 1 vehicle) */}
      {vehicles.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {vehicles.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVehicleId(v.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors border ${
                v.id === selectedVehicleId
                  ? 'bg-lime-400/15 border-lime-400/40 text-lime-400'
                  : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              {v.name}
              {v.specKey && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-lime-500 bg-lime-400/10 rounded px-1">
                  OEM
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {selectedVehicle && !spec && (
        <NoSpecLinked vehicleName={selectedVehicle.name} />
      )}

      {spec && <SpecBookDisplay spec={spec} />}
    </div>
  )
}
