'use client'

import { useState } from 'react'
import { Copy, CheckCircle, Copy as CopyIcon } from 'lucide-react'

const THEMES = [
  // Rider-focused
  'motocross lap time tracking software',
  'improve dirt bike lap times',
  'motorcycle telemetry analysis',
  'dirt bike performance data',
  'motocross session analysis app',
  'dirt bike suspension setup guide',
  'motocross setup optimization',
  'bike setup tracking software',
  'suspension tuning data analysis',
  'motocross setup comparison tool',
  'motocross coaching software',
  'dirt bike training tracker',
  'motocross data analytics',
  'AI motocross coach',
  'real-time telemetry coaching',
  // Mechanic-focused
  'motorcycle mechanic portfolio software',
  'bike mechanic portfolio builder',
  'automotive mechanic business software',
  'mechanic work order tracking',
  'motocross mechanic tools',
  'track mechanic setup improvements',
  'motorcycle tuning documentation',
  'suspension work tracking system',
  'bike optimization software for mechanics',
  'mechanic career portfolio platform',
  'pit crew management software',
  'race team mechanic coordination',
  // Team-focused
  'race team management software',
  'multi-rider telemetry analysis',
  'motocross team analytics platform',
  'dirt bike fleet tracking',
  'race team data management',
  'motocross team coaching tools',
  'race team performance tracking',
  'rider development software',
  'motocross talent scouting tools',
  'team setup standardization',
  'motocross race data analysis',
  'competitor lap time comparison',
  'race strategy analytics',
  // Informational
  'how to read motocross telemetry data',
  'dirt bike setup best practices',
  'motocross race day preparation checklist',
  'suspension tuning for beginners',
  'motocross performance optimization tips',
  'why my dirt bike is slow',
  'motocross setup problems solutions',
  'improve throttle control techniques',
  'track conditions analysis motocross',
  'finding a motocross coach',
]

export default function GoogleAdsThemesCopy() {
  const [copied, setCopied] = useState<number | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)

  const copyTheme = (index: number) => {
    navigator.clipboard.writeText(THEMES[index])
    setCopied(index)
    setTimeout(() => setCopied(null), 2000)
  }

  const copyAll = () => {
    const allText = THEMES.join('\n')
    navigator.clipboard.writeText(allText)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  const categories = [
    {
      title: 'Rider-Focused Themes',
      themes: THEMES.slice(0, 15),
      color: 'sky',
      start: 1,
    },
    {
      title: 'Mechanic-Focused Themes',
      themes: THEMES.slice(15, 27),
      color: 'amber',
      start: 16,
    },
    {
      title: 'Team/Race Organizer Themes',
      themes: THEMES.slice(27, 40),
      color: 'emerald',
      start: 28,
    },
    {
      title: 'Informational Themes',
      themes: THEMES.slice(40, 50),
      color: 'violet',
      start: 41,
    },
  ]

  const colorMap = {
    sky: 'bg-sky-900/30 border-sky-700 text-sky-300',
    amber: 'bg-amber-900/30 border-amber-700 text-amber-300',
    emerald: 'bg-emerald-900/30 border-emerald-700 text-emerald-300',
    violet: 'bg-violet-900/30 border-violet-700 text-violet-300',
  }

  return (
    <div className="w-full space-y-8">
      {/* Copy all button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={copyAll}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold uppercase tracking-wider text-sm transition-all ${
            copiedAll
              ? 'bg-lime-400 text-zinc-950'
              : 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
          }`}
        >
          {copiedAll ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Copied All (50)
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy All Themes
            </>
          )}
        </button>
      </div>

      {/* Theme categories */}
      {categories.map((category) => (
        <div key={category.title} className="space-y-3">
          <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500 mb-4">
            {category.title} ({category.themes.length})
          </h3>

          <div className="grid grid-cols-1 gap-2">
            {category.themes.map((theme, idx) => {
              const globalIdx = category.start - 1 + idx
              return (
                <div
                  key={globalIdx}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${colorMap[category.color as keyof typeof colorMap]}`}
                >
                  <span className="font-mono text-xs font-bold text-zinc-500 w-8 shrink-0">
                    {globalIdx + 1}.
                  </span>
                  <span className="flex-1 text-sm font-mono">{theme}</span>
                  <button
                    onClick={() => copyTheme(globalIdx)}
                    className="p-2 rounded hover:bg-white/10 transition-colors shrink-0"
                    title="Copy theme"
                  >
                    {copied === globalIdx ? (
                      <CheckCircle className="h-4 w-4 text-lime-400" />
                    ) : (
                      <CopyIcon className="h-4 w-4 opacity-60 hover:opacity-100" />
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Stats */}
      <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-500">
        <span>Total themes: {THEMES.length}</span>
        <span>Paste directly into Google Ads campaign setup</span>
      </div>
    </div>
  )
}
