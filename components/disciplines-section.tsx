import Image from 'next/image'
import Link from 'next/link'

const disciplines = [
  {
    id: 'supercross',
    title: 'Supercross',
    subtitle: 'Stadium Warfare',
    description:
      'The most technical form of motocross. Stadium tracks, massive jumps, and precision riding under the lights.',
    image: '/images/discipline-supercross.png',
    href: '/community#supercross',
  },
  {
    id: 'fmx',
    title: 'FMX',
    subtitle: 'Freestyle',
    description:
      'Leave the ground, own the air. Freestyle Motocross pushes the limits of what\'s possible on two wheels.',
    image: '/images/discipline-fmx.png',
    href: '/community#fmx',
  },
  {
    id: 'baja',
    title: 'Baja',
    subtitle: 'Desert Conquest',
    description:
      'Thousands of miles of raw desert. Trophy trucks, buggies, and bikes pushing metal to the absolute limit.',
    image: '/images/discipline-baja.png',
    href: '/community#baja',
  },
  {
    id: 'sand-rails',
    title: 'Sand Rails',
    subtitle: '& Sand Trucks',
    description:
      'Custom-built machines built for one purpose — shredding dunes at full throttle.',
    image: '/images/sand-rail-sunset.jpg',
    href: '/community#sand-rails',
  },
]

export default function DisciplinesSection() {
  return (
    <section className="py-20 bg-background" aria-labelledby="disciplines-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-primary text-xs font-bold uppercase tracking-[0.3em] mb-2">
              The Disciplines
            </p>
            <h2
              id="disciplines-heading"
              className="text-foreground text-[clamp(2.5rem,6vw,5rem)] font-black uppercase leading-none"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              Ride Everything
            </h2>
          </div>
          <Link
            href="/community"
            className="hidden md:inline-flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-sm hover:gap-3 transition-all"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            View All
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {disciplines.map((d) => (
            <Link
              key={d.id}
              href={d.href}
              className="group relative aspect-[3/4] overflow-hidden bg-card block"
              aria-label={`Explore ${d.title}`}
            >
              <Image
                src={d.image}
                alt={d.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-1">
                  {d.subtitle}
                </p>
                <h3
                  className="text-foreground text-3xl font-black uppercase leading-none mb-2"
                  style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                >
                  {d.title}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  {d.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
