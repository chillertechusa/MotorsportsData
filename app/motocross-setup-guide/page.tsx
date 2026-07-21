import type { Metadata } from 'next'
import Link from 'next/link'
import MdFooter from '@/components/md-footer'
import MdReveal from '@/components/md-reveal'
import { ChevronRight, Info, AlertTriangle, CheckCircle2 } from 'lucide-react'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

export const metadata: Metadata = {
  title: 'How to Set Up a Motocross Bike: Suspension, Gearing & Jetting Guide | Motorsport Data',
  description: 'The complete motocross setup guide — sag, clickers, gearing, and jetting explained for every skill level. Learn how factory teams log setups and why your memory is the biggest risk to your race results.',
  keywords: ['motocross setup guide', 'how to set up motocross bike', 'motocross suspension setup', 'mx sag setup', 'motocross clicker settings', 'motocross gearing guide', 'mx jetting guide', 'dirt bike setup for beginners'],
  alternates: { canonical: `${BASE_URL}/motocross-setup-guide` },
  openGraph: {
    title: 'How to Set Up a Motocross Bike — The Complete Guide',
    description: 'Sag, compression, rebound, gearing, jetting — explained clearly for every skill level.',
    url: `${BASE_URL}/motocross-setup-guide`,
  },
}

const sections = [
  {
    id: 'sag',
    title: 'Sag — Start Here Every Time',
    content: [
      'Race sag is the single most important suspension setting on your bike. Everything else is tuned around it. Get sag wrong and no amount of clicker adjustment will fix the handling.',
      'Race sag is measured with the rider in full gear, sitting in the attack position on the bike. For most 250cc and 450cc motocross bikes the target is 100–105mm. For a 125cc the target is typically 95–100mm.',
      'To measure: get a helper. With the bike on a stand, measure from the rear axle to a mark on the rear fender. This is your "free sag" measurement. Now measure the same point with the rider seated and feet on the pegs. The difference is your race sag.',
      'If race sag is too high (bike sags too much), turn the preload collar clockwise to add spring preload. If race sag is too low (bike sits too high), turn it counterclockwise. Make small adjustments — a quarter turn at a time.',
    ],
    table: {
      headers: ['Bike Class', 'Race Sag Target', 'Static Sag (no rider)'],
      rows: [
        ['50cc / Mini', '75–85mm', '10–20mm'],
        ['65cc / 85cc', '85–95mm', '20–30mm'],
        ['125cc / 150cc', '95–100mm', '25–35mm'],
        ['250cc (2-stroke)', '100–105mm', '30–40mm'],
        ['250F / 450F', '100–105mm', '30–40mm'],
      ],
    },
  },
  {
    id: 'compression',
    title: 'Compression Damping',
    content: [
      'Compression damping controls how fast the suspension compresses when it hits a bump or a landing. More compression = slower compression stroke = stiffer feel. Less compression = faster compression stroke = softer feel.',
      'Most modern motocross forks and shocks have two compression adjusters: high-speed compression (HSC) and low-speed compression (LSC). HSC affects big hits — square-edge bumps, big landings. LSC affects braking bumps and small chatter.',
      'The adjuster is typically a screw on the top of the fork cap (front) or the top of the shock reservoir (rear). Count clicks from fully closed (clockwise until it stops gently — do not force it). Your baseline is the manufacturer\'s recommended setting, usually 10–15 clicks out.',
      'If the bike kicks or packs in the whoops, add compression (turn clockwise). If the bike is harsh and deflects off bumps, reduce compression (turn counterclockwise).',
    ],
    tips: [
      'Always start with the manufacturer\'s baseline setting before adjusting',
      'Change one adjuster at a time — never adjust front and rear simultaneously',
      'Log the track conditions when you make changes — a setting that works on hardpack will be wrong on sand',
      'HSC should only be touched by experienced riders — stick to LSC first',
    ],
  },
  {
    id: 'rebound',
    title: 'Rebound Damping',
    content: [
      'Rebound damping controls how fast the suspension returns after being compressed. Too slow = the bike "packs down" and won\'t come back up between bumps. Too fast = the bike kicks and pushes you out of the seat.',
      'The rebound adjuster is typically on the bottom of the fork leg (front) and the bottom of the shock body (rear). Like compression, count clicks from fully closed.',
      'The classic test: push down hard on the fork or rear of the bike and let go. It should return smoothly to ride height in about one cycle. If it bounces back (pogo), add rebound damping. If it returns slowly and sits low, reduce rebound damping.',
      'In whoops and square-edge chatter, proper rebound is critical. If the front deflects and you lose the front end, check your rebound before your compression — slow rebound causes front push more often than people realize.',
    ],
    table: {
      headers: ['Symptom', 'Likely Cause', 'Adjustment'],
      rows: [
        ['Bike pushes front in corners', 'Rebound too slow (front)', 'Reduce front rebound (counterclockwise)'],
        ['Front kicks over bumps', 'Rebound too fast (front)', 'Add front rebound (clockwise)'],
        ['Bike packs down in whoops', 'Rebound too slow (rear)', 'Reduce rear rebound'],
        ['Rear kicks after landing', 'Rebound too fast (rear)', 'Add rear rebound'],
        ['Bike kicks sideways in ruts', 'Often both compress + rebound', 'Start with sag check first'],
      ],
    },
  },
  {
    id: 'gearing',
    title: 'Gearing',
    content: [
      'Gearing changes are the fastest way to change how a bike feels on a given track without touching suspension. A smaller front sprocket or a larger rear sprocket makes the bike feel stronger out of corners but raises RPM at speed. A larger front or smaller rear gives more top-end speed and lower RPM at cruise.',
      'The standard formula: removing one tooth from the front sprocket is roughly equivalent to adding three teeth to the rear. Front sprocket changes are cheaper and faster to make but are harder on the chain.',
      'For supercross — shorter, tighter tracks with slow corners — most riders go shorter gearing (more bottom end). For outdoor nationals on fast, flowing tracks, they go longer. In sand, shorter gearing helps you stay in the powerband.',
      'Log your gearing with your setup sheet every session. When you change it, note why and what lap time change (if any) resulted. Most riders never do this and never build a real picture of what gearing does for them at specific tracks.',
    ],
    table: {
      headers: ['Track Type', 'Front Sprocket', 'Rear Sprocket', 'Effect'],
      rows: [
        ['Supercross — tight', '12T or 13T', '50T–52T', 'Strong bottom end, quick revving'],
        ['Outdoor — hardpack', '13T', '48T–50T', 'Balanced, all-around'],
        ['Outdoor — sand', '12T or 13T', '50T–52T', 'More power, stay in powerband'],
        ['High-speed tracks', '14T', '48T', 'More top end, less engine work'],
        ['Vet / Beginner class', '13T', '50T', 'Forgiving, easier to ride'],
      ],
    },
  },
  {
    id: 'jetting',
    title: 'Jetting (Carbureted Bikes)',
    content: [
      'Jetting applies to carbureted bikes — mainly 2-strokes and older 4-strokes. Fuel-injected bikes (most modern 250Fs and 450Fs) are mapped by the ECU and adjusted via fuel maps, not physical jets.',
      'The three main jetting components: main jet (controls fuel at full throttle), pilot jet (controls fuel at idle and low throttle), and needle clip position (controls fuel from 1/4 to 3/4 throttle). Temperature, altitude, and humidity all affect jetting.',
      'Rich jetting (too much fuel): bog off the bottom, blubbery at full throttle, black sooty plug, excessive smoke on 2-strokes. Lean jetting (not enough fuel): pinging or popping, overheating, flat acceleration, white or tan plug.',
      'The practical rule: when you change elevation by 2,000 feet or temperature by 30°F, your jetting will change noticeably. Always log the conditions when you set up your jetting — altitude, temperature, and humidity. Most riders jet for sea level and wonder why the bike is rich at elevation.',
    ],
    tips: [
      'For every 2,000 feet of altitude gain, go one main jet size leaner',
      'In hot, dry conditions lean out slightly — less air density means less oxygen, but less moisture too',
      'Check your spark plug color after a session for definitive rich/lean feedback',
      'Log your jetting settings the same way you log suspension — track, conditions, result',
    ],
  },
]

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to Set Up a Motocross Bike: Suspension, Gearing & Jetting Guide',
  description: 'The complete motocross setup guide — sag, clickers, gearing, and jetting explained.',
  url: `${BASE_URL}/motocross-setup-guide`,
  author: { '@type': 'Organization', name: 'Motorsport Data' },
  publisher: { '@type': 'Organization', name: 'Motorsport Data', url: BASE_URL },
}

