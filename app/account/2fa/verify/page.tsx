import MdLogo from '@/components/md-logo'
import MdTwoFactorVerify from '@/components/data/md-two-factor-verify'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verify Identity — Motorsport Data',
  robots: { index: false, follow: false },
}

export default async function TwoFactorVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackURL?: string }>
}) {
  const { callbackURL } = await searchParams

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <header className="flex items-center gap-4 h-16 px-5 lg:px-8 border-b border-zinc-800">
        <MdLogo size="sm" showWordmark={true} asLink={true} />
        <span className="text-zinc-700 font-mono text-xs">/</span>
        <span className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-mono">
          Verify Identity
        </span>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <MdTwoFactorVerify callbackURL={callbackURL ?? '/data'} />
      </main>
    </div>
  )
}
