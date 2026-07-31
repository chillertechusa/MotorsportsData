const TODAY = [
  'You show up cold. The mechanic starts from zero.',
  '“When did it start? What changed? How many hours on it?” — you guess at all three.',
  '$150 diagnostic fee to find out it was a $12 fix.',
  'Your setup notes live in someone’s head. When they move on, they’re gone.',
]

const WITH_MD = [
  'You logged the symptom trackside in 10 seconds.',
  'The AI Doctor already narrowed it to two likely causes.',
  'Your shop got the full file before you arrived: hours, history, setup, symptom.',
  'The mechanic calls you with a quote — not a question.',
]

export default function DoctorProblem() {
  return (
    <section className="border-t border-ink-line bg-ink py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <span className="md-label shrink-0 text-lime">01 // The problem</span>
          <span aria-hidden="true" className="h-px flex-1 bg-ink-line" />
        </div>

        <h2 className="mt-5 max-w-2xl text-balance text-3xl font-black tracking-tight text-white uppercase md:text-5xl">
          &ldquo;It feels weird&rdquo; is not a work order.
        </h2>

        <div className="mt-12 grid gap-px border border-ink-line bg-ink-line md:grid-cols-2">
          {/* Today */}
          <div className="bg-ink p-8">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-2 w-2 bg-red-500" />
              <span className="md-label text-red-500">The shop visit today</span>
            </div>
            <ul className="mt-5 flex flex-col gap-3 text-sm leading-relaxed text-zinc-400">
              {TODAY.map((line) => (
                <li key={line} className="flex gap-3">
                  <span aria-hidden="true" className="mt-0.5 shrink-0 font-mono text-red-500">
                    &times;
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {/* With MD */}
          <div className="md-bracket bg-ink p-8">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-2 w-2 bg-lime" />
              <span className="md-label text-lime">The shop visit with MD</span>
            </div>
            <ul className="mt-5 flex flex-col gap-3 text-sm leading-relaxed text-zinc-300">
              {WITH_MD.map((line) => (
                <li key={line} className="flex gap-3">
                  <span aria-hidden="true" className="mt-0.5 shrink-0 font-mono text-lime">
                    &#10003;
                  </span>
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
