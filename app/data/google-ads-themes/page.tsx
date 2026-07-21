import { Metadata } from 'next'
import GoogleAdsThemesCopy from '@/components/data/google-ads-themes-copy'

export const metadata: Metadata = {
  title: 'Google Ads Search Themes',
  robots: { index: false, follow: false },
}

export default function GoogleAdsThemesPage() {
  return (
    <main className="min-h-screen bg-zinc-950 p-6 lg:p-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-block rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2 mb-4">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">
              Internal Tool · Noindex
            </p>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white mb-3">
            Google Ads Search Themes
          </h1>
          <p className="text-lg text-zinc-400 text-pretty">
            50 ready-to-use keywords across riders, mechanics, teams, and awareness campaigns.
            Copy individual themes or all 50 at once.
          </p>
        </div>

        {/* Info boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="rounded-lg bg-sky-900/20 border border-sky-700/50 p-4">
            <p className="font-mono text-xs uppercase tracking-widest text-sky-400 mb-1">
              Rider Themes
            </p>
            <p className="text-2xl font-black text-sky-300">15</p>
          </div>
          <div className="rounded-lg bg-amber-900/20 border border-amber-700/50 p-4">
            <p className="font-mono text-xs uppercase tracking-widest text-amber-400 mb-1">
              Mechanic Themes
            </p>
            <p className="text-2xl font-black text-amber-300">12</p>
          </div>
          <div className="rounded-lg bg-emerald-900/20 border border-emerald-700/50 p-4">
            <p className="font-mono text-xs uppercase tracking-widest text-emerald-400 mb-1">
              Team Themes
            </p>
            <p className="text-2xl font-black text-emerald-300">13</p>
          </div>
        </div>

        {/* Copy tool */}
        <GoogleAdsThemesCopy />
      </div>
    </main>
  )
}
