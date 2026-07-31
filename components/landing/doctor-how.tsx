const STEPS = [
  {
    num: '01',
    title: 'Tell the Doctor what you feel',
    body: '"Popping on decel out of corners, started two rides ago." Free text, from your phone, in the parking lot. No codes, no jargon.',
  },
  {
    num: '02',
    title: 'Get a diagnosis with a severity call',
    body: 'Likely causes ranked. Parts that might be involved. And the call that matters: Ride it — Fix before next race — Do not ride.',
  },
  {
    num: '03',
    title: 'Send it to your shop, pre-filled',
    body: 'One tap sends the symptom, diagnosis, engine hours, and full maintenance history to your shop. They call you with a quote, not questions.',
  },
]

const FILES = [
  { title: 'Bike file', desc: 'Hours, service alerts, setup notebook, maintenance log' },
  { title: 'Body file', desc: 'Injury log, daily readiness, return-to-ride tracking' },
  { title: 'Ride log', desc: 'Sessions, lap times, progress over the season' },
  { title: 'Program money', desc: 'Season budget, expenses, QuickBooks export, sponsor tracker' },
]

export default function DoctorHow() {
  return (
    <section className="border-t border-ink-line bg-ink py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <span className="md-label shrink-0 text-lime">02 // How it works</span>
          <span aria-hidden="true" className="h-px flex-1 bg-ink-line" />
        </div>

        <h2 className="mt-5 max-w-2xl text-balance text-3xl font-black tracking-tight text-white uppercase md:text-5xl">
          Symptom to shop in three steps.
        </h2>

        <div className="mt-12 grid gap-px border border-ink-line bg-ink-line md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.num} className="flex flex-col gap-4 bg-ink p-8">
              <div className="flex items-center gap-3">
                <span className="font-mono text-4xl leading-none font-black text-lime-dim">
                  {step.num}
                </span>
                <span aria-hidden="true" className="md-tick" />
              </div>
              <h3 className="text-lg font-bold tracking-tight text-white uppercase">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">{step.body}</p>
            </div>
          ))}
        </div>

        {/* Beyond the doctor — full rider file */}
        <div className="mt-16">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="md-tick" />
            <h3 className="md-label text-zinc-500">
              And the Doctor is just the start — your whole program lives here
            </h3>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-px border border-ink-line bg-ink-line md:grid-cols-4">
            {FILES.map((item) => (
              <div key={item.title} className="bg-ink p-6">
                <div className="text-sm font-bold tracking-tight text-lime uppercase">
                  {item.title}
                </div>
                <div className="mt-2 text-xs leading-relaxed text-zinc-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
