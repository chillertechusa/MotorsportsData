export default function DoctorHow() {
  const steps = [
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

  return (
    <section className="border-t border-zinc-800 bg-zinc-950 py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-600">
          02 // How it works
        </span>
        <h2 className="mt-4 max-w-2xl text-balance text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
          Symptom to shop in three steps.
        </h2>

        <div className="mt-12 grid gap-px border border-zinc-800 bg-zinc-800 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.num} className="flex flex-col gap-4 bg-zinc-950 p-8">
              <span className="font-mono text-4xl font-black text-green-500/30">{step.num}</span>
              <h3 className="text-lg font-bold uppercase tracking-tight text-white">{step.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">{step.body}</p>
            </div>
          ))}
        </div>

        {/* Beyond the doctor — full rider file */}
        <div className="mt-16">
          <h3 className="font-mono text-xs uppercase tracking-widest text-zinc-600">
            And the Doctor is just the start — your whole program lives here
          </h3>
          <div className="mt-6 grid grid-cols-2 gap-px border border-zinc-800 bg-zinc-800 md:grid-cols-4">
            {[
              { title: 'Bike file', desc: 'Hours, service alerts, setup notebook, maintenance log' },
              { title: 'Body file', desc: 'Injury log, daily readiness, return-to-ride tracking' },
              { title: 'Ride log', desc: 'Sessions, lap times, progress over the season' },
              { title: 'Program money', desc: 'Season budget, expenses, QuickBooks export, sponsor tracker' },
            ].map((item) => (
              <div key={item.title} className="bg-zinc-950 p-6">
                <div className="text-sm font-bold uppercase tracking-tight text-green-500">{item.title}</div>
                <div className="mt-2 text-xs leading-relaxed text-zinc-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
