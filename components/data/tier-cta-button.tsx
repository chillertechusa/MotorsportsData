'use client'

import { useRouter } from 'next/navigation'
import { useAnalytics } from '@/lib/use-analytics'
import { useEffect } from 'react'

interface TierCTAButtonProps {
  tier: string
  label: string
  price: number
  /** True when a session is already active — skip sign-in, go straight to checkout */
  isSignedIn?: boolean
  className?: string
}

export function TierCTAButton({ tier, label, price, isSignedIn = false, className }: TierCTAButtonProps) {
  const router = useRouter()
  const analytics = useAnalytics()

  useEffect(() => {
    analytics.trackPlanViewed(tier)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier])

  function handleClick() {
    analytics.trackBeginCheckout(tier, price / 100)
    analytics.trackCTAClicked(label, `tier_page_${tier}`)

    const isFree = price === 0

    if (isFree) {
      // Free Rider — create account and land on platform console
      router.push('/data/sign-in?mode=sign-up&redirect=%2Fdata')
      return
    }

    if (isSignedIn) {
      // Already authenticated — skip sign-in, go straight to tier checkout
      router.push(`/checkout/tier?tier=${tier}`)
      return
    }

    // Paid tier — carry tier through sign-in → checkout
    const checkoutUrl = `/checkout/tier?tier=${tier}`
    const redirectParam = encodeURIComponent(checkoutUrl)
    router.push(`/data/sign-in?mode=sign-up&redirect=${redirectParam}`)
  }

  return (
    <button onClick={handleClick} className={className}>
      {label}
    </button>
  )
}
