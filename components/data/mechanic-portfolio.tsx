'use client'

import { useState } from 'react'
import { Wrench, TrendingUp, Calendar, ArrowUpRight, Download, Share2 } from 'lucide-react'

interface PortfolioEntry {
  id: string
  vehicleId: string
  vehicleName: string
  setupChange: string
  improvement: number // percentage improvement in lap time
  date: Date
  notes?: string
}

const SAMPLE_PORTFOLIO: PortfolioEntry[] = [
  {
    id: '1',
    vehicleId: 'v1',
    vehicleName: 'Rider A - YZ450F',
    setupChange: 'Suspension: Softened front compression, stiffened rear rebound',
    improvement: 2.3,
    date: new Date('2026-07-08'),
    notes: 'Improved cornering grip in high-speed sections',
  },
  {
    id: '2',
    vehicleId: 'v2',
    vehicleName: 'Rider B - KX450',
    setupChange: 'Tire pressure: Reduced front 0.2psi, increased rear 0.3psi',
    improvement: 1.1,
    date: new Date('2026-07-07'),
    notes: 'Better traction in sand conditions',
  },
  {
    id: '3',
    vehicleId: 'v1',
    vehicleName: 'Rider A - YZ450F',
    setupChange: 'Weight distribution: Moved fuel cell CG 15mm forward',
    improvement: 1.8,
    date: new Date('2026-07-05'),
    notes: 'Enhanced wheelie control in acceleration zones',
  },
  {
    id: '4',
    vehicleId: 'v3',
    vehicleName: 'Rider C - CRF450',
    setupChange: 'Suspension: Increased front spring rate, adjusted compression damping',
    improvement: 2.7,
    date: new Date('2026-07-03'),
    notes: 'Track was hard-packed, needed firmer setup',
  },
]

export function MechanicPortfolio() {
  const [selectedEntry, setSelectedEntry] = useState<PortfolioEntry | null>(null)

  const totalImprovements = SAMPLE_PORTFOLIO.reduce((sum, e) => sum + e.improvement, 0)
  const avgImprovement = (totalImprovements / SAMPLE_PORTFOLIO.length).toFixed(2)

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-lg bg-lime-500/10 border border-lime-500/20 p-3">
            <Wrench className="h-6 w-6 text-lime-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-50">Setup Portfolio</h1>
            <p className="text-sm text-zinc-500">Your career in setup optimization</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Total Setups</p>
            <p className="text-3xl font-black text-lime-400">{SAMPLE_PORTFOLIO.length}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Avg Improvement</p>
            <p className="text-3xl font-black text-blue-400">{avgImprovement}%</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Total Delta</p>
            <p className="text-3xl font-black text-emerald-400">{totalImprovements.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Portfolio Timeline */}
      <div className="border border-zinc-800 rounded-2xl bg-zinc-900 p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6">Setup History</h2>
        <div className="space-y-4">
          {SAMPLE_PORTFOLIO.map((entry, idx) => (
            <div
              key={entry.id}
              onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
              className="p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-800/50 cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-zinc-600 bg-zinc-700 rounded-full w-6 h-6 flex items-center justify-center">
                      {SAMPLE_PORTFOLIO.length - idx}
                    </span>
                    <p className="font-bold text-zinc-200">{entry.vehicleName}</p>
                  </div>
                  <p className="text-sm text-zinc-400 mb-3">{entry.setupChange}</p>
                  {entry.notes && <p className="text-xs text-zinc-500 italic">{entry.notes}</p>}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                    <span className="font-bold text-emerald-400 text-sm">+{entry.improvement}%</span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Expanded details */}
              {selectedEntry?.id === entry.id && (
                <div className="mt-4 pt-4 border-t border-zinc-700 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-zinc-600 mb-1">Vehicle</p>
                      <p className="font-semibold text-zinc-300">{entry.vehicleName}</p>
                    </div>
                    <div>
                      <p className="text-zinc-600 mb-1">Performance Gain</p>
                      <p className="font-semibold text-emerald-400">+{entry.improvement}% lap time</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-zinc-600 mb-1 text-xs">Change Details</p>
                    <p className="font-mono text-xs text-zinc-400 bg-zinc-700/30 rounded p-2">{entry.setupChange}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Export & Share */}
      <div className="flex gap-3 justify-end">
        <button className="px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 hover:border-zinc-600 text-zinc-300 text-sm font-semibold flex items-center gap-2 transition-colors">
          <Download className="h-4 w-4" />
          Download Portfolio
        </button>
        <button className="px-4 py-2 rounded-lg bg-lime-500 hover:bg-lime-600 text-zinc-950 text-sm font-semibold flex items-center gap-2 transition-colors">
          <Share2 className="h-4 w-4" />
          Share Portfolio
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="border border-lime-500/40 bg-lime-500/5 rounded-xl p-6">
        <p className="text-sm text-lime-300">
          <strong>Portfolio Strength:</strong> Your setup changes have delivered an average of <strong>{avgImprovement}% lap time improvement</strong> across {SAMPLE_PORTFOLIO.length} modifications. This portfolio is your career record — take it with you as you move between teams. Share this with potential employers to showcase your setup engineering capability.
        </p>
      </div>
    </div>
  )
}
