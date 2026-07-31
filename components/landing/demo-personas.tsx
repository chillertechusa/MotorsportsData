'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DemoButton from '@/components/demo-button'
import { Users, BarChart3, GraduationCap, Bike } from 'lucide-react'
import type { DemoRole } from '@/components/demo-button'

interface Persona {
  id: DemoRole
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
}

const personas: Persona[] = [
  {
    id: 'rider',
    title: 'Rider',
    description: 'Free rider app with AI bike diagnosis',
    icon: <Bike className="h-6 w-6" />,
    features: ['AI bike doctor', 'Ride logs', 'Setup notebook', 'Injury tracking'],
  },
  {
    id: 'moto_dad',
    title: 'Moto Dad',
    description: 'Guardian managing multiple young riders',
    icon: <Users className="h-6 w-6" />,
    features: ['Two minor riders (14 & 11)', 'Guardian access', 'Family team', 'Budget tools'],
  },
  {
    id: 'coach',
    title: 'Coach',
    description: 'Coach with read-only athlete access',
    icon: <GraduationCap className="h-6 w-6" />,
    features: ['Athlete roster', 'Training plans', 'Performance metrics', 'Billing'],
  },
  {
    id: 'family_team',
    title: 'Family Team',
    description: 'Team management with races & sponsors',
    icon: <BarChart3 className="h-6 w-6" />,
    features: ['Race calendar', 'Budget tracking', 'Sponsors', 'Work orders'],
  },
]

export function DemoPersonas() {
  const [selected, setSelected] = useState<DemoRole>('rider')

  const persona = personas.find((p) => p.id === selected)!

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {personas.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            className={`group rounded-lg border-2 p-4 text-left transition-all ${
              selected === p.id
                ? 'border-green-500 bg-green-500/10'
                : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
            }`}
          >
            <div
              className={`mb-3 inline-flex rounded p-2 ${
                selected === p.id ? 'bg-green-500/20' : 'bg-zinc-800'
              }`}
            >
              <div
                className={selected === p.id ? 'text-green-500' : 'text-zinc-400'}
              >
                {p.icon}
              </div>
            </div>
            <p
              className={`font-bold ${
                selected === p.id ? 'text-green-500' : 'text-zinc-200'
              }`}
            >
              {p.title}
            </p>
            <p className="mt-1 text-xs text-zinc-500">{p.description}</p>
          </button>
        ))}
      </div>

      {/* Selected persona details + CTA */}
      <div className="mt-8 border border-zinc-800 bg-zinc-900/50 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="inline-flex rounded-lg bg-green-500/10 p-3">
            <div className="text-green-500">{persona.icon}</div>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-black text-zinc-100">{persona.title}</h3>
            <p className="mt-1 text-zinc-400">{persona.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {persona.features.map((f) => (
                <span
                  key={f}
                  className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400 border border-green-500/20"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <DemoButton
            role={selected}
            label={`Try ${persona.title} Demo`}
            size="lg"
            className="flex-1"
          />
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Demo accounts expire after 2 hours. All demos are fully functional and seeded with real data.
      </p>
    </div>
  )
}
