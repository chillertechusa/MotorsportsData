'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, ArrowRight, ShieldCheck } from 'lucide-react'
import { createAgentAccount } from '@/app/actions/agent-portal'

export function AgentOnboarding({
  contactName,
  contactEmail,
}: {
  contactName: string
  contactEmail: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    orgName: '',
    contactName: contactName,
    contactEmail: contactEmail,
    contactPhone: '',
    website: '',
    bio: '',
  })

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await createAgentAccount(form)
      if (res.ok) {
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400/10 ring-1 ring-lime-400/30">
            <Briefcase className="h-5 w-5 text-lime-400" />
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">Agent Portal</p>
            <h1 className="text-2xl font-black tracking-tight text-balance">Create your agency account</h1>
          </div>
        </div>

        <p className="mb-8 leading-relaxed text-zinc-400">
          Set up your agency profile to build a rider roster, review performance profiles, and export
          sponsor-ready pitch reports. Riders grant you access to their data&mdash;you&apos;ll see nothing until
          they approve and your subscription is active.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Agency name" required>
            <input
              required
              value={form.orgName}
              onChange={(e) => update('orgName', e.target.value)}
              className={inputCls}
              placeholder="Apex Rider Management"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Contact name" required>
              <input
                required
                value={form.contactName}
                onChange={(e) => update('contactName', e.target.value)}
                className={inputCls}
                placeholder="Jordan Vance"
              />
            </Field>
            <Field label="Contact email" required>
              <input
                required
                type="email"
                value={form.contactEmail}
                onChange={(e) => update('contactEmail', e.target.value)}
                className={inputCls}
                placeholder="you@agency.com"
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Phone">
              <input
                value={form.contactPhone}
                onChange={(e) => update('contactPhone', e.target.value)}
                className={inputCls}
                placeholder="(555) 123-4567"
              />
            </Field>
            <Field label="Website">
              <input
                value={form.website}
                onChange={(e) => update('website', e.target.value)}
                className={inputCls}
                placeholder="apexriders.com"
              />
            </Field>
          </div>

          <Field label="About your agency">
            <textarea
              value={form.bio}
              onChange={(e) => update('bio', e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Who you represent, disciplines, and what you're looking for."
            />
          </Field>

          {error && (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lime-400 px-6 py-3 font-black uppercase tracking-widest text-zinc-950 transition-colors hover:bg-lime-300 disabled:opacity-60"
          >
            {isPending ? 'Creating…' : 'Create agent account'}
            {!isPending && <ArrowRight className="h-4 w-4" />}
          </button>

          <p className="flex items-center justify-center gap-2 text-xs text-zinc-500">
            <ShieldCheck className="h-3.5 w-3.5" />
            Consent-based access. Rider data stays locked until they approve you.
          </p>
        </form>
      </div>
    </main>
  )
}

const inputCls =
  'w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-lime-400/60 focus:ring-1 focus:ring-lime-400/40'

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1.5">
      <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
        {label}
        {required && <span className="text-lime-400"> *</span>}
      </span>
      {children}
    </label>
  )
}
