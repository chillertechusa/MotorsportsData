import Link from 'next/link'

const WMX = [
  {
    title: 'WMX results, first-class',
    body: 'Not a filter on a men’s class list. WMX rounds, points, and championship standings modeled properly from the ground up.',
  },
  {
    title: 'Cross-class tracking',
    body: 'Most women’s riders race multiple classes in a weekend. MD tracks progression across all of them without double-counting the season.',
  },
  {
    title: 'Progression metrics that fit',
    body: 'Benchmarks built on actual WMX field data — not scaled-down numbers borrowed from a 450 pro class.',
  },
]

export default function MdWmx() {
  return (
    <section id="wmx" className="border-y border-lime/25 bg-[#0C0C0C] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="mb-16 flex items-end justify-between gap-8 border-b border-zinc-800 pb-8">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-lime">
              WMX joined the SMX League in 2026
            </span>
            <h2 className="mt-5 font-sans text-[clamp(2rem,6vw,4.5rem)] font-black uppercase leading-[0.9] tracking-tight text-white">
              Built for women&apos;s MX.<br />
              <span className="text-lime">Finally.</span>
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              Women&apos;s motocross got a real professional platform in 2026 and nobody built
              real data tools for it. No results infrastructure, no progression tracking, no
              program tools. We built them.
            </p>
          </div>
          <span className="hidden shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 sm:block">
            03 / WMX
          </span>
        </div>

        <div className="grid gap-px bg-zinc-800 md:grid-cols-3">
          {WMX.map((item) => (
            <div key={item.title} className="flex flex-col gap-5 bg-[#0A0A0A] p-10">
              <h3 className="text-base font-black uppercase tracking-tight text-white">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-500">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border border-lime/40 bg-[#111111] px-8 py-7">
          <p className="max-w-xl text-sm leading-relaxed text-zinc-300">
            Riding or running a women&apos;s program? Get early access and help shape what
            WMX tooling should actually look like.
          </p>
          <Link
            href="/auth/sign-up?track=wmx"
            className="inline-flex shrink-0 items-center justify-center bg-lime px-7 py-4 font-mono text-sm font-bold uppercase tracking-[0.15em] text-black transition-colors hover:bg-lime-bright"
          >
            Get WMX early access
          </Link>
        </div>
      </div>
    </section>
  )
}
