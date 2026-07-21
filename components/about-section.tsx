import Image from 'next/image'
import Link from 'next/link'

export default function AboutSection() {
  return (
    <section
      className="py-20 bg-card relative overflow-hidden"
      aria-labelledby="about-heading"
    >
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5">
        <Image
          src="/images/pattern-gray.png"
          alt=""
          fill
          className="object-cover object-center"
          aria-hidden="true"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <p className="text-primary text-xs font-bold uppercase tracking-[0.3em] mb-3">
              The Brand
            </p>
            <h2
              id="about-heading"
              className="text-foreground text-[clamp(2.8rem,6vw,5rem)] font-black uppercase leading-none mb-6"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              Passion.
              <br />
              Drive.
              <br />
              <span className="text-primary">Results.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Moto D was born in 2018 from a simple belief: the offroad motorsports community
              deserved a brand that matched its intensity. We&apos;re not just a clothing label —
              we&apos;re a movement built by riders who send it, breathe dirt, and push limits.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              From Supercross stadiums to Baja deserts, from FMX ramps to open dunes — Moto D
              represents every form of offroad freedom. Whether you ride two wheels or four, this
              community is yours.
            </p>

            {/* Pillars */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                {
                  label: 'PASSION',
                  svg: (
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                },
                {
                  label: 'DRIVE',
                  svg: (
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                },
                {
                  label: 'RESULTS',
                  svg: (
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  ),
                },
              ].map((pillar) => (
                <div
                  key={pillar.label}
                  className="border border-border p-4 text-center flex flex-col items-center gap-2"
                >
                  {pillar.svg}
                  <p
                    className="text-primary text-sm font-black uppercase tracking-widest"
                    style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                  >
                    {pillar.label}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="/community"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              Join the Tribe
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Official brand logo */}
          <div className="relative flex justify-center">
            {/* Gold glow effect */}
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-10"
              style={{ background: 'var(--primary)' }}
            />
            {/* Framed logo panel */}
            <div className="relative z-10 w-full max-w-md p-2 border border-primary/40 bg-transparent">
              <div className="border border-primary/20 bg-transparent p-6">
                <Image
                  src="/images/moto-d-logo.png"
                  alt="Moto D Motorsports crest — skull-helmet rider with the motto Ride Hard, Stay True"
                  width={800}
                  height={400}
                  loading="eager"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
