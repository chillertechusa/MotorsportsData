import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import MdLogo from '@/components/md-logo'

export const dynamic = 'force-dynamic'
import MdTwoFactorSetup from '@/components/data/md-two-factor-setup'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Enable 2FA — Motorsport Data',
  robots: { index: false, follow: false },
}

export default async function TwoFactorSetupPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/data/sign-in')

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <header className="flex items-center gap-4 h-16 px-5 lg:px-8 border-b border-zinc-800">
        <MdLogo size="sm" showWordmark={true} asLink={true} />
        <span className="text-zinc-700 font-mono text-xs">/</span>
        <span className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-mono">
          Two-Factor Authentication
        </span>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <MdTwoFactorSetup />
      </main>
    </div>
  )
}
