const MONEY = [
  {
    title: 'Contingency automation',
    body: 'Log a result, and every contingency program you qualify for is matched and filed. No more digging through sponsor PDFs in December to find out you missed the deadline.',
    metric: 'Up to $2,800 / season recovered',
  },
  {
    title: 'Season P&L',
    body: 'Entry fees, parts, fuel, tires, travel, coaching. Every dollar in and out of the program in one view, categorized, with a QuickBooks export your accountant can actually use.',
    metric: 'A $12k–$39k season, finally on the books',
  },
  {
    title: 'Sponsor dashboard',
    body: 'Who committed what. What has been paid. What is still owed. Deliverables tracked per deal, with a one-click ROI report you can send when it is time to renew.',
    metric: 'Renewals close on proof, not vibes',
  },
]

export default function MdMoney() {
  return (
    <section id="money" className="bg-[#0A0A0A] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="mb-16 flex items-end justify-between gap-8 border-b border-zinc-800 pb-8">
          <div>
            <h2 className="font-sans text-[clamp(2rem,6vw,4.5rem)] font-black uppercase leading-[0.9] tracking-tight text-white">
              Stop losing money<br />
              <span className="text-zinc-600">you already earned.</span>
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-zinc-500 sm:text-base">
              Contingency money goes unclaimed every single season because nobody is tracking
              which programs a result qualifies for. MD does it automatically.
            </p>
          </div>
          <span className="hidden shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 sm:block">
            01 / The Money
          </span>
        </div>

        <div className="grid gap-px bg-zinc-800 md:grid-cols-3">
          {MONEY.map((item) => (
            <div key={item.title} className="flex flex-col gap-6 bg-[#0A0A0A] p-10">
              <h3 className="text-base font-black uppercase tracking-tight text-white">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-500">{item.body}</p>
              <div className="mt-auto border-t border-zinc-800 pt-5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-lime">
                {item.metric}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
