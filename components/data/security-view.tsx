'use client'

import { Shield, Lock, Database, Eye, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react'
import MdLogo from '@/components/md-logo'

const FAILSAFES = [
  {
    icon: Database,
    number: '01',
    title: 'Firewall-Level Team Isolation',
    threat: 'Your competitor hacks the platform — they read your ECU maps.',
    solution:
      'Every query is scoped to your team ID at the database row level. No cross-team query can execute — not through the API, not through the AI, not through any endpoint. A rival team\'s account literally cannot reach your rows.',
    detail: 'Implemented via md_team_members row-level scoping on every Neon query across all API routes.',
  },
  {
    icon: Lock,
    number: '02',
    title: 'Firewalled AI Data Silos',
    threat: 'The AI assistant leaks your setup data to another team\'s query.',
    solution:
      'MD Intel performs RAG retrieval scoped exclusively to your team\'s session history before it reaches the model. The AI is injected only with your data. Prompt injection attempts are sanitized server-side before the model ever sees them.',
    detail: 'Factory Rig tier gets a dedicated Opus-powered AI silo — your data never enters a shared context.',
  },
  {
    icon: Eye,
    number: '03',
    title: 'Zero Raw Exposure',
    threat: 'A leaked API response exposes your full setup history as JSON.',
    solution:
      'API routes return only the fields the UI needs — no raw session dumps, no full table exports through client-facing endpoints. The AI is instructed never to reveal its raw JSON context. File uploads are validated for type and size before reaching the model.',
    detail: 'All uploads capped at 10 MB, JPEG/PNG/WebP/HEIC only. Auth checked on every write route.',
  },
]

export default function SecurityView() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100" style={{ colorScheme: 'dark' }}>
      {/* Nav */}
      <header className="border-b border-zinc-900 px-6 py-3 flex items-center justify-between">
        <MdLogo size="sm" showWordmark={true} asLink={true} />
        <a
          href="/data/pricing"
          className="text-sm font-semibold text-lime-400 hover:text-lime-300 transition-colors"
        >
          View Plans
        </a>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 space-y-20">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-4 py-1.5 text-sm font-semibold text-lime-300">
            <Shield className="h-4 w-4" />
            Enterprise-Grade Security
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-zinc-50 text-balance">
            The Zero-Leak Guarantee
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto text-balance">
            Your suspension settings, ECU maps, and race intelligence are your competitive advantage.
            Here&apos;s exactly how we protect them.
          </p>
        </div>

        {/* Threat intro */}
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 px-8 py-6 flex gap-5">
          <AlertTriangle className="h-7 w-7 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-300 text-lg mb-1">The Real Risk in Motorsport Data</p>
            <p className="text-zinc-400 leading-relaxed">
              Multi-tenant SaaS platforms are a honeypot. Without database-level isolation, a single
              misconfigured query can expose every team&apos;s setup data to every other team. We built
              the three fail-safes below specifically to make that impossible.
            </p>
          </div>
        </div>

        {/* Three Fail-Safes */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-wide text-zinc-50">
            Three Fail-Safes
          </h2>
          {FAILSAFES.map((fs) => (
            <div key={fs.number} className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
              <div className="flex items-center gap-4 px-6 py-5 border-b border-zinc-800">
                <span className="text-4xl font-black text-zinc-700 leading-none">{fs.number}</span>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-400/10 border border-lime-400/20">
                  <fs.icon className="h-6 w-6 text-lime-400" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-wide text-zinc-50">{fs.title}</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
                <div className="px-6 py-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2">The Threat</p>
                  <p className="text-zinc-300 italic">&ldquo;{fs.threat}&rdquo;</p>
                </div>
                <div className="px-6 py-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-lime-400 mb-2">The Fix</p>
                  <p className="text-zinc-300">{fs.solution}</p>
                  <p className="mt-3 text-xs text-zinc-600 font-mono">{fs.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust checklist */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-8 py-8 space-y-4">
          <h2 className="text-xl font-black uppercase tracking-wide text-zinc-50 mb-6">What You Can Count On</h2>
          {[
            'Every API read/write scoped to your team — no wildcard queries',
            'AI retrieval firewalled to your data before model inference',
            'Prompt injection sanitized server-side on every MD Intel request',
            'File uploads validated for type (image only) and size (10 MB max)',
            'Paywall enforced server-side — unauthenticated users cannot reach your data',
            'Powered by Neon Postgres with row-level isolation, not a shared NoSQL store',
            'Backed and monitored by Chiller Tech Support LLC — 24/7 trackside coverage on Factory Rig',
          ].map((item) => (
            <div key={item} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-lime-400 shrink-0 mt-0.5" />
              <p className="text-zinc-300">{item}</p>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="text-center space-y-4 pb-8">
          <p className="text-zinc-500 text-sm">
            Enterprise-grade security provided by{' '}
            <span className="text-zinc-300 font-semibold">Chiller Tech Support LLC</span>
          </p>
          <a
            href="/data/pricing"
            className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-8 py-4 text-base font-black uppercase tracking-wide text-zinc-950 hover:bg-lime-300 transition-colors"
          >
            Get Protected <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </main>
    </div>
  )
}
