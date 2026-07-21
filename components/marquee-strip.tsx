export default function MarqueeStrip() {
  const items = [
    'Supercross',
    'FMX',
    'Baja Racing',
    'Sand Rails',
    'Sand Trucks',
    'Offroad',
    'Motocross',
    'Send It',
  ]

  const doubled = [...items, ...items]

  return (
    <div
      className="bg-primary py-3 overflow-hidden"
      aria-hidden="true"
    >
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-4 mx-4"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            <span className="text-primary-foreground text-sm font-black uppercase tracking-[0.25em]">
              {item}
            </span>
            <svg
              className="w-3 h-3 text-primary-foreground/60 shrink-0"
              viewBox="0 0 12 12"
              fill="currentColor"
            >
              <polygon points="6,0 12,6 6,12 0,6" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  )
}
