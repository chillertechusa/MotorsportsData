'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Copy, ExternalLink, Zap } from 'lucide-react'
import {
  GOOGLE_ADS_ID,
  GOOGLE_ADS_SUBSCRIBE_LABEL,
  isGoogleAdsConfigured,
  trackMdSubscribeConversion,
} from '@/lib/gtag'

type LogEntry = { time: string; message: string }

const BASE_URL = 'https://motorsportsdata.io'

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label ? `Copy ${label}` : 'Copy'}
      className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800/60 px-2.5 py-1.5 text-xs font-mono text-zinc-300 transition-colors hover:border-lime-400/50 hover:text-lime-400"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function AdsSetupTool() {
  const [txn, setTxn] = useState('TEST123')
  const [value, setValue] = useState('49')
  const [currency, setCurrency] = useState('USD')
  const [email, setEmail] = useState('test@example.com')
  const [gtagReady, setGtagReady] = useState(false)
  const [log, setLog] = useState<LogEntry[]>([])

  useEffect(() => {
    const check = () =>
      setGtagReady(typeof window !== 'undefined' && typeof window.gtag === 'function')
    check()
    const id = setInterval(check, 1000)
    return () => clearInterval(id)
  }, [])

  const scanUrl = useMemo(() => {
    const params = new URLSearchParams({
      plan: 'privateer',
      txn,
      value,
      currency,
      email,
    })
    return `${BASE_URL}/data/checkout/success?${params.toString()}`
  }, [txn, value, currency, email])

  const fields = [
    { field: 'TRANSACTION ID', value: txn || '—', selector: '#order-transaction-id' },
    { field: 'CONVERSION VALUE', value: Number(value || 0).toFixed(2), selector: '#order-value' },
    { field: 'CURRENCY CODE', value: currency || '—', selector: '#order-currency' },
    { field: 'EMAIL (OPTIONAL)', value: email || '—', selector: '#order-email' },
  ]

  function addLog(message: string) {
    const time = new Date().toLocaleTimeString()
    setLog((prev) => [{ time, message }, ...prev].slice(0, 12))
  }

  function testFire() {
    if (!gtagReady) {
      addLog('gtag not ready — cannot fire. Check that GTM/Ads tag loaded.')
      return
    }
    if (!isGoogleAdsConfigured()) {
      addLog('Google Ads ID not configured (missing AW- prefix).')
      return
    }
    trackMdSubscribeConversion({
      transactionId: txn || `TEST-${Date.now()}`,
      valueDollars: Number(value || 0),
      currency: currency || 'USD',
      isNewCustomer: true,
    })
    addLog(
      `Fired conversion → ${GOOGLE_ADS_ID}/${GOOGLE_ADS_SUBSCRIBE_LABEL} · value=${Number(
        value || 0,
      ).toFixed(2)} ${currency} · txn=${txn || 'auto'} · new_customer=true`,
    )
  }

  const statusPills = [
    { label: 'gtag()', ok: gtagReady, detail: gtagReady ? 'Loaded' : 'Waiting…' },
    {
      label: 'Ads ID',
      ok: isGoogleAdsConfigured(),
      detail: GOOGLE_ADS_ID,
    },
    {
      label: 'Conversion label',
      ok: Boolean(GOOGLE_ADS_SUBSCRIBE_LABEL),
      detail: GOOGLE_ADS_SUBSCRIBE_LABEL || 'Not set',
    },
  ]

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 lg:py-16">
      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-lime-400 mb-3">
          Internal Tool · Noindex
        </p>
        <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-zinc-50 text-balance">
          Google Ads — Order Info Setup
        </h1>
        <p className="mt-3 text-zinc-400 leading-relaxed text-pretty">
          Use this to complete the Google Ads &ldquo;Add order information&rdquo; wizard. Configure
          test values, copy the scan URL and CSS selectors, then verify the conversion with a test
          fire.
        </p>
      </div>

      {/* Status pills */}
      <div className="mb-8 flex flex-wrap gap-3">
        {statusPills.map((pill) => (
          <div
            key={pill.label}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3.5 py-2"
          >
            <span
              className={`h-2 w-2 rounded-full ${pill.ok ? 'bg-lime-400' : 'bg-zinc-600'}`}
              aria-hidden="true"
            />
            <span className="text-xs font-semibold text-zinc-300">{pill.label}</span>
            <span className="font-mono text-[11px] text-zinc-500">{pill.detail}</span>
          </div>
        ))}
      </div>

      {/* Step 1: confirmation URL */}
      <section className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-sm font-black uppercase tracking-wider text-zinc-100 mb-1">
          1 · Order confirmation URL contains
        </h2>
        <p className="text-xs text-zinc-500 mb-4">Paste this into the URL field of the wizard.</p>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-700 bg-zinc-950/60 px-4 py-3">
          <code className="font-mono text-sm text-lime-400">/data/checkout/success</code>
          <CopyButton value="/data/checkout/success" label="confirmation URL" />
        </div>
      </section>

      {/* Step 2: configure test values */}
      <section className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-sm font-black uppercase tracking-wider text-zinc-100 mb-1">
          2 · Configure sample values
        </h2>
        <p className="text-xs text-zinc-500 mb-4">
          These populate the scan URL and the live preview below.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Transaction ID
            </span>
            <input
              value={txn}
              onChange={(e) => setTxn(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 font-mono text-sm text-zinc-100 outline-none focus:border-lime-400/60"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Conversion Value
            </span>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              inputMode="decimal"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 font-mono text-sm text-zinc-100 outline-none focus:border-lime-400/60"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Currency Code
            </span>
            <input
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              maxLength={3}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 font-mono text-sm text-zinc-100 outline-none focus:border-lime-400/60"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Email (optional)
            </span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 font-mono text-sm text-zinc-100 outline-none focus:border-lime-400/60"
            />
          </label>
        </div>

        <div className="mt-5">
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-zinc-500">
            Scan URL — open this in Google&apos;s tool
          </span>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-700 bg-zinc-950/60 px-4 py-3">
            <code className="truncate font-mono text-xs text-zinc-300">{scanUrl}</code>
            <div className="flex shrink-0 items-center gap-2">
              <CopyButton value={scanUrl} label="scan URL" />
              <a
                href={scanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800/60 px-2.5 py-1.5 text-xs font-mono text-zinc-300 transition-colors hover:border-lime-400/50 hover:text-lime-400"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Step 3: field mapping table */}
      <section className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-sm font-black uppercase tracking-wider text-zinc-100 mb-1">
          3 · Website element mapping
        </h2>
        <p className="text-xs text-zinc-500 mb-4">
          Map each Google Ads field to the selector below (or click the value on the confirmation
          page during the scan).
        </p>
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/60">
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                  Field
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                  Value on page
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                  CSS Selector
                </th>
              </tr>
            </thead>
            <tbody>
              {fields.map((row, i) => (
                <tr
                  key={row.selector}
                  className={i < fields.length - 1 ? 'border-b border-zinc-800/60' : ''}
                >
                  <td className="px-4 py-3 font-semibold text-zinc-200">{row.field}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{row.value}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs text-lime-400">{row.selector}</code>
                      <CopyButton value={row.selector} label={`${row.field} selector`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Step 4: test fire */}
      <section className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-sm font-black uppercase tracking-wider text-zinc-100 mb-1">
          4 · Test fire conversion
        </h2>
        <p className="text-xs text-zinc-500 mb-4">
          Fires a real conversion event to Google Ads (no charge). Use Google Tag Assistant to
          confirm it lands.
        </p>
        <button
          type="button"
          onClick={testFire}
          disabled={!gtagReady}
          className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-6 py-3.5 text-sm font-black uppercase tracking-wider text-zinc-950 transition-colors hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Zap className="h-4 w-4" />
          {gtagReady ? 'Fire test conversion' : 'Waiting for gtag…'}
        </button>

        {log.length > 0 && (
          <div className="mt-5 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Event log
            </p>
            <ul className="space-y-1.5">
              {log.map((entry, i) => (
                <li key={i} className="font-mono text-xs text-zinc-400">
                  <span className="text-zinc-600">{entry.time}</span> · {entry.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Live preview — same ids/attrs as the real success page for scanner reference */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-sm font-black uppercase tracking-wider text-zinc-100 mb-1">
          Live preview (same DOM ids as confirmation page)
        </h2>
        <p className="text-xs text-zinc-500 mb-4">
          Mirrors the confirmation page so you can verify selectors resolve to the right values.
        </p>
        <div
          id="order-confirmation-preview"
          className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 text-left"
        >
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-zinc-500">Transaction ID</dt>
              <dd
                data-preview-transaction-id={txn}
                className="max-w-[220px] truncate font-mono text-zinc-200"
              >
                {txn || '—'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-zinc-500">Order Value</dt>
              <dd className="font-mono text-zinc-200">{Number(value || 0).toFixed(2)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-zinc-500">Currency</dt>
              <dd className="font-mono text-zinc-200">{currency || '—'}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-zinc-500">Email</dt>
              <dd className="max-w-[220px] truncate font-mono text-zinc-200">{email || '—'}</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  )
}
