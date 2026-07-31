const STEPS = [
  {
    num: '01',
    title: 'Tell the Doctor what you feel',
    body: '"Popping on decel out of corners, started two rides ago." Free text, from your phone, in the parking lot. No codes, no jargon.',
  },
  {
    num: '02',
    title: 'Get a diagnosis with a severity call',
    body: 'Likely causes ranked. Parts that might be involved. The call that matters: Ride it — Fix before next race — Do not ride.',
  },
  {
    num: '03',
    title: 'Send it to your shop, pre-filled',
    body: 'One tap sends the symptom, diagnosis, engine hours, and full maintenance history. They call you with a quote, not questions.',
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
    <section className="bg-[#0A0A0A] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">

        <div className="mb-16 flex items-end justify-between gap-8 border-b border-zinc-800 pb-8">
          <h2 className="font-sans text-[clamp(2rem,6vw,4.5rem)] font-black uppercase leading-[0.9] tracking-tight text-white">
            Symptom to shop<br />
            <span className="text-[#A0C050]">in three steps.</span>
          </h2>
          <span className="hidden shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 sm:block">
            02 / How It Works
          </span>
        </div>

        <div className="grid gap-px bg-zinc-800 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.num} className="flex flex-col gap-6 bg-[#0A0A0A] p-10">
              <span className="font-mono text-5xl font-black leading-none text-zinc-800">
                {step.num}
              </span>
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-500">{step.body}</p>
              </div>
              <div className="mt-auto h-px w-12 bg-[#A0C050]" />
            </div>
          ))}
        </div>

        {/* Full rider file */}
        <div className="mt-24">
          <p className="mb-8 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
            And the Doctor is just the start
          </p>
          <div className="grid grid-cols-2 gap-px bg-zinc-800 md:grid-cols-4">
            {FILES.map((item) => (
              <div key={item.title} className="bg-[#0A0A0A] p-8">
                <div className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#A0C050]">
                  {item.title}
                </div>
                <div className="mt-3 text-xs leading-relaxed text-zinc-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
