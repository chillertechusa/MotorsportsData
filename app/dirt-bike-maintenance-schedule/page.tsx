import type { Metadata } from 'next'
import Link from 'next/link'
import MdFooter from '@/components/md-footer'
import MdReveal from '@/components/md-reveal'
import { ChevronRight, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

export const metadata: Metadata = {
  title: 'Dirt Bike Maintenance Schedule: Hours-Based PM Guide for Every Bike | Motorsport Data',
  description: 'The complete dirt bike preventive maintenance schedule — oil changes, valve checks, piston replacements, and air filter intervals listed by engine hours for 2-stroke and 4-stroke motocross bikes.',
  keywords: ['dirt bike maintenance schedule', 'motocross maintenance intervals', '4-stroke oil change hours', 'valve check motocross', 'piston replacement hours dirt bike', 'air filter change motocross', 'dirt bike PM schedule', '2-stroke maintenance schedule'],
  alternates: { canonical: `${BASE_URL}/dirt-bike-maintenance-schedule` },
  openGraph: {
    title: 'Dirt Bike Maintenance Schedule — Hours-Based PM Guide',
    description: 'Oil changes, valve checks, piston replacements — every interval by engine hours for 2-stroke and 4-stroke bikes.',
    url: `${BASE_URL}/dirt-bike-maintenance-schedule`,
  },
}

const fourStrokeSchedule = [
  { interval: 'Every ride', task: 'Check coolant level', parts: '—', notes: 'Top off with distilled water + 50/50 coolant if low' },
  { interval: 'Every ride', task: 'Check chain tension + lube', parts: 'Chain lube', notes: '25–35mm slack at midpoint. Adjust after pressure wash.' },
  { interval: 'Every ride', task: 'Air filter inspection', parts: '—', notes: 'Inspect, clean if needed. Never skip after sand or wet conditions.' },
  { interval: '2–3 ride hours', task: 'Air filter clean + re-oil', parts: 'Filter oil, foam safe cleaner', notes: 'More frequent in dust or sand. Critical — a dirty filter costs a piston.' },
  { interval: '5 hours', task: 'Engine oil change', parts: 'OEM-spec oil, filter', notes: 'Change oil and oil filter together. 5 hours is conservative — correct for racing use.' },
  { interval: '5 hours', task: 'Transmission oil check', parts: 'Gear oil', notes: 'Check level and color. Change if dark or metallic debris present.' },
  { interval: '10 hours', task: 'Coolant check + flush if needed', parts: 'Coolant', notes: 'Flush annually or every 20 hours regardless of appearance.' },
  { interval: '10–15 hours', task: 'Valve clearance check', parts: 'Shims as needed', notes: 'Intake and exhaust. Critical on 250Fs — tighten faster than 450Fs.' },
  { interval: '20–25 hours', task: 'Top-end rebuild (piston + rings)', parts: 'Piston kit, gaskets', notes: 'Racing use — closer to 15 hours for 250Fs under hard use.' },
  { interval: '30 hours', task: 'Fork oil change', parts: 'Fork oil (OEM viscosity)', notes: 'Broken-down fork oil causes fade and reduced damping. Often skipped until too late.' },
  { interval: '40 hours', task: 'Shock fluid + bladder check', parts: 'Shock fluid, bladder', notes: 'Send to a suspension shop — not a home DIY item.' },
  { interval: '50+ hours', task: 'Bottom-end rebuild', parts: 'Crank, bearings, seals', notes: '250F: ~50 hours. 450F: ~60–80 hours. Depends heavily on riding intensity.' },
  { interval: 'Annual', task: 'Brake fluid flush', parts: 'DOT 4 brake fluid', notes: 'Brake fluid absorbs moisture. Flush regardless of appearance.' },
  { interval: 'Annual', task: 'Throttle/clutch cable replace', parts: 'Cables', notes: 'Cheap insurance. A snapping cable mid-race is dangerous.' },
]

const twoStrokeSchedule = [
  { interval: 'Every ride', task: 'Check coolant + chain', parts: 'Coolant, chain lube', notes: 'Same as 4-stroke. Chain is the most neglected item on 2-strokes.' },
  { interval: 'Every ride', task: 'Transmission oil check', parts: 'Gear oil', notes: '2-strokes use transmission oil only — no engine oil. Check every session.' },
  { interval: '2–3 hours', task: 'Air filter clean + re-oil', parts: 'Filter oil, foam cleaner', notes: 'Same interval as 4-stroke. No exceptions for sand or wet conditions.' },
  { interval: '5 hours', task: 'Gear oil change', parts: 'Gear oil (OEM spec)', notes: 'The only oil you\'re changing on a 2-stroke. Keep it clean.' },
  { interval: '15–25 hours', task: 'Top-end rebuild (piston + rings)', parts: 'Piston kit, gaskets', notes: '125cc: 15 hours. 250cc: 25 hours. Power valve cleaning at same interval.' },
  { interval: '15–25 hours', task: 'Power valve cleaning', parts: 'Cleaner, gaskets', notes: 'Carbon buildup kills low-end power. Clean when you do the piston.' },
  { interval: '20 hours', task: 'Reed valve inspection', parts: 'Reed petals as needed', notes: 'Cracked reeds cause hard starting and lost low-end. Inspect and replace if any tip is lifted.' },
  { interval: '30 hours', task: 'Fork oil change', parts: 'Fork oil', notes: 'Same as 4-stroke — often skipped, always worth doing.' },
  { interval: '60–80 hours', task: 'Bottom-end rebuild', parts: 'Crank, bearings, seals', notes: '2-stroke cranks last longer than 4-stroke bottom ends on average.' },
  { interval: 'Annual', task: 'Brake fluid + cables', parts: 'DOT 4, cables', notes: 'Same as 4-stroke. Annual regardless of use.' },
]

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Dirt Bike Maintenance Schedule: Hours-Based PM Guide for Every Bike',
  description: 'The complete dirt bike preventive maintenance schedule by engine hours.',
  url: `${BASE_URL}/dirt-bike-maintenance-schedule`,
  author: { '@type': 'Organization', name: 'Motorsport Data' },
}

export default function DirtBikeMaintenanceSchedulePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <main className="pt-16 bg-zinc-950 min-h-screen">

        {/* Hero */}
        <section className="border-b border-zinc-800 py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <MdReveal>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-px w-8 bg-lime-400" />
                <span className="font-mono text-xs text-lime-400 uppercase tracking-[0.3em]">Maintenance Reference</span>
              </div>
              <h1 className="text-zinc-100 uppercase leading-none tracking-tight text-balance mb-6" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
                Dirt Bike Maintenance Schedule:<br />
                <span className="text-lime-400">Hours-Based PM Guide</span>
              </h1>
              <p className="text-zinc-400 text-lg leading-relaxed max-w-3xl mb-6">
                Every maintenance interval for 4-stroke and 2-stroke motocross bikes, listed by engine hours. Built for racers who track their bikes by use, not the calendar.
              </p>
              <div className="border border-amber-400/30 bg-amber-400/5 px-4 py-3 flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-zinc-400 text-sm leading-relaxed">
                  <strong className="text-zinc-200">Racing intervals are aggressive.</strong> These schedules assume hard racing use — not trail riding or occasional weekend use. For trail/recreational riding, most intervals can be extended by 25–50%.
                </p>
              </div>
            </MdReveal>
          </div>
        </section>

        {/* 4-Stroke Schedule */}
        <section className="py-16 border-b border-zinc-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <MdReveal className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px w-8 bg-lime-400" />
                <span className="font-mono text-xs text-lime-400 uppercase tracking-[0.3em]">4-Stroke (250F / 450F)</span>
              </div>
              <h2 className="text-zinc-100 uppercase leading-none" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}>
                4-Stroke Maintenance Schedule
              </h2>
            </MdReveal>
            <MdReveal>
              <div className="overflow-x-auto">
                <table className="w-full border border-zinc-800 text-sm">
                  <thead>
                    <tr className="bg-zinc-900 border-b border-zinc-800">
                      <th className="px-4 py-3 text-left font-mono text-[10px] text-lime-400 uppercase tracking-widest">Interval</th>
                      <th className="px-4 py-3 text-left font-mono text-[10px] text-lime-400 uppercase tracking-widest">Task</th>
                      <th className="px-4 py-3 text-left font-mono text-[10px] text-lime-400 uppercase tracking-widest hidden md:table-cell">Parts</th>
                      <th className="px-4 py-3 text-left font-mono text-[10px] text-lime-400 uppercase tracking-widest hidden lg:table-cell">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fourStrokeSchedule.map((row, i) => (
                      <tr key={i} className="border-b border-zinc-800 hover:bg-zinc-900 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-zinc-600 shrink-0" />
                            <span className="font-mono text-xs text-lime-400 whitespace-nowrap">{row.interval}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-zinc-300 font-medium">{row.task}</td>
                        <td className="px-4 py-3 text-zinc-500 hidden md:table-cell">{row.parts}</td>
                        <td className="px-4 py-3 text-zinc-500 text-xs hidden lg:table-cell">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </MdReveal>
          </div>
        </section>

        {/* 2-Stroke Schedule */}
        <section className="py-16 border-b border-zinc-800 bg-zinc-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <MdReveal className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px w-8 bg-lime-400" />
                <span className="font-mono text-xs text-lime-400 uppercase tracking-[0.3em]">2-Stroke (125cc / 250cc)</span>
              </div>
              <h2 className="text-zinc-100 uppercase leading-none" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}>
                2-Stroke Maintenance Schedule
              </h2>
            </MdReveal>
            <MdReveal>
              <div className="overflow-x-auto">
                <table className="w-full border border-zinc-800 text-sm">
                  <thead>
                    <tr className="bg-zinc-950 border-b border-zinc-800">
                      <th className="px-4 py-3 text-left font-mono text-[10px] text-lime-400 uppercase tracking-widest">Interval</th>
                      <th className="px-4 py-3 text-left font-mono text-[10px] text-lime-400 uppercase tracking-widest">Task</th>
                      <th className="px-4 py-3 text-left font-mono text-[10px] text-lime-400 uppercase tracking-widest hidden md:table-cell">Parts</th>
                      <th className="px-4 py-3 text-left font-mono text-[10px] text-lime-400 uppercase tracking-widest hidden lg:table-cell">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {twoStrokeSchedule.map((row, i) => (
                      <tr key={i} className="border-b border-zinc-800 hover:bg-zinc-950 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-zinc-600 shrink-0" />
                            <span className="font-mono text-xs text-lime-400 whitespace-nowrap">{row.interval}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-zinc-300 font-medium">{row.task}</td>
                        <td className="px-4 py-3 text-zinc-500 hidden md:table-cell">{row.parts}</td>
                        <td className="px-4 py-3 text-zinc-500 text-xs hidden lg:table-cell">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </MdReveal>
          </div>
        </section>

        {/* Critical reminders */}
        <section className="py-16 border-b border-zinc-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <MdReveal className="mb-8">
              <h2 className="text-zinc-100 uppercase leading-none" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}>
                The Three Rules That Prevent <span className="text-lime-400">Most Engine Failures</span>
              </h2>
            </MdReveal>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { num: '01', title: 'Air filter before oil', body: 'A dirty air filter destroys a top end faster than skipping an oil change. If you have to choose, the filter comes first — every session.' },
                { num: '02', title: 'Log engine hours', body: 'Interval maintenance only works if you know how many hours are on the engine. A trip meter in miles means nothing. Log ride time after every session.' },
                { num: '03', title: 'Don\'t defer valve checks', body: 'A tight exhaust valve burns before any other symptom appears. Check clearances on schedule. By the time the bike is hard to start, the valve seat is already damaged.' },
              ].map((item) => (
                <MdReveal key={item.num}>
                  <div className="border border-zinc-800 p-6 hover:border-lime-400/30 transition-colors h-full">
                    <p className="font-mono text-xs text-lime-400 uppercase tracking-[0.3em] mb-3">{item.num}</p>
                    <h3 className="text-zinc-100 uppercase mb-3" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: '1.3rem' }}>{item.title}</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">{item.body}</p>
                  </div>
                </MdReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Part Vault CTA */}
        <section className="py-16 bg-zinc-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <MdReveal>
              <div className="border border-lime-400/20 bg-zinc-950 p-8 flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-px w-8 bg-lime-400" />
                    <span className="font-mono text-xs text-lime-400 uppercase tracking-[0.3em]">Part Vault</span>
                  </div>
                  <h3 className="text-zinc-100 uppercase mb-3" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: '2rem' }}>
                    Stop tracking hours in your head.
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                    The Part Vault tracks every service item by install date and engine hours. Critical alerts fire before you hit the service limit — not after the race when the valve has already tightened. Privateer plan and above.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/data/privateer" className="inline-flex items-center gap-2 bg-lime-400 text-zinc-950 px-6 py-3 font-black text-xs uppercase tracking-widest hover:bg-lime-300 transition-colors">
                      See the Privateer Plan <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link href="/data/rookie" className="inline-flex items-center gap-2 border border-zinc-700 text-zinc-400 px-6 py-3 font-mono text-xs uppercase tracking-widest hover:border-lime-400 hover:text-lime-400 transition-colors">
                      Rookie Plan — $9/mo
                    </Link>
                  </div>
                </div>
                <div className="md:w-64 space-y-2">
                  {[
                    { part: 'Piston + rings', hours: '24.2 / 25 hrs', status: 'critical' },
                    { part: 'Engine oil', hours: '4.1 / 5 hrs', status: 'warning' },
                    { part: 'Air filter', hours: '2.8 / 3 hrs', status: 'warning' },
                    { part: 'Valve clearance', hours: '11.3 / 15 hrs', status: 'ok' },
                    { part: 'Fork oil', hours: '18.4 / 30 hrs', status: 'ok' },
                  ].map((p) => (
                    <div key={p.part} className="flex items-center justify-between border border-zinc-800 bg-zinc-900 px-3 py-2">
                      <span className="text-zinc-300 text-xs">{p.part}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-zinc-600">{p.hours}</span>
                        <CheckCircle2 className={`h-3 w-3 ${p.status === 'critical' ? 'text-red-400' : p.status === 'warning' ? 'text-amber-400' : 'text-lime-400'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </MdReveal>
          </div>
        </section>

      </main>
      <MdFooter />
    </>
  )
}
