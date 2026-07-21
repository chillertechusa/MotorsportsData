import Image from 'next/image'
import Link from 'next/link'

export default function CommunityCTASection() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="community-cta-heading">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/sand-rail-dark.jpg"
          alt="Custom sand rail buggy in showroom"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-background/85" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
        <p className="text-primary text-xs font-bold uppercase tracking-[0.3em] mb-4">
          Community
        </p>
        <h2
          id="community-cta-heading"
          className="text-foreground text-[clamp(3rem,8vw,7rem)] font-black uppercase leading-none mb-6 text-balance"
          style={{ fontFamily: 'var(--font-barlow-condensed)' }}
        >
          One Tribe,
          <br />
          All <span className="text-primary">Disciplines</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Connect with riders across supercross, FMX, Baja, and sand. Share builds, race reports,
          events, and everything in between.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 px-10 py-5 bg-primary text-primary-foreground font-black uppercase tracking-widest text-base hover:bg-primary/90 transition-colors"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            Explore the Community
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-10 py-5 border border-foreground/30 text-foreground font-bold uppercase tracking-widest text-base hover:border-primary hover:text-primary transition-colors"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            Shop Gear
          </Link>
        </div>
      </div>
    </section>
  )
}
