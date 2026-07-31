'use client'

import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { FaqCategory } from './faq-data'

export default function FaqClient({ categories }: { categories: FaqCategory[] }) {
  const [search, setSearch] = useState('')
  const [openKey, setOpenKey] = useState<string | null>(null)

  const query = search.trim().toLowerCase()
  const filtered = query
    ? categories
        .map((cat) => ({
          ...cat,
          items: cat.items.filter(
            (item) =>
              item.q.toLowerCase().includes(query) || item.a.toLowerCase().includes(query),
          ),
        }))
        .filter((cat) => cat.items.length > 0)
    : categories

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:px-10">
      <div className="mb-12">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-lime">
          Support
        </span>
        <h1 className="mt-5 font-sans text-[clamp(2.25rem,6vw,4rem)] font-black uppercase leading-[0.92] tracking-tight text-white text-balance">
          Frequently asked questions
        </h1>
        <p className="mt-5 text-base leading-relaxed text-zinc-400">
          Contingency, sponsor money, team roles, and the AI Doctor &mdash; answered.
        </p>

        <div className="relative mt-8">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
          />
          <Input
            type="search"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search frequently asked questions"
            className="border-zinc-700 bg-zinc-900 pl-10 text-zinc-100"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p role="status" className="text-sm text-zinc-400">
          No questions match &ldquo;{search}&rdquo;. Try a different term or email{' '}
          <a
            href="mailto:support@motorsportsdata.io"
            className="text-lime underline hover:text-lime-bright"
          >
            support@motorsportsdata.io
          </a>
          .
        </p>
      ) : (
        <div className="space-y-10">
          {filtered.map((category) => (
            <section key={category.category}>
              <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.25em] text-lime">
                {category.category}
              </h2>
              <dl className="divide-y divide-zinc-800 border-y border-zinc-800">
                {category.items.map((item) => {
                  const key = `${category.category}-${item.q}`
                  const open = openKey === key
                  return (
                    <div key={key}>
                      <dt>
                        <button
                          type="button"
                          onClick={() => setOpenKey(open ? null : key)}
                          aria-expanded={open}
                          aria-controls={`answer-${key}`}
                          className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-lime"
                        >
                          <span className="text-sm font-bold text-zinc-100 sm:text-base">
                            {item.q}
                          </span>
                          <ChevronDown
                            aria-hidden="true"
                            className={`h-5 w-5 shrink-0 text-lime transition-transform ${
                              open ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      </dt>
                      {/*
                        The answer stays in the DOM and is toggled with the
                        `hidden` attribute rather than being conditionally
                        rendered. Previously it was unmounted when collapsed,
                        so crawlers only ever received the questions and none
                        of the answer text.
                      */}
                      <dd id={`answer-${key}`} hidden={!open}>
                        <p className="pb-5 text-sm leading-relaxed text-zinc-400">{item.a}</p>
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </section>
          ))}
        </div>
      )}

      <div className="mt-14 border-t border-zinc-800 pt-8">
        <p className="text-sm text-zinc-400">
          Still stuck?{' '}
          <a href="/help" className="text-lime underline hover:text-lime-bright">
            Visit the Help Center
          </a>{' '}
          or email{' '}
          <a
            href="mailto:support@motorsportsdata.io"
            className="text-lime underline hover:text-lime-bright"
          >
            support@motorsportsdata.io
          </a>
          .
        </p>
      </div>
    </div>
  )
}
