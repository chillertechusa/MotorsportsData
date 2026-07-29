'use client'

import DemoButton from '@/components/demo-button'
import type { DemoRole } from '@/components/demo-button'
import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

const PERSONAS: {
  fig: string
  sys: string
  role: DemoRole
  title: string
  subtitle: string
  pain: string
  features: string[]
  price: string
  accent: string
}[] = [
  {
    fig: 'FIG 01',
    sys: 'SYS.COACH',
    role: 'coach',
    title: 'I run a coaching program',
    subtitle: 'Independent coach with 5–20 athletes',
    pain: 'Chasing Venmo payments and managing athletes across texts, notes, and Google Sheets.',
    features: [
      'Athlete roster with session history',
      'Recurring billing — send invoices in 10 seconds',
      'Training plan builder per athlete',
      'AI session debrief after every track day',
    ],
    price: 'From $149 / mo',
    accent: 'lime',
  },
  {
    fig: 'FIG 02',
    sys: 'SYS.FAMILY',
    role: 'family_team',
    title: 'I run a family race team',
    subtitle: 'Dad-managed privateer program',
    pain: 'Race budget blowing up, sponsor tracking in a notebook, and setup notes living in your head.',
    features: [
      'Race calendar — upcoming + results',
      'Budget vs actuals — every dollar tracked',
      'Sponsor log with deliverables and renewals',
      'Mechanic notes + suspension history per bike',
    ],
    price: 'From $49 / mo',
    accent: 'yamaha',
  },
  {
    fig: 'FIG 03',
    sys: 'SYS.FACILITY',
    role: 'facility',
    title: 'I run a training facility',
    subtitle: 'Private track, camp programs, memberships',
    pain: 'Camp signups in a spreadsheet, gate fees collected in cash, no member history anywhere.',
    features: [
      'Camp scheduling + rider enrollment',
      'Annual memberships + track day passes',
      'Instructor roster and session assignment',
      'Revenue tracking across all programs',
    ],
    price: 'From $299 / mo',
    accent: 'yamaha',
  },
]

const ACCENT_CLASSES: Record<string, { border: string; text: string; bg: string; label: string }> = {
  lime:   { border: 'border-lime-400/30 hover:border-lime-400/60',   text: 'text-lime-400',   bg: 'bg-lime-400',   label: 'bg-lime-400/10 text-lime-400 border-lime-400/20' },
  yamaha: { border: 'border-[var(--color-yamaha-border)] hover:border-[var(--color-yamaha)]',     text: 'text-[var(--color-yamaha-light)]', bg: 'bg-[var(--color-yamaha)]', label: 'bg-[var(--color-yamaha-faint)] text-[var(--color-yamaha-light)] border-[var(--color-yamaha-border)]' },
}

export default function PersonaSelector() {
  const [active, setActive] = useState<DemoRole | null>(null)

  return (
    <section className="bg-zinc-950 border-t border-zinc-800/60 py-24 px-4" aria-labelledby="persona-heading">
      {/* Section header */}
      <div className="max-w-6xl mx-auto mb-14">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-3">
          SYSTEM / WHO IS THIS FOR
        </p>
        <h2
          id="persona-heading"
          className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-100 text-balance"
          style={{ fontFamily: 'var(--font-barlow-condensed, system-ui)' }}
        >
          Pick your role.<br />
          <span className="text-zinc-500">See your platform.</span>
        </h2>
        <p className="mt-4 text-zinc-400 text-sm max-w-xl leading-relaxed">
          One codebase. Three operating systems. The platform adapts to how you actually run your program — not a generic sports app stapled onto your workflow.
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-800/40">
        {PERSONAS.map((p) => {
          const a = ACCENT_CLASSES[p.accent]
          const isActive = active === p.role
          return (
            <article
              key={p.role}
              onClick={() => setActive(p.role)}
              className={`
                group relative bg-zinc-950 border border-transparent
                ${a.border} p-8 flex flex-col gap-6 cursor-pointer
                transition-all duration-200
                ${isActive ? 'ring-1 ring-offset-0 ring-zinc-700' : ''}
              `}
              aria-selected={isActive}
            >
              {/* Fig label */}
              <div className="flex items-center justify-between">
                <span className={`font-mono text-[9px] uppercase tracking-[0.3em] ${a.text}`}>
                  {p.fig} / {p.sys}
                </span>
                <span className={`font-mono text-[9px] uppercase tracking-wider border px-2 py-0.5 ${a.label}`}>
                  {p.price}
                </span>
              </div>

              {/* Divider */}
              <div className={`h-px w-full ${a.bg} opacity-20`} aria-hidden="true" />

              {/* Title block */}
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-zinc-100 text-balance leading-tight"
                  style={{ fontFamily: 'var(--font-barlow-condensed, system-ui)' }}>
                  {p.title}
                </h3>
                <p className={`text-xs font-mono uppercase tracking-wider mt-1 ${a.text}`}>
                  {p.subtitle}
                </p>
              </div>

              {/* Pain */}
              <p className="text-zinc-400 text-sm leading-relaxed border-l-2 border-zinc-700 pl-3 italic">
                &ldquo;{p.pain}&rdquo;
              </p>

              {/* Features */}
              <ul className="flex flex-col gap-2.5 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle2 className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${a.text}`} aria-hidden="true" />
                    <span className="text-zinc-300 text-sm">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <DemoButton
                role={p.role}
                label={`Try ${p.sys.split('.')[1].toLowerCase()} demo`}
                variant="primary"
                size="md"
                className={`w-full justify-center rounded-none
                  ${p.accent === 'lime'
                    ? 'bg-lime-400 text-zinc-950 hover:bg-lime-300'
                    : p.accent === 'yamaha'
                    ? 'bg-[var(--color-yamaha)] text-zinc-950 hover:bg-[var(--color-yamaha-light)]'
                    : 'bg-[var(--color-yamaha)] text-zinc-950 hover:bg-[var(--color-yamaha-light)]'
                  }
                `}
              />
            </article>
          )
        })}
      </div>

      {/* Bottom note */}
      <p className="max-w-6xl mx-auto mt-6 text-zinc-600 text-xs font-mono">
        DEMO ACCOUNTS / AUTO-PROVISIONED / EXPIRES IN 2 HOURS / NO CARD REQUIRED
      </p>
    </section>
  )
}
