import Footer from '@/components/footer'
import MdNav from '@/components/md-nav'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getProducts } from '@/app/actions/store'
import { formatCents } from '@/lib/money'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Shop — Official Moto D Gear',
  description: 'Official Moto D gear. Tri-blend tees and heavyweight hoodies for supercross, FMX, Baja, and sand rail riders. Limited runs, printed in-house.',
  keywords: ['moto d gear', 'motocross shirts', 'dirt bike hoodies', 'supercross merch', 'offroad apparel'],
  alternates: { canonical: `${BASE_URL}/shop` },
  openGraph: {
    title: 'Shop — Official Moto D Gear',
    description: 'Official Moto D gear. Limited runs, printed in-house.',
    url: `${BASE_URL}/shop`,
    images: [{ url: `${BASE_URL}/images/tee-green.png`, width: 800, height: 800, alt: 'Moto D Tee' }],
  },
}

const CATEGORIES: { key: string; label: string }[] = [
  { key: 'tees', label: 'T-Shirts' },
  { key: 'hoodies', label: 'Hoodies' },
]

export default async function ShopPage() {
  const products = await getProducts()

  return (
    <>
      <MdNav />
      <main className="pt-16">
        <section className="relative py-20 bg-card overflow-hidden" aria-label="Shop header">
          <div className="absolute inset-0 opacity-5">
            <Image src="/images/pattern-gray.png" alt="" fill className="object-cover" aria-hidden="true" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-primary text-xs font-bold uppercase tracking-[0.3em] mb-2">Official Merch</p>
            <h1
              className="text-foreground text-[clamp(3.5rem,10vw,8rem)] font-black uppercase leading-none"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              Gear Up
            </h1>
            <p className="text-muted-foreground mt-3 max-w-lg text-base leading-relaxed">
              Represent Moto D wherever the trail takes you. Limited runs, printed in-house. When
              a size sells out, it&apos;s gone.
            </p>
          </div>
        </section>

        {CATEGORIES.map((cat, idx) => {
          const catProducts = products.filter((p) => p.category === cat.key)
          if (catProducts.length === 0) return null
          return (
            <section
              key={cat.key}
              id={cat.key}
              className={`py-16 ${idx % 2 === 0 ? 'bg-background' : 'bg-card'}`}
              aria-labelledby={`${cat.key}-heading`}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 mb-8">
                  <h2
                    id={`${cat.key}-heading`}
                    className="text-foreground text-4xl font-black uppercase"
                    style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                  >
                    {cat.label}
                  </h2>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {catProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </section>
          )
        })}

        <section className="relative py-20 overflow-hidden bg-primary" aria-label="Custom orders CTA">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-[0.3em] mb-3">Custom Orders</p>
            <h2
              className="text-primary-foreground text-[clamp(2.5rem,6vw,5rem)] font-black uppercase leading-none mb-4"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              Want Custom Gear?
            </h2>
            <p className="text-primary-foreground/80 max-w-md mx-auto mb-8 leading-relaxed">
              Team kits, club orders, custom colorways — hit us up and we&apos;ll make it happen.
            </p>
            <Link
              href="mailto:hello@motorsportsdata.io"
              className="inline-flex items-center gap-2 px-10 py-4 bg-primary-foreground text-primary font-black uppercase tracking-widest text-sm hover:bg-primary-foreground/90 transition-colors"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              Contact the Team
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function ProductCard({
  product,
}: {
  product: Awaited<ReturnType<typeof getProducts>>[number]
}) {
  const soldOut = product.totalStock === 0
  const lowStock = !soldOut && product.totalStock <= 8
  return (
    <Link href={`/shop/${product.slug}`} className="group bg-card block overflow-hidden">
      <div className="relative aspect-square bg-white overflow-hidden">
        <Image
          src={product.images[0] ?? '/placeholder.svg'}
          alt={product.name}
          fill
          className="object-contain transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {product.featured && !soldOut && (
          <div className="absolute top-3 left-3 bg-primary px-2 py-0.5">
            <span
              className="text-primary-foreground text-xs font-black uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              Featured
            </span>
          </div>
        )}
        {lowStock && (
          <div className="absolute top-3 left-3 bg-destructive px-2 py-0.5">
            <span
              className="text-destructive-foreground text-xs font-black uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              Low Stock
            </span>
          </div>
        )}
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <span
              className="text-foreground text-lg font-black uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              Sold Out
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p
          className="text-foreground font-bold uppercase tracking-wide text-sm"
          style={{ fontFamily: 'var(--font-barlow-condensed)' }}
        >
          {product.name}
        </p>
        <p className="text-primary font-black mt-2 text-lg" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
          {formatCents(product.priceCents)}
        </p>
      </div>
    </Link>
  )
}
