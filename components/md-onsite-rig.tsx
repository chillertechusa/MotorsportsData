import Link from 'next/link'
import { Radio, Server, Wifi, UserCheck, Cpu, ShieldCheck, MapPin } from 'lucide-react'

const CAPABILITIES = [
  {
    icon: Radio,
    title: 'Live Data Uplink',
    desc: 'Dedicated high-speed uplink at every venue — no relying on stadium Wi-Fi. Telemetry streams directly from the pits into the platform in real time.',
    accent: 'text-lime-400',
    border: 'border-lime-400/20',
    bg: 'bg-lime-400/5',
  },
  {
    icon: Cpu,
    title: 'AI On-Call, Trackside',
    desc: 'Our engineers operate the AI stack from the rig during every session. When your crew chief needs an answer between motos, there is a human and a machine working it.',
    accent: 'text-amber-400',
    border: 'border-amber-400/20',
    bg: 'bg-amber-400/5',
  },
  {
    icon: Server,
    title: 'Data Vault on Wheels',
    desc: 'Every lap, every sensor read, every setup note logged on race day is backed up and secured from the rig before your bikes leave the pits.',
    accent: 'text-zinc-300',
    border: 'border-zinc-700/40',
    bg: 'bg-zinc-800/20',
  },
  {
    icon: Wifi,
    title: 'Multi-Team Mesh Network',
    desc: 'All partner teams connect through the rig\'s private mesh. Every team gets isolated, secure data lanes — none of your data is visible to other teams.',
    accent: 'text-lime-400',
    border: 'border-lime-400/20',
    bg: 'bg-lime-400/5',
  },
  {
    icon: UserCheck,
    title: 'Crew Chief Support Window',
    desc: 'From morning practice through the main event, our analyst is at the rig window. You get a face and a handshake, not a chat bubble.',
    accent: 'text-amber-400',
    border: 'border-amber-400/20',
    bg: 'bg-amber-400/5',
  },
  {
    icon: ShieldCheck,
    title: 'Zero Single Points of Failure',
    desc: 'Redundant uplinks, backup power, and offline data queuing. If the venue loses internet, the rig keeps recording and syncs when the connection restores.',
    accent: 'text-zinc-300',
    border: 'border-zinc-700/40',
    bg: 'bg-zinc-800/20',
  },
]

const WEEKEND_OPS = [
  { label: 'Fri', detail: 'Rig deploys — network check + team onboarding' },
  { label: 'Sat AM', detail: 'Live during all practice + qualifier sessions' },
  { label: 'Sat PM', detail: 'Full ops through every heat race and main event' },
  { label: 'Post-race', detail: 'Debrief packages pushed to all team accounts' },
  { label: 'Sun AM', detail: 'Data vault sealed — pre-positioned for next venue' },
]

const SMX_VENUES = [
  'Anaheim', 'San Diego', 'Detroit', 'Houston', 'Indianapolis',
  'Glendale', 'Minneapolis', 'Nashville', 'Seattle', 'St. Louis',
  'Philadelphia', 'Denver', 'Salt Lake City', 'Pittsburgh',
  'Foxborough', 'East Rutherford', 'Las Vegas',
]

