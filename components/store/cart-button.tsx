'use client'

import { useCart } from '@/lib/cart-context'

export default function CartButton() {
  const { open, itemCount } = useCart()

  return (
    <button
      onClick={open}
      className="relative p-2 text-foreground hover:text-primary transition-colors"
      aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {itemCount > 0 && (
        <span
          className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-black text-primary-foreground"
          style={{ fontFamily: 'var(--font-barlow-condensed)' }}
        >
          {itemCount}
        </span>
      )}
    </button>
  )
}
