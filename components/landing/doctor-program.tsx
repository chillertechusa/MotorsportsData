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
    desc: 'One tap, clean categorized CSV. If the program runs through an LLC, your accountant will hug you.',
  },
  {
    title: 'Race weekend travel',
    desc: 'Every race gets a travel card — track address, drive time, hotel checklist with a budget cap.',
  },
  {
    title: 'Sponsor money tracker',
    desc: 'Who committed what. What has been paid. What is still owed. Collect every dollar.',
  },
  {
    title: 'Program Copilot',
    desc: '"What did we spend at Loretta\u2019s vs budget?" Ask in plain English. Answers from your own data.',
  },
]

export default function DoctorProgram() {
  return (
    <section className="border-t border-ink-line bg-ink py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <span className="md-label shrink-0 text-lime">03 // For mom and dad</span>
          <span aria-hidden="true" className="h-px flex-1 bg-ink-line" />
        </div>

        <h2 className="mt-5 max-w-3xl text-balance text-3xl font-black tracking-tight text-white uppercase md:text-5xl">
          Run the program like a business. Stop leaving money on the table.
        </h2>
        <p className="mt-6 max-w-2xl text-pretty leading-relaxed text-zinc-400">
          A season of racing costs $12,000&ndash;$39,000. Most families run it on a debit card
          and a prayer &mdash; missed deductions, uncollected sponsor money, hotel prices booked
          at the last minute. MD gives the family the P&amp;L of the racing program.
        </p>

        <div className="mt-12 grid gap-px border border-ink-line bg-ink-line sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((item) => (
            <div key={item.title} className="bg-ink p-6">
              <div className="text-sm font-bold tracking-tight text-white uppercase">
                {item.title}
              </div>
              <div className="mt-2 text-sm leading-relaxed text-zinc-500">{item.desc}</div>
            </div>
          ))}
        </div>

        <div className="md-bracket mt-10 flex items-center gap-4 border border-lime-border bg-lime-faint px-6 py-5">
          <span aria-hidden="true" className="md-tick shrink-0" />
          <p className="md-label text-lime">
            The kid gets the bike tools. The family gets the money tools. All free.
          </p>
        </div>
      </div>
    </section>
  )
}
