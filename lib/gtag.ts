// Google Ads conversion tracking helpers.
//
// Activates only when NEXT_PUBLIC_GOOGLE_ADS_ID is set (format: "AW-XXXXXXXXXX").
// The subscribe conversion also needs NEXT_PUBLIC_GOOGLE_ADS_SUBSCRIBE_LABEL
// (the part AFTER the slash in the Google Ads "send_to" value: AW-XXXX/LABEL).

// Hardcoded fallback so the tag fires even before the env var is set in Vercel.
export const GOOGLE_ADS_ID =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? 'AW-18311666201'
export const GOOGLE_ADS_SUBSCRIBE_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_SUBSCRIBE_LABEL ?? 'qkEDCPWu884cEJm015tE'

export const isGoogleAdsConfigured = () => GOOGLE_ADS_ID.startsWith('AW-')

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

export type SubscribeConversion = {
  /** Square payment id — used as the Google Ads transaction_id for de-duplication. */
  transactionId: string
  /** Purchase value in dollars (e.g. 49 or 2499). */
  valueDollars: number
  /** ISO currency code. Always "USD" for this product. */
  currency: string
  /** Plan id, passed through for reporting. */
  planId?: string
  /** Whether this is a new customer (first purchase). */
  isNewCustomer?: boolean
}

/**
 * Fire a Google Ads "subscribe" purchase conversion.
 * No-ops safely if gtag isn't loaded or the env vars aren't configured.
 */
export function trackMdSubscribeConversion(conversion: SubscribeConversion) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  if (!isGoogleAdsConfigured() || !GOOGLE_ADS_SUBSCRIBE_LABEL) return

  const conversionData: Record<string, any> = {
    send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_SUBSCRIBE_LABEL}`,
    value: conversion.valueDollars,
    currency: conversion.currency,
    transaction_id: conversion.transactionId,
  }

  // Include new_customer flag if provided
  if (conversion.isNewCustomer !== undefined) {
    conversionData['new_customer'] = conversion.isNewCustomer
  }

  window.gtag('event', 'conversion', conversionData)
}
