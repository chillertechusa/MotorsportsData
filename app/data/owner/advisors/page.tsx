import { requireMdOwner } from '@/lib/md-owner-auth'
import { getLatestAdvisorReports } from '@/lib/advisors'
import { AdvisorsConsoleClient } from './advisors-console-client'

export const dynamic = 'force-dynamic'

export default async function AdvisorsPage() {
  await requireMdOwner()
  const latest = await getLatestAdvisorReports()
  return <AdvisorsConsoleClient initialLatest={latest} />
}
