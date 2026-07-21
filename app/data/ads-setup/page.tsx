import type { Metadata } from 'next'
import AdsSetupTool from '@/components/data/ads-setup-tool'

export const metadata: Metadata = {
  title: 'Google Ads Order Info Setup — Motorsport Data',
  robots: { index: false, follow: false },
}

export default function AdsSetupPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <AdsSetupTool />
    </div>
  )
}
