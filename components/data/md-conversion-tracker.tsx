'use client'

import { useEffect, useRef } from 'react'
import { trackMdSubscribeConversion } from '@/lib/gtag'

type Props = {
  transactionId: string
  valueDollars: number
  currency: string
  planId?: string
  isNewCustomer?: boolean
}

/**
 * Fires the Google Ads subscribe conversion once, on mount, from the
 * confirmation page. Renders nothing. Guards against double-firing (React
 * strict-mode remount) with a ref keyed on the transaction id.
 */
export default function MdConversionTracker({
  transactionId,
  valueDollars,
  currency,
  planId,
  isNewCustomer,
}: Props) {
  const firedFor = useRef<string | null>(null)

  useEffect(() => {
    if (!transactionId || firedFor.current === transactionId) return
    firedFor.current = transactionId
    trackMdSubscribeConversion({ transactionId, valueDollars, currency, planId, isNewCustomer })
  }, [transactionId, valueDollars, currency, planId, isNewCustomer])

  return null
}
