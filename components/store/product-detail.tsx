'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart, formatCents } from '@/lib/cart-context'
import type { ProductWithVariants } from '@/app/actions/store'

export default function ProductDetail({
  product,
  related,
}: {
  product: ProductWithVariants
  related: ProductWithVariants[]
}) {
  const { addItem } = useCart()
  const [activeImage, setActiveImage] = useState(0)
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)

  const color = product.variants[0]?.color ?? ''
  const selected = product.variants.find((v) => v.id === selectedVariantId) ?? null
  const soldOut = product.totalStock === 0

  function handleAdd() {
    if (!selected) return
    addItem({
      variantId: selected.id,
      productSlug: product.slug,
      productName: product.name,
      color: selected.color,
      size: selected.size,
      priceCents: product.priceCents,
      image: product.images[0] ?? '',
      maxStock: selected.stock,
    })
  }

  return (
    <div className="bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-6 text-xs uppercase tracking-widest text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/shop" className="hover:text-foreground">
            Shop
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Gallery */}
          <div>
            <div className="relative aspect-square overflow-hidden bg-white">
              <Image
                src={product.images[activeImage] ?? '/placeholder.svg'}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {soldOut && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                  <span
                    className="text-foreground text-3xl font-black uppercase tracking-widest"
                    style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                  >
                    Sold Out
                  </span>
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(i)}
                    className={`relative h-20 w-20 overflow-hidden bg-white border-2 ${
                      activeImage === i ? 'border-primary' : 'border-transparent'
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <Image src={img} alt="" fill className="object-contain" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h1
              className="text-foreground text-4xl md:text-5xl font-black uppercase leading-none"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              {product.name}
            </h1>
            <p className="mt-2 text-muted-foreground text-sm uppercase tracking-widest">{color}</p>
            <p
              className="mt-4 text-primary text-3xl font-black"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              {formatCents(product.priceCents)}
            </p>

            {product.description && (
              <p className="mt-5 text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            {/* Size selector */}
            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <span
                  className="text-foreground text-sm font-bold uppercase tracking-widest"
                  style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                >
                  Select Size
                </span>
                {selected && (
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    {selected.stock} in stock
                  </span>
                )}
              </div>
              <div className="grid grid-cols-5 gap-2">
                {product.variants.map((v) => {
                  const disabled = v.stock === 0
                  const active = selectedVariantId === v.id
                  return (
                    <button
                      key={v.id}
                      disabled={disabled}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`relative border py-3 text-sm font-black uppercase transition-colors ${
                        active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-foreground hover:border-primary'
                      } ${disabled ? 'cursor-not-allowed opacity-30' : ''}`}
                      style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                      aria-label={`Size ${v.size}${disabled ? ', sold out' : ''}`}
                    >
                      {v.size}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={!selected || soldOut}
              className="mt-8 w-full bg-primary py-4 text-sm font-black uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              {soldOut ? 'Sold Out' : selected ? 'Add to Cart' : 'Select a Size'}
            </button>

            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Printed in-house — limited run
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Free shipping on orders over $100
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Ships in 2–4 business days
              </li>
            </ul>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <div className="mb-8 flex items-center gap-4">
              <h2
                className="text-foreground text-3xl font-black uppercase"
                style={{ fontFamily: 'var(--font-barlow-condensed)' }}
              >
                More Gear
              </h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {related.map((r) => (
                <Link key={r.id} href={`/shop/${r.slug}`} className="group block bg-card overflow-hidden">
                  <div className="relative aspect-square bg-white">
                    <Image
                      src={r.images[0] ?? '/placeholder.svg'}
                      alt={r.name}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-4">
                    <p
                      className="text-foreground text-sm font-bold uppercase"
                      style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                    >
                      {r.name}
                    </p>
                    <p
                      className="mt-1 text-primary font-black"
                      style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                    >
                      {formatCents(r.priceCents)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
