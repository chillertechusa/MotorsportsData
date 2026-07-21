'use client'

import { useState, useEffect } from 'react'
import { Check, AlertCircle, Zap } from 'lucide-react'
import { GOOGLE_ADS_ID, isGoogleAdsConfigured } from '@/lib/gtag'

interface StatusCheck {
  label: string
  status: 'success' | 'error' | 'pending'
  message: string
}

interface ConversionEvent {
  timestamp: string
  type: string
  value: string
  currency: string
}

export default function AdsTestPage() {
  const [checks, setChecks] = useState<StatusCheck[]>([])
  const [events, setEvents] = useState<ConversionEvent[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check GTM + Google Ads configuration on mount
    const newChecks: StatusCheck[] = [
      {
        label: 'GTM Container',
        status: (window as any).dataLayer ? 'success' : 'error',
        message: (window as any).dataLayer
          ? `dataLayer detected (${((window as any).dataLayer || []).length} events)`
          : 'dataLayer not found — GTM may not be loaded',
      },
      {
        label: 'Google Ads ID',
        status: isGoogleAdsConfigured() ? 'success' : 'error',
        message: isGoogleAdsConfigured()
          ? `Configured: ${GOOGLE_ADS_ID}`
          : 'Not configured (AW- prefix missing)',
      },
      {
        label: 'gtag Function',
        status: (window as any).gtag ? 'success' : 'pending',
        message: (window as any).gtag ? 'Ready to fire conversions' : 'Initializing...',
      },
    ]
    setChecks(newChecks)
  }, [])

  const fireTestConversion = () => {
    const timestamp = new Date().toLocaleTimeString()
    const payload = {
      event: 'purchase',
      transaction_id: `test-${Date.now()}`,
      value: 1.0,
      currency: 'USD',
      items: [
        {
          item_name: 'Test Conversion (No Charge)',
          item_id: 'test-item-1',
          price: 1.0,
          quantity: 1,
        },
      ],
    }

    // Push to dataLayer
    if ((window as any).dataLayer) {
      ;(window as any).dataLayer.push(payload)
    }

    // Also fire via gtag if available
    if ((window as any).gtag) {
      ;(window as any).gtag('event', 'purchase', payload)
    }

    setEvents((prev) => [
      ...prev,
      {
        timestamp,
        type: 'purchase (test)',
        value: '$1.00',
        currency: 'USD',
      },
    ])
  }

  const fireRealConversion = async () => {
    setLoading(true)
    try {
      // Call checkout with a fake plan + amount to test real charge
      const res = await fetch('/api/md-renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_cents: 100, // $1.00
          description: 'Test Ads Conversion',
          test_mode: true,
        }),
      })

      if (res.ok) {
        const timestamp = new Date().toLocaleTimeString()
        setEvents((prev) => [
          ...prev,
          {
            timestamp,
            type: 'purchase (real charge)',
            value: '$1.00',
            currency: 'USD',
          },
        ])

        // Fire conversion to GTM
        if ((window as any).dataLayer) {
          ;(window as any).dataLayer.push({
            event: 'purchase',
            transaction_id: `real-${Date.now()}`,
            value: 1.0,
            currency: 'USD',
          })
        }
      }
    } catch (err) {
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-zinc-800 pb-6">
          <h1 className="text-3xl font-bold text-lime-400 mb-2 font-mono">Google Ads Tag Assistant</h1>
          <p className="text-zinc-400 text-sm">
            Test GTM container and fire conversion events to verify Google Ads tracking. Open Google Tag Assistant in another tab to see real-time events.
          </p>
        </div>

        {/* Status Checks */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-300 font-mono">System Status</h2>
          {checks.map((check) => (
            <div
              key={check.label}
              className={`flex items-start gap-3 p-4 rounded border ${
                check.status === 'success'
                  ? 'bg-lime-950 border-lime-700'
                  : check.status === 'error'
                    ? 'bg-red-950 border-red-700'
                    : 'bg-zinc-900 border-zinc-700'
              }`}
            >
              {check.status === 'success' && <Check className="h-5 w-5 text-lime-400 flex-shrink-0 mt-0.5" />}
              {check.status === 'error' && <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />}
              {check.status === 'pending' && <Zap className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />}
              <div className="flex-1">
                <p className="font-mono font-semibold text-sm">{check.label}</p>
                <p className="text-xs text-zinc-400 mt-1">{check.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Test Conversion Buttons */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-300 font-mono">Fire Conversion</h2>
          <button
            onClick={fireTestConversion}
            className="w-full px-4 py-3 bg-blue-600 text-white text-sm font-bold uppercase tracking-widest rounded hover:bg-blue-500 transition-colors"
          >
            Step 1: Fire Test Conversion (No Charge)
          </button>
          <p className="text-xs text-zinc-500">
            Fires a fake purchase event to GTM. No money charged. Open Google Tag Assistant to verify the event appears in real-time.
          </p>

          <button
            onClick={fireRealConversion}
            disabled={loading}
            className="w-full px-4 py-3 bg-lime-400 text-zinc-950 text-sm font-bold uppercase tracking-widest rounded hover:bg-lime-300 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Step 2: Fire Real Conversion ($1 Charge)'}
          </button>
          <p className="text-xs text-zinc-500">
            Charges your card $1.00 (production Square). Fires a real purchase event to GTM + Google Ads conversion pixel.
          </p>
        </div>

        {/* Event Log */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-300 font-mono">Event Log</h2>
          {events.length === 0 ? (
            <p className="text-xs text-zinc-500 p-4 bg-zinc-900 rounded border border-zinc-800">
              No events fired yet. Click a button above to log a conversion.
            </p>
          ) : (
            <div className="space-y-2">
              {events.map((event, idx) => (
                <div key={idx} className="p-3 bg-zinc-900 rounded border border-zinc-700 text-xs font-mono">
                  <div className="flex justify-between items-start">
                    <span className="text-lime-400">{event.timestamp}</span>
                    <span className="text-amber-400">{event.type}</span>
                  </div>
                  <div className="mt-1 text-zinc-400">
                    {event.value} {event.currency}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded p-4 space-y-3 text-xs">
          <p className="font-bold text-zinc-200">How to use:</p>
          <ol className="space-y-1 text-zinc-400 list-decimal list-inside">
            <li>Open Google Tag Manager → Preview your container (GTM-M3VJNV6L)</li>
            <li>Visit this page in the preview tab</li>
            <li>Click "Fire Test Conversion" and watch the event appear in the GTM preview</li>
            <li>Open Google Ads Tag Assistant in a separate tab</li>
            <li>Click "Fire Real Conversion" to test a $1 charge + Ads pixel</li>
            <li>Verify the conversion appears in Tag Assistant within 5 seconds</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
