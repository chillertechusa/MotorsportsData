'use client'

/**
 * useAnalytics — pushes events to the GTM dataLayer which forwards to GA4.
 *
 * Key events (mark these as Conversions in GA4 Admin > Events):
 *   sign_up          — new account created
 *   login            — returning user signed in
 *   begin_checkout   — user clicked upgrade / pay button for a tier
 *   purchase         — Stripe checkout completed (fired server-side via webhook ideally)
 *   plan_viewed      — user landed on a tier landing page
 *   demo_started     — user started watching the interactive demo
 *   cta_clicked      — any primary CTA button click
 */

declare global {
  interface Window {
    dataLayer?: any[]
  }
}

function push(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event, ...params })
}

export function useAnalytics() {
  return {
    /** New account created via email/password */
    trackSignUp(method: string = 'email') {
      push('sign_up', { method })
    },

    /** Returning user signed in */
    trackLogin(method: string = 'email') {
      push('login', { method })
    },

    /** User clicked an upgrade / subscribe button */
    trackBeginCheckout(tierName: string, price: number, currency: string = 'USD') {
      push('begin_checkout', {
        currency,
        value: price,
        items: [{ item_id: tierName, item_name: tierName, price, quantity: 1 }],
      })
    },

    /** User landed on a plan/tier page */
    trackPlanViewed(tierName: string) {
      push('plan_viewed', { tier_name: tierName })
    },

    /** Any primary CTA button clicked */
    trackCTAClicked(label: string, location: string) {
      push('cta_clicked', { cta_label: label, cta_location: location })
    },

    /** User started the interactive live demo */
    trackDemoStarted(tierName: string) {
      push('demo_started', { tier_name: tierName })
    },

    /** Billing frequency selected at checkout */
    trackBillingFrequency(tierName: string, frequency: 'annual' | 'monthly') {
      push('billing_frequency_selected', { tier_name: tierName, frequency })
    },
  }
}
