import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

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
            What You Just Saw
          </span>
          <span className="h-px flex-1 bg-zinc-800" />
        </div>

        {/* Two-column content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* 8 Chapters */}
          <div>
            <h2
              className="text-zinc-100 uppercase leading-none tracking-tight mb-6"
              style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
            >
              The <span className="text-lime-400">8 Chapters</span>
            </h2>
            <ul className="space-y-3">
              {[
                { num: '01', color: 'text-lime-400', title: 'Live Telemetry', desc: 'Speed, RPM, lean angle, throttle/brake, suspension travel' },
                { num: '02', color: 'text-cyan-400', title: 'AI Setup Engine', desc: 'Suspension solver, tire gauges, before/after lap-time gain' },
                { num: '03', color: 'text-lime-400', title: 'Readiness & Health', desc: 'HRV, training load, nutrition, mental fitness, injury risk' },
                { num: '04', color: 'text-orange-400', title: 'Live Coaching', desc: 'Sub-500ms lap feed, pit-to-rider radio, coach dashboard' },
                { num: '05', color: 'text-cyan-400', title: 'Competitive Edge', desc: 'Leaderboard climbing, sector deltas, gap-to-leader closing' },
                { num: '06', color: 'text-orange-400', title: 'Crew & Logistics', desc: 'Part vault, engine hours, maintenance scheduling, race calendar' },
                { num: '07', color: 'text-cyan-400', title: 'Business', desc: 'Sponsor media value, invoice tracking, team financials' },
                { num: '08', color: 'text-lime-400', title: 'The Payoff', desc: 'Season totals, championship points, whole-team roster' },
              ].map((item) => (
                <li key={item.num} className="flex gap-3">
                  <span className={`font-mono text-xs font-bold shrink-0 mt-0.5 ${item.color}`}>{item.num}.</span>
                  <span className="text-zinc-300 text-sm leading-relaxed">
                    <strong className="text-zinc-100">{item.title}</strong>
                    {' '}—{' '}{item.desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Why this approach */}
          <div>
            <h2
              className="text-zinc-100 uppercase leading-none tracking-tight mb-6"
              style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
            >
              Why <span className="text-cyan-400">This Approach</span>
            </h2>
            <ul className="space-y-4">
              {[
                { title: 'No false claims', desc: 'Real product metrics animating live, not staged video or mockups' },
                { title: 'Dense information', desc: 'Every second shows new animated data flowing — the actual product velocity' },
                { title: 'Honest storytelling', desc: 'Shows the real UI with real metrics, because that\'s how you earn trust' },
                { title: 'Integrated narrative', desc: 'Training informs readiness, readiness informs setup, setup drives wins' },
                { title: 'One platform', desc: 'From youth mini-bikes through factory operations — same account, same data, different access' },
              ].map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="text-cyan-400 font-bold shrink-0 mt-0.5">&#x2713;</span>
                  <span className="text-zinc-300 text-sm leading-relaxed">
                    <strong className="text-zinc-100">{item.title}</strong>
                    {' '}—{' '}{item.desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="border border-lime-400/20 bg-zinc-900/60 p-8 sm:p-12 text-center">
          <h2
            className="text-zinc-100 uppercase leading-none text-balance mb-3"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Ready to Build Your <span className="text-lime-400">Edge?</span>
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-8 text-pretty">
            Start free. No credit card. Invite your team. Upload your first session. Watch the AI work.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/data/sign-in?redirect=/data"
              className="inline-flex items-center gap-2 bg-lime-400 text-zinc-950 font-semibold px-8 py-4 rounded-lg hover:bg-lime-300 transition-colors text-base"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/data/pricing"
              className="inline-flex items-center gap-2 border border-zinc-700 text-zinc-100 font-semibold px-8 py-4 rounded-lg hover:bg-zinc-800/70 transition-colors text-base"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