export default function MdOnsiteRig() {
  return (
    <section
      id="command-rig"
      className="bg-zinc-950 border-t border-zinc-800/60 py-16 sm:py-24"
      aria-label="Onsite Command Rig"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-10 sm:mb-14">
          <div className="h-0.5 w-6 bg-amber-400" aria-hidden="true" />
          <span className="font-mono text-[10px] text-amber-400 uppercase tracking-[0.25em]">
            The Differentiator — No Other Platform Does This
          </span>
        </div>

        {/* Top two-column: headline + terminal card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-14 sm:mb-16">

          {/* Left */}
          <div className="flex flex-col justify-center">
            <h2
              className="text-zinc-100 uppercase leading-none mb-6 text-balance"
              style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontWeight: 900,
                fontSize: 'clamp(2.2rem, 5.5vw, 4rem)',
              }}
            >
              We Park{' '}
              <span className="text-amber-400">In The Pits.</span>
              <br />
              We Are Part Of
              <br />
              <span className="text-lime-400">Your Crew.</span>
            </h2>

            <p className="text-zinc-300 text-base sm:text-lg leading-relaxed mb-4">
              Every other data platform sends you a login and wishes you luck. We show up.
            </p>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-4">
              The Motorsports Data Command Rig is a fully staffed, fully networked mobile data operations unit that travels to every SMX 2027 venue. Parked in the pit lane. Your crew chief walks over. Your data is already running.
            </p>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-8">
              No waiting for uploads. No pasting CSVs. No calling support on Monday. Your analyst is trackside when the gate drops and in your ear before the next moto starts.
            </p>

            {/* Status badge */}
            <div className="inline-flex items-center gap-3 border border-amber-400/30 bg-amber-400/5 px-5 py-3.5 self-start">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" aria-hidden="true" />
              <div>
                <p className="font-mono text-[10px] text-amber-400 uppercase tracking-[0.2em] font-bold">
                  Command Rig Status
                </p>
                <p className="font-mono text-xs text-zinc-300 uppercase tracking-widest mt-0.5">
                  Deploying SMX 2027 — Round 1 Anaheim
                </p>
              </div>
            </div>
          </div>

          {/* Right — ops terminal card */}
          <div className="border border-zinc-700 bg-zinc-900/60">
            {/* Terminal chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-950">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="w-2 h-2 rounded-full bg-red-500/60" />
                <span className="w-2 h-2 rounded-full bg-yellow-500/60" />
                <span className="w-2 h-2 rounded-full bg-lime-400" />
              </div>
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest ml-2">
                MD_RIG_01 — ANAHEIM_R01 — ONLINE
              </span>
              <span className="ml-auto flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" aria-hidden="true" />
                <span className="font-mono text-[9px] text-lime-400 uppercase tracking-wider">Live</span>
              </span>
            </div>

            {/* Weekend ops timeline */}
            <div className="divide-y divide-zinc-800/60">
              {WEEKEND_OPS.map(({ label, detail }) => (
                <div key={label} className="flex items-start gap-4 px-4 py-3">
                  <span className="font-mono text-[10px] text-amber-400 uppercase tracking-widest shrink-0 w-14 pt-0.5">
                    {label}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-300 uppercase tracking-widest leading-snug">
                    {detail}
                  </span>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="flex items-center divide-x divide-zinc-800 border-t border-zinc-800">
              <div className="flex-1 px-4 py-4">
                <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mb-1">
                  Partner teams served
                </p>
                <p
                  className="text-lime-400 font-black leading-none"
                  style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '2.25rem' }}
                >
                  10 max
                </p>
              </div>
              <div className="flex-1 px-4 py-4">
                <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mb-1">
                  Uplink redundancy
                </p>
                <p
                  className="text-amber-400 font-black leading-none"
                  style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '2.25rem' }}
                >
                  2x fiber
                </p>
              </div>
            </div>

            {/* Venue strip */}
            <div className="flex items-start gap-2 px-4 py-3 border-t border-zinc-800 bg-zinc-950/60">
              <MapPin className="h-3 w-3 text-zinc-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                {SMX_VENUES.map((city) => (
                  <span key={city} className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 6-capability grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-10">
          {CAPABILITIES.map(({ icon: Icon, title, desc, accent, border, bg }) => (
            <div
              key={title}
              className={`border ${border} ${bg} p-5 sm:p-6`}
            >
              <div className={`flex items-center gap-3 mb-3`}>
                <Icon className={`h-4 w-4 shrink-0 ${accent}`} aria-hidden="true" />
                <h3
                  className={`font-black text-sm uppercase ${accent}`}
                  style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                >
                  {title}
                </h3>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA bar */}
        <div className="border border-amber-400/30 bg-amber-400/5 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div
              className="shrink-0 w-11 h-11 border border-amber-400/40 flex items-center justify-center bg-zinc-950"
              aria-hidden="true"
            >
              <Radio className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p
                className="text-zinc-100 font-black text-lg uppercase leading-tight"
                style={{ fontFamily: 'var(--font-barlow-condensed)' }}
              >
                The rig is the difference.
              </p>
              <p className="text-zinc-400 text-sm mt-1 max-w-lg leading-relaxed">
                Any platform can crunch your CSV after the race. We are the only team that arrives with a command center, a live uplink, and engineers working your data while the race is happening.
              </p>
            </div>
          </div>
          <Link
            href="#team-partner"
            className="shrink-0 inline-flex items-center gap-2 bg-amber-400 text-zinc-950 font-bold px-6 py-3.5 hover:bg-amber-300 transition-colors whitespace-nowrap"
          >
            Apply for Elite Program &rarr;
          </Link>
        </div>

      </div>
    </section>
  )
}
