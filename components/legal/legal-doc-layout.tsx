import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * Shared shell for public legal documents. Renders a consistent header with the
 * document version + effective date and a cross-link bar to the other docs.
 * Bodies are attorney-review DRAFTS — see the owner Legal admin for the
 * "pending legal review" banner and reviewer checklist.
 */
export function LegalDocLayout({
  title,
  version,
  effectiveDate,
  intro,
  children,
}: {
  title: string
  version: string
  effectiveDate: string
  intro?: ReactNode
  children: ReactNode
}) {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-lime-400">
          Motorsport Data
        </p>
        <h1 className="text-balance text-4xl font-black tracking-tight">{title}</h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
          <span className="font-mono">Version {version}</span>
          <span aria-hidden>•</span>
          <span>Effective {effectiveDate}</span>
        </div>

        {version.includes('draft') ? (
          <div className="mt-6 rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm leading-relaxed text-amber-200/90">
            <strong className="font-semibold text-amber-400">Draft — pending legal review.</strong>{' '}
            This document is a working draft and is not yet final or legally binding. It is being
            reviewed by counsel and may change before publication.
          </div>
        ) : null}

        {intro ? (
          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm leading-relaxed text-zinc-400">
            {intro}
          </div>
        ) : null}

        <div className="prose prose-invert mt-8 max-w-none space-y-6 leading-relaxed text-zinc-300">
          {children}
        </div>

        <nav className="mt-14 flex flex-wrap gap-4 border-t border-zinc-800 pt-6 text-sm">
          <span className="text-zinc-500">Related:</span>
          <Link href="/legal/terms" className="text-lime-400 hover:underline">
            Terms of Service
          </Link>
          <Link href="/legal/privacy" className="text-lime-400 hover:underline">
            Privacy Policy
          </Link>
          <Link href="/legal/data-consent" className="text-lime-400 hover:underline">
            Data Sharing &amp; Consent
          </Link>
          <Link href="/legal/cookies" className="text-lime-400 hover:underline">
            Cookie Policy
          </Link>
          <Link href="/legal/ip" className="text-lime-400 hover:underline">
            IP &amp; DMCA
          </Link>
        </nav>

        <p className="mt-6 text-xs text-zinc-600">
          Questions? Contact{' '}
          <a href="mailto:legal@motorsportsdata.io" className="text-zinc-400 hover:text-lime-400">
            legal@motorsportsdata.io
          </a>
        </p>
      </div>
    </main>
  )
}

/** A titled section within a legal document. */
export function LegalSection({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 mt-8 text-xl font-bold text-zinc-100">
        {n}. {title}
      </h2>
      {children}
    </section>
  )
}
