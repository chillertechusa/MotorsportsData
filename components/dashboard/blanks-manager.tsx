'use client'

import { createBlank, deleteBlank } from '@/app/actions/shop'
import { formatCurrency } from '@/lib/pricing'
import { Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'

type Blank = {
  id: number
  styleNumber: string
  brand: string
  name: string
  category: string
  wholesaleCost: number
  colors: string | null
}

const inputClass =
  'w-full bg-[#0d0d0d] border border-white/15 text-white px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors'
const labelClass =
  'block text-white/50 text-[11px] uppercase tracking-widest mb-1.5'

const CATEGORIES = ['shirts', 'hoodies', 'hats', 'jerseys', 'other']

export default function BlanksManager({ blanks }: { blanks: Blank[] }) {
  const [pending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    styleNumber: '',
    brand: '',
    name: '',
    category: 'shirts',
    wholesaleCost: 0,
    colors: '',
  })

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.styleNumber || !form.brand || !form.name) return
    startTransition(async () => {
      await createBlank({
        styleNumber: form.styleNumber.trim(),
        brand: form.brand.trim(),
        name: form.name.trim(),
        category: form.category,
        wholesaleCost: form.wholesaleCost,
        colors: form.colors.trim() || undefined,
      })
      setForm({
        styleNumber: '',
        brand: '',
        name: '',
        category: 'shirts',
        wholesaleCost: 0,
        colors: '',
      })
      setShowForm(false)
    })
  }

  function handleDelete(id: number) {
    startTransition(() => deleteBlank(id))
  }

  return (
    <section className="bg-[#161616] border border-white/10 p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2
            className="text-white font-black uppercase text-lg"
            style={{ fontFamily: 'var(--font-barlow-condensed)' }}
          >
            Blanks Catalog
          </h2>
          <p className="text-white/40 text-xs mt-1">
            Wholesale garment costs feed the quote calculator.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-primary text-xs uppercase tracking-wide font-bold hover:underline"
          style={{ fontFamily: 'var(--font-barlow-condensed)' }}
        >
          {showForm ? 'Cancel' : '+ Add Blank'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 pb-6 border-b border-white/10"
        >
          <div>
            <label className={labelClass}>Style #</label>
            <input
              className={inputClass}
              value={form.styleNumber}
              onChange={(e) => setForm({ ...form, styleNumber: e.target.value })}
              placeholder="DM130"
            />
          </div>
          <div>
            <label className={labelClass}>Brand</label>
            <input
              className={inputClass}
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              placeholder="District"
            />
          </div>
          <div>
            <label className={labelClass}>Name</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Perfect Tri Tee"
            />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select
              className={inputClass}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-[#0d0d0d] capitalize">
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Wholesale Cost ($)</label>
            <input
              type="number"
              step={0.01}
              className={inputClass}
              value={form.wholesaleCost}
              onChange={(e) =>
                setForm({ ...form, wholesaleCost: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Colors (optional)</label>
            <input
              className={inputClass}
              value={form.colors}
              onChange={(e) => setForm({ ...form, colors: e.target.value })}
              placeholder="Black,White,Navy"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              disabled={pending}
              className="bg-primary text-primary-foreground px-5 py-2.5 font-bold uppercase tracking-wide text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              {pending ? 'Adding…' : 'Add Blank'}
            </button>
          </div>
        </form>
      )}

      {blanks.length === 0 ? (
        <p className="text-white/40 text-sm py-6 text-center">
          No blanks yet. Add your first garment to start quoting.
        </p>
      ) : (
        <div className="divide-y divide-white/5">
          {blanks.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {b.brand} {b.name}
                </p>
                <p className="text-white/40 text-xs">
                  {b.styleNumber} · <span className="capitalize">{b.category}</span>
                  {b.colors ? ` · ${b.colors}` : ''}
                </p>
              </div>
              <span
                className="text-white font-bold text-sm w-20 text-right"
                style={{ fontFamily: 'var(--font-barlow-condensed)' }}
              >
                {formatCurrency(b.wholesaleCost)}
              </span>
              <button
                onClick={() => handleDelete(b.id)}
                disabled={pending}
                className="text-white/30 hover:text-red-400 transition-colors disabled:opacity-50"
                aria-label="Delete blank"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
