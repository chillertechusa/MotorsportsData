import type { Metadata } from 'next'
import DemoLaunchClient from './demo-launch-client'

export const metadata: Metadata = {
  title: 'Live Demo — Motorsport Data',
  description: 'Step into a real Motorsport Data coaching account. Pre-loaded with athletes, sessions, training plans, and invoices — no credit card.',
  robots: { index: false, follow: false },
}

export default function DemoPage() {
  return <DemoLaunchClient />
}
