const GROUPS = [
  {
    group: 'Money & business',
    items: [
      'Contingency matching and claim filing',
      'Season P&L with QuickBooks export',
      'Sponsor deals, deliverables and ROI reports',
      'Entry fees, travel and per-race cost',
    ],
  },
  {
    group: 'Bike & setup',
    items: [
      'AI Doctor symptom diagnosis',
      'Suspension and gearing setup notebook',
      'Engine hours and service alerts',
      'Work orders sent straight to your shop',
    ],
  },
  {
    group: 'Rider & body',
    items: [
      'Daily readiness and training load',
      'Injury log and return-to-ride protocol',
      'Lap times and session progression',
      'AI riding coach on your own data',
    ],
  },
  {
    group: 'Team & season',
    items: [
      'Eleven roles with scoped permissions',
      'Race calendar and travel logistics',
      'Roster, crew and rig assignments',
      'Career file that follows the rider',
    ],
  },
]

const CONSOLES = [
  { name: 'Rider', desc: 'Ride log, readiness, setup, coach' },
  { name: 'Parent', desc: 'Budget, schedule, safety, receipts' },
  { name: 'Mechanic', desc: 'Work orders, hours, service history' },
  { name: 'Coach', desc: 'Roster progression, session plans' },
  { name: 'Owner', desc: 'Program P&L, sponsors, forecasting' },
]

export default function MdPlatform() {
  return (
    <section id="platform" className="bg-[#0A0A0A] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="mb-16 flex items-end justify-between gap-8 border-b border-zinc-800 pb-8">
          <div>
            <h2 className="font-sans text-[clamp(2rem,6vw,4.5rem)] font-black uppercase leading-[0.9] tracking-tight text-white">
              Everything the<br />
              <span className="text-zinc-600">platform does.</span>
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-zinc-500 sm:text-base">
              One login, one rider file, and a purpose-built console for every person in the
              program. Nothing lives in a group chat or a shoebox of receipts.
            </p>
          </div>
          <span className="hidden shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 sm:block">
            06 / The Platform
          </span>
        </div>

        <div className="grid gap-px bg-zinc-800 md:grid-cols-2 lg:grid-cols-4">
          {GROUPS.map((group) => (
            <div key={group.group} className="bg-[#0A0A0A] p-8">
              <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-lime">
                {group.group}
              </h3>
              <ul className="mt-6 flex flex-col gap-4">
                {group.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-snug text-zinc-400">
                    <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 bg-zinc-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <p className="mb-8 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
            A console built for each role
          </p>
          <div className="grid gap-px bg-zinc-800 sm:grid-cols-3 lg:grid-cols-5">
            {CONSOLES.map((console) => (
              <div key={console.name} className="bg-[#0A0A0A] p-8">
                <div className="text-base font-black uppercase tracking-tight text-white">
                  {console.name}
                </div>
                <div className="mt-3 text-xs leading-relaxed text-zinc-500">{console.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
