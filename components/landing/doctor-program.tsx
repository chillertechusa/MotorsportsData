export default function DoctorProgram() {
  return (
    <section className="border-t border-zinc-800 bg-zinc-950 py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-600">
          03 // For mom and dad
        </span>
        <h2 className="mt-4 max-w-3xl text-balance text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
          Run the program like a business. Stop leaving money on the table.
        </h2>
        <p className="mt-6 max-w-2xl text-pretty leading-relaxed text-zinc-400">
          A season of racing costs $12,000&ndash;$39,000. Most families run it on a debit card
          and a prayer &mdash; missed deductions, uncollected sponsor money, hotel prices booked
          at the last minute. MD gives the family the P&amp;L of the racing program.
        </p>

        <div className="mt-12 grid gap-px border border-zinc-800 bg-zinc-800 sm:grid-cols-2 lg:grid-cols-3">
          {[
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
          ].map((item) => (
            <div key={item.title} className="bg-zinc-950 p-6">
              <div className="text-sm font-bold uppercase tracking-tight text-white">{item.title}</div>
              <div className="mt-2 text-sm leading-relaxed text-zinc-500">{item.desc}</div>
            </div>
          ))}
        </div>

        <p className="mt-8 font-mono text-sm uppercase tracking-widest text-green-500">
          The kid gets the bike tools. The family gets the money tools. All free.
        </p>
      </div>
    </section>
  )
}
