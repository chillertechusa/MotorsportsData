const STAGES = [
  { stage: 'Rookie', age: 'Age 4–12', body: 'First bike, first gate drop. Parents run the money and the schedule.' },
  { stage: 'Privateer', age: 'Age 13+', body: 'Club and regional racing. Own budget, own sponsors, own setup book.' },
  { stage: 'Race Team', age: 'Program', body: 'A roster, a crew, real roles. Multiple riders under one operation.' },
  { stage: 'Factory Rig', age: 'Pro', body: 'Full squad, full data, full season logistics at the top level.' },
]

const CARRIES = [
  'Setup history for every bike you have ever thrown a leg over',
  'Every result, every lap, every season, in one continuous record',
  'Injury log and return-to-ride history that follows the athlete',
  'Sponsor relationships and payout history that prove your value',
]

export default function MdCareer() {
  return (
    <section id="career" className="bg-[#0A0A0A] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="mb-16 flex items-end justify-between gap-8 border-b border-zinc-800 pb-8">
          <div>
            <h2 className="font-sans text-[clamp(2rem,6vw,4.5rem)] font-black uppercase leading-[0.9] tracking-tight text-white">
              One file. First ride<br />
              <span className="text-lime">to retirement.</span>
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-zinc-500 sm:text-base">
              Every other tool makes you start over when you move up. MD is the only platform
              that grows with the career instead of resetting it.
            </p>
          </div>
          <span className="hidden shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 sm:block">
            02 / The Career
          </span>
        </div>

        <div className="grid gap-px bg-zinc-800 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((item, i) => (
            <div key={item.stage} className="flex flex-col gap-4 bg-[#0A0A0A] p-8">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-black text-lime">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span aria-hidden="true" className="h-px flex-1 bg-zinc-800" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-white">
                  {item.stage}
                </h3>
                <div className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                  {item.age}
                </div>
              </div>
              <p className="text-sm leading-relaxed text-zinc-500">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 border border-zinc-800 bg-[#111111] p-10">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
            What carries forward, forever
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {CARRIES.map((line) => (
              <li key={line} className="flex gap-3 text-sm leading-relaxed text-zinc-300">
                <span aria-hidden="true" className="mt-2 h-1 w-4 shrink-0 bg-lime" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
