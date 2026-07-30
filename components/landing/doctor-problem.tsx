export default function DoctorProblem() {
  return (
    <section className="border-t border-zinc-800 bg-zinc-950 py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-600">
          01 // The problem
        </span>
        <h2 className="mt-4 max-w-2xl text-balance text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
          &ldquo;It feels weird&rdquo; is not a work order.
        </h2>

        <div className="mt-12 grid gap-px border border-zinc-800 bg-zinc-800 md:grid-cols-2">
          <div className="bg-zinc-950 p-8">
            <div className="font-mono text-xs uppercase tracking-widest text-red-500">
              The shop visit today
            </div>
            <ul className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-zinc-400">
              <li className="flex gap-3">
                <span className="text-red-500">&times;</span>
                You show up cold. The mechanic starts from zero.
              </li>
              <li className="flex gap-3">
                <span className="text-red-500">&times;</span>
                &ldquo;When did it start? What changed? How many hours on it?&rdquo; &mdash; you guess at all three.
              </li>
              <li className="flex gap-3">
                <span className="text-red-500">&times;</span>
                $150 diagnostic fee to find out it was a $12 fix.
              </li>
              <li className="flex gap-3">
                <span className="text-red-500">&times;</span>
                Your setup notes live in someone&apos;s head. When they move on, they&apos;re gone.
              </li>
            </ul>
          </div>

          <div className="bg-zinc-950 p-8">
            <div className="font-mono text-xs uppercase tracking-widest text-green-500">
              The shop visit with MD
            </div>
            <ul className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-zinc-400">
              <li className="flex gap-3">
                <span className="text-green-500">&#10003;</span>
                You logged the symptom trackside in 10 seconds.
              </li>
              <li className="flex gap-3">
                <span className="text-green-500">&#10003;</span>
                The AI Doctor already narrowed it to two likely causes.
              </li>
              <li className="flex gap-3">
                <span className="text-green-500">&#10003;</span>
                Your shop got the full file before you arrived: hours, history, setup, symptom.
              </li>
              <li className="flex gap-3">
                <span className="text-green-500">&#10003;</span>
                The mechanic calls you with a quote &mdash; not a question.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
