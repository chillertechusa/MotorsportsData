import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export default function MdDemoDetails() {
  return (
    <section className="bg-zinc-950 pb-24 relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(163,230,53,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.018) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Divider */}
        <div className="flex items-center gap-4 mb-16">
          <span className="h-px flex-1 bg-zinc-800" />
          <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-[0.25em]">
            What Your Program Includes
          </span>
          <span className="h-px flex-1 bg-zinc-800" />
        </div>

        {/* Two-column content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* What you get */}
          <div>
            <h2
              className="text-zinc-100 uppercase leading-none tracking-tight mb-6"
              style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
            >
              The <span className="text-lime-400">Season Stack</span>
            </h2>
            <ul className="space-y-3">
              {[
                { color: 'text-lime-400', title: 'Full Lap Telemetry', desc: 'Speed, RPM, lean angle, throttle/brake, suspension travel — every session, every round' },
                { color: 'text-amber-400', title: 'Crew Chief AI', desc: 'Live setup recommendations during practice and qualifying. Reads your season dataset.' },
                { color: 'text-lime-400', title: 'Post-Moto Debrief', desc: 'Auto-generated after every session. Lap splits, deltas, setup correlation, AI note.' },
                { color: 'text-amber-400', title: 'Command Rig Access', desc: 'Physical workstation inside the rig at every venue. Plug in. No pass required.' },
                { color: 'text-lime-400', title: 'Season Intelligence', desc: 'Cross-round setup trending, track-type correlations, championship scenario modeling.' },
                { color: 'text-amber-400', title: 'R&D Data Layer', desc: 'Development build tracking. Know which changes moved the lap time.' },
                { color: 'text-lime-400', title: 'Embedded Analyst', desc: 'Command + Factory programs: analyst in your pit or at the rig every race weekend.' },
                { color: 'text-amber-400', title: 'Full Data Export', desc: 'Your data is yours. Season-end export in any format your engineering team needs.' },
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${item.color}`} aria-hidden="true" />
                  <span className="text-zinc-300 text-sm leading-relaxed">
                    <strong className="text-zinc-100">{item.title}</strong>
                    {' '}—{' '}{item.desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Why this is different */}
          <div>
            <h2
              className="text-zinc-100 uppercase leading-none tracking-tight mb-6"
              style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
            >
              Why <span className="text-amber-400">Teams Switch</span>
            </h2>
            <ul className="space-y-4">
              {[
                { title: 'MoTeC i2 Pro + Pi Toolbox replacement', desc: 'Both are desktop apps you run after the fact. We run live, trackside, during qualifying.' },
                { title: 'Analyst at every venue', desc: 'You currently fly one in for select rounds. We put one at the rig every single weekend.' },
                { title: 'No fragmented stack', desc: 'Telemetry, setup logs, fitness, debrief, and team comms — one login, one source of truth.' },
                { title: 'One sponsor line item', desc: '$42.5K–$127.5K fits cleanly in a corporate partner deck. No 6-vendor negotiation.' },
                { title: 'Season locked, not month-to-month', desc: 'Both parties commit. Your analyst is there Round 1, Vegas Final, and every round between.' },
              ].map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="text-lime-400 font-bold shrink-0 mt-0.5">&#x2713;</span>
                  <span className="text-zinc-300 text-sm leading-relaxed">
                    <strong className="text-zinc-100">{item.title}</strong>
                    {' '}—{' '}{item.desc}
                  </span>
                </li>
              ))}
            </ul>

            {/* Current stack cost comparison */}
            <div className="mt-8 border border-zinc-800 bg-zinc-900/40 p-5">
              <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mb-3">Current team spend to replace</p>
              <div className="space-y-1.5">
                {[
                  { item: 'MoTeC i2 Pro', cost: '$720/yr' },
                  { item: 'Pi Toolbox Ultra', cost: '$720/yr' },
                  { item: 'Data analyst (fully loaded)', cost: '$90K–$110K/yr' },
                  { item: 'Analyst travel (17 rounds)', cost: '$34K–$51K/yr' },
                ].map((r) => (
                  <div key={r.item} className="flex justify-between text-sm">
                    <span className="text-zinc-500">{r.item}</span>
                    <span className="font-mono text-zinc-400">{r.cost}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-2 border-t border-zinc-700 mt-2">
                  <span className="text-zinc-300 font-bold">Current total</span>
                  <span className="font-mono text-red-400 font-bold">~$125K–$162K/yr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-300 font-bold">Command Partner</span>
                  <span className="font-mono text-lime-400 font-bold">$127,500 season</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="border border-lime-400/20 bg-zinc-900/60 p-8 sm:p-12 text-center">
          <h2
            className="text-zinc-100 uppercase leading-none text-balance mb-3"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Buy Your Program.{' '}
            <span className="text-lime-400">Start Round 1.</span>
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-8 text-pretty">
            Three programs. Square checkout. Season total charged once. Onboarding call within 24 hours. Command Rig locked before Anaheim.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="#team-partner"
              className="inline-flex items-center gap-2 bg-lime-400 text-zinc-950 font-bold px-8 py-4 hover:bg-lime-300 transition-colors text-base"
            >
              See All Programs
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <a
              href="mailto:motorsportsdata@gmail.com?subject=SMX%202027%20Program%20Question"
              className="inline-flex items-center gap-2 border border-zinc-700 text-zinc-100 font-semibold px-8 py-4 hover:bg-zinc-800/70 transition-colors text-base"
            >
              Talk to Our Team
            </a>
          </div>
          <p className="font-mono text-[10px] text-zinc-700 uppercase tracking-widest mt-6">
            Season-length contracts · Jan to May 2027 · Payments secured by Square
          </p>
        </div>
      </div>
    </section>
  )
}
