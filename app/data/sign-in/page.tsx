import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import MdSignInClient from '@/components/data/md-sign-in-client'

export const dynamic = 'force-dynamic'
import MdLogo from '@/components/md-logo'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In — Motorsport Data',
  robots: { index: false, follow: false },
}

export default async function MdSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; mode?: string }>
}) {
  const { redirect: redirectTo, mode } = await searchParams

  // Already signed in — send straight to the destination or platform
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) {
    redirect(redirectTo ?? '/data')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Top bar */}
      <header className="flex items-center gap-4 h-16 px-5 lg:px-8 border-b border-zinc-800">
        <MdLogo size="sm" showWordmark={true} asLink={true} />
        <span className="text-zinc-700 font-mono text-xs">/</span>
        <span className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-mono">
          {mode === 'sign-up' ? 'Create Account' : 'Sign In'}
        </span>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <MdSignInClient
          redirectTo={redirectTo ?? '/data'}
          initialMode={(mode === 'sign-up' ? 'sign-up' : 'sign-in') as 'sign-in' | 'sign-up'}
        />
      </main>
    </div>
  )
}
