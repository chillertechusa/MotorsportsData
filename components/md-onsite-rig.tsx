'use client'

import Link from 'next/link'
import { Radio, Server, Wifi, Users, Cpu, ShieldCheck } from 'lucide-react'

const RIG_CAPABILITIES = [
  {
    icon: Radio,
    title: 'Live Data Uplink',
    copy: 'The rig runs a dedicated high-speed uplink at each venue — no relying on stadium Wi-Fi. Your team\'s telemetry streams directly into the platform from the pits.',
  },
  {
    icon: Cpu,
    title: 'AI On-Call, Trackside',
    copy: 'Our engineers operate the AI stack from the rig in real time. When your crew chief asks a question between motos, there\'s a human and a machine working the answer.',
  },
  {
    icon: Server,
    title: 'Data Vault On Wheels',
    copy: 'Every lap, every sensor read, every setup note logged on race day is backed up and secured from the rig before your bikes leave the pits.',
  },
  {
    icon: Wifi,
    title: 'Multi-Team Mesh Network',
    copy: 'All partner teams connect through the rig\'s private mesh. Every team gets isolated, secure data lanes — none of your data is visible to other teams.',
  },
  {
    icon: Users,
    title: 'Crew Chief Support Window',
    copy: 'From morning practice to the last moto, our team is available at the rig window. You get a face, not just a chat bubble.',
  },
  {
    icon: ShieldCheck,
    title: 'Zero Single Points of Failure',
    copy: 'Redundant uplinks, local backup power, and offline data queuing. If the venue loses internet, the rig keeps recording — sync happens when the connection restores.',
  },
]

const ROUND_LOGISTICS = [
  { label: 'Rig arrives', value: 'Friday — setup + network check' },
  { label: 'Practice support', value: 'Saturday AM — live during all sessions' },
  { label: 'Race day', value: 'Saturday PM — full ops through last gate drop' },
  { label: 'Post-race sync', value: 'Nightly debrief packages pushed to all team accounts' },
  { label: 'Teardown', value: 'Sunday AM — data vault closed, next venue prepped' },
]

export default function MdOnsiteRig() {
  return (
    <section
      id="onsite-rig"
      className="bg-zinc-900/40 border-t border-zinc-800/60 py-16 sm:py-24"
      aria-label="SMX 2027 Onsite Support Rig"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start mb-14 sm:mb-16">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-0.5 w-6 bg-lime-400" aria-hidden="true" />
              <span className="font-mono text-[10px] text-lime-400 uppercase tracking-[0.25em]">
                The Motorsports Data Rig · All 17 Venues
              </span>
            </div>
            <h2
              className="text-zinc-100 uppercase leading-none mb-5 text-balance"
              style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontWeight: 900,
                fontSize: 'clamp(2rem, 6vw, 3.75rem)',
              }}
            >
              We Show Up.{' '}
              <br />
              <span className="text-lime-400">Every Round.</span>
              <br />
              To Every Venue.
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-lg">
              The platform only works if the data is live and the support is real. So we built a mobile command center — the Motorsports Data Rig — that travels to every SMX 2027 venue, sets up in the pits, and serves as the physical backbone for all partner teams.
            </p>
            <p className="text-zinc-500 text-sm sm:text-base leading-relaxed max-w-lg mt-4">
              This is not a remote help desk. This is boots on the ground, a dedicated uplink in the pits, and an engineering team running the AI stack from a rig parked next to yours. No other data platform does this.
            </p>
          </div>

          {/* Rig visual — data terminal card */}
          <div className="relative border border-lime-400/30 bg-zinc-950 p-6 sm:p-8">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-lime-400" aria-hidden="true" />

            {/* Terminal header */}
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-zinc-800">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-lime-400" />
              </div>
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest ml-2">
                MD_RIG_01 — ANAHEIM_R01 — ONLINE
              </span>
              <span className="ml-auto flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" aria-hidden="true" />
                <span className="font-mono text-[10px] text-lime-400 uppercase tracking-wider">Live</span>
              </span>
            </div>

            {/* Round logistics */}
            <ul className="space-y-3 mb-6" role="list" aria-label="Race weekend rig schedule">
              {ROUND_LOGISTICS.map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest w-28 shrink-0 pt-0.5">
                    {item.label}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-300 uppercase tracking-widest leading-snug">
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>

            {/* Active teams readout */}
            <div className="border-t border-zinc-800 pt-4 flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
                  Partner teams onsite
                </p>
                <p
                  className="text-lime-400 font-black leading-none mt-1"
                  style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '2rem' }}
                  aria-label="Up to 10 partner teams served onsite"
                >
                  Up to 10
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
                  Data lanes active
                </p>
                <p
                  className="text-lime-400 font-black leading-none mt-1"
                  style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '2rem' }}
                  aria-label="All lanes secure and isolated"
                >
                  Isolated
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Capability cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {RIG_CAPABILITIES.map(({ icon: Icon, title, copy }) => (
            <div
              key={title}
              className="border border-zinc-800 bg-zinc-950/60 p-5 sm:p-6 hover:border-zinc-600 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-lime-400/10 border border-lime-400/20">
                  <Icon className="h-4 w-4 text-lime-400" aria-hidden="true" />
                </div>
                <h3
                  className="text-zinc-100 font-bold text-base uppercase"
                  style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                >
                  {title}
                </h3>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">{copy}</p>
            </div>
          ))}
        </div>

        {/* Bottom callout bar */}
        <div className="border border-lime-400/30 bg-lime-400/5 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div
              className="shrink-0 w-12 h-12 border border-lime-400/40 flex items-center justify-center bg-zinc-950"
              aria-hidden="true"
            >
              <Radio className="h-5 w-5 text-lime-400" />
            </div>
            <div>
              <p
                className="text-zinc-100 font-bold text-lg uppercase leading-tight"
                style={{ fontFamily: 'var(--font-barlow-condensed)' }}
              >
                The rig is the difference.
              </p>
              <p className="text-zinc-400 text-sm mt-1 max-w-lg leading-relaxed">
                Any platform can crunch your CSV after the race. We are the only team that shows up with a command center, a live uplink, and engineers working the data while the race is happening.
              </p>
            </div>
          </div>
          <Link
            href="#team-partner"
            className="shrink-0 inline-flex items-center gap-2 bg-lime-400 text-zinc-950 font-bold px-6 py-3.5 hover:bg-lime-300 transition-colors whitespace-nowrap"
          >
            Apply for Season Partnership &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
