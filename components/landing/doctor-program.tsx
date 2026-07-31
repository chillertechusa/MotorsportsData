const TOOLS = [
  {
    title: 'Season budget',
    desc: 'Set it once. Watch burn rate against plan all season. Know before the money is gone.',
  },
  {
    title: 'Expense capture',
    desc: 'Every entry fee, tire, and tank of gas logged in 10 seconds. Auto-categorized.',
  },
  {
    title: 'QuickBooks export',
    desc: 'One tap, clean categorized CSV. Your accountant will thank you.',
  },
  {
    title: 'Race weekend travel',
    desc: 'Every race gets a travel card — track, drive time, hotel checklist with a budget cap.',
  },
  {
    title: 'Sponsor money tracker',
    desc: 'Who committed what. What has been paid. What is still owed. Collect every dollar.',
  },
  {
    title: 'Program Copilot',
    desc: '"What did we spend at Loretta\'s vs budget?" Ask in plain English.',
  },
]

export default function DoctorProgram() {
  return (
    <section className="bg-[#0A0A0A] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">

        <div className="mb-16 flex items-end justify-between gap-8 border-b border-zinc-800 pb-8">
          <div>
            <h2 className="font-sans text-[clamp(2rem,6vw,4.5rem)] font-black uppercase leading-[0.9] tracking-tight text-white">
              Run the program<br />
              <span className="text-zinc-600">like a business.</span>
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-zinc-500 sm:text-base">
              A season costs $12,000&ndash;$39,000. Most families run it on a debit card and a
              prayer &mdash; missed deductions, uncollected sponsor money, last-minute hotel
              prices. MD gives the family a P&amp;L for the racing program.
            </p>
          </div>
          <span className="hidden shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 sm:block">
            03 / For Mom &amp; Dad
          </span>
        </div>

        <div className="grid gap-px bg-zinc-800 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((item) => (
            <div key={item.title} className="bg-[#0A0A0A] p-8">
              <div className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#A0C050]">
                {item.title}
              </div>
              <div className="mt-3 text-sm leading-relaxed text-zinc-500">{item.desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 border border-zinc-800 bg-[#111111] px-8 py-6">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#A0C050]">
            The kid gets the bike tools. The family gets the money tools. All free.
          </p>
        </div>

      </div>
    </section>
  )
}
