import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type LogoSize = 'sm' | 'md' | 'lg'

// Badge crop is 1254×1379 — nearly square (0.91 ratio)
// Nav: show at 52×57 so it fits in h-16 nav bar cleanly
const sizes: Record<LogoSize, { w: number; h: number }> = {
  sm: { w: 52,  h: 57  },  // nav — fits h-16 bar
  md: { w: 78,  h: 86  },  // sub-pages / footer
  lg: { w: 120, h: 132 },  // sidebar / wider contexts
}

interface MdLogoProps {
  size?: LogoSize
  /** showWordmark is kept for API compatibility but ignored — badge contains the name */
  showWordmark?: boolean
  asLink?: boolean
  className?: string
}

export default function MdLogo({
  size = 'md',
  asLink = false,
  className,
}: MdLogoProps) {
  const { w, h } = sizes[size]

  const inner = (
    <span className={cn('flex items-center shrink-0', className)}>
      <Image
        src="/images/md-logo.jpg"
        alt="Motorsport Data — Motorsports Dirt"
        width={w}
        height={h}
        className="object-contain rounded-sm"
        priority
      />
    </span>
  )

  if (asLink) {
    return (
      <Link href="/" aria-label="Motorsport Data — Home">
        {inner}
      </Link>
    )
  }

  return inner
}
