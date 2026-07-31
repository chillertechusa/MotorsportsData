const STEPS = [
  {
    num: '01',
    title: 'Describe what you feel',
    body: '"Popping on decel out of corners, started two rides ago." Plain language, from your phone, in the parking lot.',
  },
  {
    num: '02',
    title: 'Get a severity call',
    body: 'Likely causes ranked, parts involved, and the answer that matters: ride it, fix before next race, or do not ride.',
  },
  {
    num: '03',
    title: 'Send it to the shop',
    body: 'Symptom, diagnosis, engine hours, and full service history land with your mechanic before you load the truck.',
  },
]

const MORE = [
  { title: 'Bike file', desc: 'Hours, service alerts, setup notebook, maintenance log' },
  { title: 'Body file', desc: 'Injury log, daily readiness, return-to-ride protocol' },
  { title: 'Ride log', desc: 'Sessions, lap times, and progression across the season' },
  { title: 'Program copilot', desc: 'Ask the season anything in plain English' },
]

export default function MdDoctor() {
  return (
    <section id="doctor" className="bg-[#0A0A0A] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="mb-16 flex items-end justify-between gap-8 border-b border-zinc-800 pb-8">
          <div>
            <h2 className="font-sans text-[clamp(2rem,6vw,4.5rem)] font-black uppercase leading-[0.9] tracking-tight text-white">
              The AI Doctor is<br />
              <span className="text-zinc-600">one of sixteen.</span>
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-zinc-500 sm:text-base">
              Describe a symptom and the AI tells you what is wrong and how bad it is. It is a
              great feature. It is also a small part of what the platform does.
            </p>
          </div>
          <span className="hidden shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 sm:block">
            04 / Bike &amp; Body
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
              <div aria-hidden="true" className="mt-auto h-px w-12 bg-lime" />
            </div>
          ))}
        </div>

        <div className="mt-14">
          <p className="mb-8 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
            Also included on every tier
          </p>
          <div className="grid grid-cols-2 gap-px bg-zinc-800 md:grid-cols-4">
            {MORE.map((item) => (
              <div key={item.title} className="bg-[#0A0A0A] p-8">
                <div className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-lime">
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
