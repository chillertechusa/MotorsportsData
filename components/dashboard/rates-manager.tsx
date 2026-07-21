'use client'

import { updateRates } from '@/app/actions/shop'
import type { ShopRates } from '@/lib/pricing'
import { useState, useTransition } from 'react'

const inputClass =
  'w-full bg-[#0d0d0d] border border-white/15 text-white px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors'
const labelClass =
  'block text-white/50 text-[11px] uppercase tracking-widest mb-1.5'

export default function RatesManager({ rates }: { rates: ShopRates }) {
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState(rates)

  function set<K extends keyof ShopRates>(key: K, value: number) {
    setForm((f) => ({ ...f, [key]: value }))
    setSaved(false)
  }

  function handleSave() {
    startTransition(async () => {
      await updateRates(form)
      setSaved(true)
    })
  }

  return (
    <section className="bg-[#161616] border border-white/10 p-5">
      <h2
        className="text-white font-black uppercase text-lg mb-1"
        style={{ fontFamily: 'var(--font-barlow-condensed)' }}
      >
        Shop Rates
      </h2>
      <p className="text-white/40 text-xs mb-5">
        Defaults sourced from a real screen-print invoice. Adjust to match your shop.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className={labelClass}>Screen Setup ($/color)</label>
          <input
            type="number"
            step={0.5}
            className={inputClass}
            value={form.screenSetupFee}
            onChange={(e) => set('screenSetupFee', Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass}>Color Change ($)</label>
          <input
            type="number"
            step={0.5}
            className={inputClass}
            value={form.colorChangeFee}
            onChange={(e) => set('colorChangeFee', Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass}>Size Tag ($/pc)</label>
          <input
            type="number"
            step={0.25}
            className={inputClass}
            value={form.sizeTagFee}
            onChange={(e) => set('sizeTagFee', Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass}>Default Markup (×)</label>
          <input
            type="number"
            step={0.1}
            className={inputClass}
            value={form.defaultMarkup}
            onChange={(e) => set('defaultMarkup', Number(e.target.value))}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 mt-5">
        <button
          onClick={handleSave}
          disabled={pending}
          className="bg-primary text-primary-foreground px-5 py-2.5 font-bold uppercase tracking-wide text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{ fontFamily: 'var(--font-barlow-condensed)' }}
        >
          {pending ? 'Saving…' : 'Save Rates'}
        </button>
        {saved && (
          <span className="text-primary text-xs uppercase tracking-wide">
            Saved
          </span>
        )}
      </div>
    </section>
  )
}
