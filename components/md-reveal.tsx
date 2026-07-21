'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

interface MdRevealProps {
  children: ReactNode
  /** Extra delay before revealing, in ms. Good for staggering siblings. */
  delay?: number
  className?: string
  /** Render as a different element (default div). */
  as?: 'div' | 'section' | 'li' | 'span'
}

/**
 * Lightweight scroll-reveal wrapper. Adds `.is-visible` to the `.md-reveal`
 * element once it enters the viewport (once — it does not re-hide). Respects
 * prefers-reduced-motion via the CSS in globals.css.
 */
export default function MdReveal({ children, delay = 0, className = '', as = 'div' }: MdRevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // If IntersectionObserver is unavailable, just show it.
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const Tag = as as 'div'

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={`md-reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}
