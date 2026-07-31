const TODAY = [
  'You show up cold. The mechanic starts from zero.',
  '"When did it start? What changed? How many hours?" — you guess at all three.',
  '$150 diagnostic fee to find out it was a $12 fix.',
  'Your setup notes live in someone\'s head. When they leave, they\'re gone.',
]

const WITH_MD = [
  'You logged the symptom trackside in 10 seconds.',
  'The AI Doctor already narrowed it to two likely causes.',
  'Your shop got the full file before you arrived — hours, history, setup, symptom.',
  'The mechanic calls you with a quote, not questions.',
]

export default function DoctorProblem() {
  return (
    <section className="bg-[#0A0A0A] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">

        <div className="mb-16 flex items-end justify-between gap-8 border-b border-zinc-800 pb-8">
          <h2 className="font-sans text-[clamp(2rem,6vw,4.5rem)] font-black uppercase leading-[0.9] tracking-tight text-white">
            &ldquo;It feels weird&rdquo;<br />
            <span className="text-zinc-600">is not a work order.</span>
          </h2>
          <span className="hidden shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 sm:block">
            01 / The Problem
          </span>
        </div>

        <div className="grid gap-px bg-zinc-800 md:grid-cols-2">
          {/* Today */}
          <div className="bg-[#0A0A0A] p-10">
            <p className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-red-500">
              The shop visit today
            </p>
            <ul className="space-y-5">
              {TODAY.map((line) => (
                <li key={line} className="flex gap-4 text-sm leading-relaxed text-zinc-500">
                  <span className="mt-0.5 shrink-0 font-mono font-bold text-red-600">&times;</span>
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {/* With MD */}
          <div className="bg-[#111111] p-10">
            <p className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#A0C050]">
              The shop visit with MD
            </p>
            <ul className="space-y-5">
              {WITH_MD.map((line) => (
                <li key={line} className="flex gap-4 text-sm leading-relaxed text-zinc-300">
                  <span className="mt-0.5 shrink-0 font-mono font-bold text-[#A0C050]">&#10003;</span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </section>
  )
}