export default function MotocrossSetupGuidePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <main className="pt-16 bg-zinc-950 min-h-screen">

        {/* Hero */}
        <section className="border-b border-zinc-800 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <MdReveal>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-px w-8 bg-lime-400" />
                <span className="font-mono text-xs text-lime-400 uppercase tracking-[0.3em]">Setup Guide</span>
              </div>
              <h1 className="text-zinc-100 uppercase leading-none tracking-tight text-balance mb-6" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
                How to Set Up a Motocross Bike:<br />
                <span className="text-lime-400">Suspension, Gearing &amp; Jetting</span>
              </h1>
              <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                The complete setup reference — from measuring sag to dialing clickers to logging jetting at altitude. Written for racers at every level, from the parents wrenching on their kid&apos;s PW50 to the privateer chasing setup data across a full season.
              </p>
              <div className="flex items-center gap-4 text-xs font-mono text-zinc-600 uppercase tracking-widest">
                <span>5 sections</span>
                <span className="w-px h-3 bg-zinc-700" />
                <span>Sag · Compression · Rebound · Gearing · Jetting</span>
              </div>
            </MdReveal>
          </div>
        </section>

        {/* Table of contents */}
        <section className="border-b border-zinc-800 bg-zinc-900 py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-4">Contents</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="flex items-center gap-2 text-zinc-400 hover:text-lime-400 transition-colors text-sm group">
                  <ChevronRight className="h-3 w-3 text-zinc-700 group-hover:text-lime-400 transition-colors" />
                  {s.title}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Sections */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {sections.map((section, si) => (
            <MdReveal key={section.id} className="py-16 border-b border-zinc-800">
              <span id={section.id} />
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px w-8 bg-lime-400" />
                <span className="font-mono text-xs text-lime-400 uppercase tracking-[0.3em]">0{si + 1}</span>
              </div>
              <h2 className="text-zinc-100 uppercase leading-none text-balance mb-8" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}>
                {section.title}
              </h2>
              <div className="space-y-4 mb-8">
                {section.content.map((para, i) => (
                  <p key={i} className="text-zinc-400 leading-relaxed">{para}</p>
                ))}
              </div>
              {section.table && (
                <div className="overflow-x-auto mb-8">
                  <table className="w-full border border-zinc-800 text-sm">
                    <thead>
                      <tr className="bg-zinc-900 border-b border-zinc-800">
                        {section.table.headers.map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-mono text-[10px] text-lime-400 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row, ri) => (
                        <tr key={ri} className="border-b border-zinc-800 hover:bg-zinc-900 transition-colors">
                          {row.map((cell, ci) => (
                            <td key={ci} className={`px-4 py-3 ${ci === 0 ? 'text-zinc-300 font-medium' : 'text-zinc-500'}`}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {section.tips && (
                <div className="border border-lime-400/20 bg-lime-400/5 p-5 space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="h-4 w-4 text-lime-400" />
                    <span className="font-mono text-xs text-lime-400 uppercase tracking-widest">Pro Tips</span>
                  </div>
                  {section.tips.map((tip, ti) => (
                    <div key={ti} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-lime-400 mt-0.5 shrink-0" />
                      <p className="text-zinc-400 text-sm leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </MdReveal>
          ))}
        </div>

        {/* Platform CTA */}
        <section className="py-20 border-t border-zinc-800 bg-zinc-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <MdReveal>
              <div className="flex items-start gap-4 border border-lime-400/20 bg-zinc-950 p-8">
                <AlertTriangle className="h-5 w-5 text-lime-400 shrink-0 mt-1" />
                <div>
                  <h3 className="text-zinc-100 uppercase mb-2" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: '1.5rem' }}>
                    Setup knowledge is worthless if you don&apos;t log it.
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                    Everything in this guide becomes an unfair advantage the moment you start recording it. Track, conditions, clicker settings, gearing, jetting — logged once and recalled instantly by MD Intel AI next time you&apos;re at the same track. Privateer plan starts at $49/mo.
                  </p>
                  <Link href="/data/privateer" className="inline-flex items-center gap-2 bg-lime-400 text-zinc-950 px-6 py-3 font-black text-xs uppercase tracking-widest hover:bg-lime-300 transition-colors">
                    Start Logging Setups <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
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
