const ROLES = [
  'Rider', 'Parent / Guardian', 'Crew Chief', 'Mechanic', 'Suspension Tech',
  'Riding Coach', 'Trainer', 'Physio', 'Data Analyst', 'Team Manager', 'Media',
]

export default function MdTeam() {
  return (
    <section id="team" className="bg-[#0A0A0A] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="mb-16 flex items-end justify-between gap-8 border-b border-zinc-800 pb-8">
          <div>
            <h2 className="font-sans text-[clamp(2rem,6vw,4.5rem)] font-black uppercase leading-[0.9] tracking-tight text-white">
              The way real teams<br />
              <span className="text-lime">actually run.</span>
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-zinc-500 sm:text-base">
              Racing is not a solo sport with a solo login. Eleven roles, scoped permissions,
              and everyone seeing exactly the data they need &mdash; nothing they don&apos;t.
            </p>
          </div>
          <span className="hidden shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 sm:block">
            05 / The Team
          </span>
        </div>

        <ul className="flex flex-wrap gap-3">
          {ROLES.map((role) => (
            <li
              key={role}
              className="border border-zinc-800 px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400"
            >
              {role}
            </li>
          ))}
        </ul>

        <div className="mt-10 border border-zinc-800 bg-[#111111] px-8 py-6">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-lime">
            Multi-role teams unlock on Race Team and Factory Rig
          </p>
        </div>
      </div>
    </section>
  )
}
