import type { Metadata } from 'next'
import DemoLaunchClient from './demo-launch-client'

export const metadata: Metadata = {
  title: 'Live Demo — Motorsports Data',
  description: 'Step into a real Motorsports Data account. Pre-loaded with riders, sessions, contingency claims, and season budget — no credit card.',
  robots: { index: false, follow: false },
}

export default function DemoPage() {
  return <DemoLaunchClient />
}
