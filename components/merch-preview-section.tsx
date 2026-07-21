import Image from 'next/image'
import Link from 'next/link'

const brandMerch = [
  { id: 'tee-green', name: 'Gear Up Tee', colorway: 'Lime / Black', price: '$32', image: '/images/tee-green.png', tag: 'Best Seller' },
  { id: 'tee-red', name: 'Gear Up Tee', colorway: 'Red / Black', price: '$32', image: '/images/tee-red.png', tag: null },
  { id: 'tee-blue', name: 'Gear Up Tee', colorway: 'Blue / Black', price: '$32', image: '/images/tee-blue.png', tag: null },
  { id: 'hoodie', name: 'Skull Rider Hoodie', colorway: 'Black', price: '$65', image: '/images/hoodie-front.png', tag: 'New Drop' },
]

export default function MerchPreviewSection() {
  const display = brandMerch
  return (
    <section className="py-20 bg-background" aria-labelledby="merch-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-primary text-xs font-bold uppercase tracking-[0.3em] mb-2">
              Represent
            </p>
            <h2
              id="merch-heading"
              className="text-foreground text-[clamp(2.5rem,6vw,5rem)] font-black uppercase leading-none"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              Gear Up
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden md:inline-flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-sm hover:gap-3 transition-all"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            View All Gear
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {display.map((product) => (
            <Link
              key={product.id}
              href="/shop"
              className="group bg-card block overflow-hidden"
              aria-label={`${product.name} — ${product.colorway}`}
            >
              {/* Product image */}
              <div className="relative aspect-square bg-white overflow-hidden">
                <Image
                  src={product.image}
                  alt={`${product.name} in ${product.colorway}`}
                  fill
                  loading="eager"
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                {/* Tag badge */}
                {product.tag && (
                  <div className="absolute top-3 left-3 bg-primary px-2 py-0.5">
                    <span
                      className="text-primary-foreground text-xs font-black uppercase tracking-wider"
                      style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                    >
                      {product.tag}
                    </span>
                  </div>
                )}
                {/* Quick add overlay */}
                <div className="absolute inset-x-0 bottom-0 py-3 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300 text-center">
                  <span
                    className="text-primary-foreground text-xs font-black uppercase tracking-widest"
                    style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                  >
                    Shop Now
                  </span>
                </div>
              </div>

              {/* Product info */}
              <div className="p-4">
                <p
                  className="text-foreground font-bold uppercase tracking-wide text-sm"
                  style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                >
                  {product.name}
                </p>
                <p className="text-muted-foreground text-xs mt-0.5">{product.colorway}</p>
                <p
                  className="text-primary font-black mt-2 text-lg"
                  style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                >
                  {product.price}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-black uppercase tracking-widest text-sm"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            View All Gear
          </Link>
        </div>
      </div>
    </section>
  )
}
