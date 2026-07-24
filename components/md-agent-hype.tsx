'use client'

import { useState } from 'react'
import { ArrowRight, Loader2, CheckCircle2, UserSearch, TrendingUp, Star, Zap } from 'lucide-react'

const STATS = [
  { value: '17', label: 'Championship rounds', sub: 'every season in the system' },
  { value: '2028', label: 'Agent access opens', sub: 'powered by your data' },
  { value: '100%', label: 'Data verified', sub: 'not self-reported — system-tracked' },
]

const PROOF_POINTS = [
  { icon: TrendingUp, text: 'Every lap logged builds your verified performance record' },
  { icon: Star, text: 'Every deal signed becomes part of your commercial history' },
  { icon: Zap, text: 'Every setup sheet proves what you know about the bike' },
  { icon: UserSearch, text: 'Agents search profiles — they pay for access, not you' },
]

export default function MdAgentHype() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('rider')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [count, setCount] = useState<number | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setState('loading')
    try {
      const res = await fetch('/api/agent-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setState('done')
      if (typeof data.total === 'number') setCount(data.total)
    } catch {
      setState('error')
    }
  }

  return (
    <section
      id="agent"
      className="relative bg-zinc-950 border-t border-zinc-800/60 py-20 sm:py-28 overflow-hidden"
      aria-label="Agent Marketplace 2028"
    >
      {/* Background grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(56,189,248,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Sky accent corner */}
      <div aria-hidden="true" className="pointer-events-none absolute top-0 right-0 w-px h-48 bg-gradient-to-b from-sky-400/40 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute top-0 right-0 h-px w-48 bg-gradient-to-l from-sky-400/40 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — The pitch */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 border border-sky-400/30 bg-sky-400/5 px-3 py-1.5 mb-6">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" aria-hidden="true" />
              <span className="font-mono text-[10px] text-sky-400 uppercase tracking-[0.25em]">
                Agent Marketplace — Opening 2028
              </span>
            </div>

            {/* Headline */}
            <h2
              className="text-zinc-100 uppercase leading-none tracking-tight mb-6 text-balance"
              style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontWeight: 900,
                fontSize: 'clamp(2.4rem, 6vw, 4.5rem)',
              }}
            >
              The deal{' '}
              <span className="text-sky-400">starts here.</span>
            </h2>

            {/* Body */}
            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed mb-4 max-w-xl text-pretty">
              Every lap you log. Every deal you sign. Every setup sheet you track. All of it is
              building a <strong className="text-zinc-200">verified performance record</strong> that
              agents, sponsors, and factory teams will pay to access — starting 2028.
            </p>
            <p className="text-zinc-500 text-sm leading-relaxed mb-8 max-w-lg text-pretty">
              No other platform in racing is building this database. We are. The families and riders
              who start today are the ones agents will find first. Log now. Get found later.
            </p>

            {/* Proof points */}
            <ul className="space-y-3 mb-10" role="list">
              {PROOF_POINTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <div className="w-6 h-6 flex items-center justify-center border border-sky-400/20 bg-sky-400/5 shrink-0 mt-0.5">
                    <Icon className="h-3 w-3 text-sky-400" aria-hidden="true" />
                  </div>
                  <span className="text-zinc-300 text-sm leading-snug">{text}</span>
                </li>
              ))}
            </ul>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6 pt-6 border-t border-zinc-800/60">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p
                    className="text-sky-400 font-black leading-none"
                    style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '2rem' }}
                  >
                    {s.value}
                  </p>
                  <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                    {s.label}
                  </p>
                  <p className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest mt-0.5">
                    {s.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Email capture card */}
          <div className="border border-sky-400/20 bg-sky-400/5 p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 flex items-center justify-center border border-sky-400/30 bg-sky-400/10">
                <UserSearch className="h-5 w-5 text-sky-400" aria-hidden="true" />
              </div>
              <div>
                <p
                  className="text-zinc-100 uppercase leading-tight"
                  style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: '1.25rem' }}
                >
                  Get notified first
                </p>
                <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                  Agent access opens 2028
                </p>
              </div>
            </div>

            {state === 'done' ? (
              <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                <CheckCircle2 className="h-10 w-10 text-sky-400" aria-hidden="true" />
                <p
                  className="text-zinc-100 uppercase"
                  style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: '1.5rem' }}
                >
                  {"You're in."}
                </p>
                <p className="text-zinc-400 text-sm max-w-xs text-pretty">
                  We will notify you the moment agent access opens. Keep logging — every session
                  builds your profile.
                </p>
                {count !== null && count > 1 && (
                  <div className="mt-2 border border-sky-400/20 bg-sky-400/5 px-4 py-2">
                    <span className="font-mono text-xs text-sky-400 uppercase tracking-widest">
                      {count.toLocaleString()} riders and teams on the waitlist
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="space-y-4">
                  {/* Role selector */}
                  <div>
                    <label
                      htmlFor="agent-role"
                      className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2"
                    >
                      I am a
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'rider', label: 'Rider' },
                        { id: 'parent', label: 'Parent' },
                        { id: 'agent', label: 'Agent / Scout' },
                        { id: 'sponsor', label: 'Sponsor' },
                        { id: 'team', label: 'Team Manager' },
                        { id: 'other', label: 'Other' },
                      ].map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRole(r.id)}
                          className={[
                            'px-3 py-2 font-mono text-[10px] uppercase tracking-widest border transition-colors text-left',
                            role === r.id
                              ? 'border-sky-400/60 bg-sky-400/10 text-sky-400'
                              : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400',
                          ].join(' ')}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="agent-email"
                      className="block font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2"
                    >
                      Email address
                    </label>
                    <input
                      id="agent-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@racingprogram.com"
                      required
                      className="w-full bg-zinc-900/60 border border-zinc-700 text-zinc-100 placeholder-zinc-600 px-4 py-3 text-sm focus:outline-none focus:border-sky-400/50 transition-colors"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={state === 'loading' || !email.trim()}
                    className="w-full inline-flex items-center justify-center gap-2 bg-sky-400 text-zinc-950 font-bold px-6 py-3 hover:bg-sky-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {state === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Signing up...
                      </>
                    ) : (
                      <>
                        Notify me when it opens
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </>
                    )}
                  </button>

                  {state === 'error' && (
                    <p className="font-mono text-[10px] text-red-400 uppercase tracking-wide text-center">
                      Something went wrong.{' '}
                      <a href="mailto:motorsportsdata@gmail.com" className="underline">
                        Email us directly.
                      </a>
                    </p>
                  )}

                  <p className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest text-center">
                    No spam. No commitments. First access when the marketplace opens.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
