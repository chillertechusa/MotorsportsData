import { requireMdOwner } from '@/lib/md-owner-auth'
import { getSentinelStats, getSentinelEvents } from '@/lib/sentinel'
import { SentinelConsoleClient } from './sentinel-console-client'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Sentinel Squad | Owner Console',
  description: 'Security event monitoring across four lenses: access, consent, IP, and security.',
}

export default async function SentinelPage() {
  await requireMdOwner()
  const [stats, events] = await Promise.all([
    getSentinelStats(),
    getSentinelEvents({ limit: 150 }),
  ])

  return <SentinelConsoleClient initialStats={stats} initialEvents={events} />
}
