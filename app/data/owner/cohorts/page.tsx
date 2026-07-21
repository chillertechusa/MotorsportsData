import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSessionTeamId } from '@/lib/md-auth'
import { CohortDashboard } from '@/components/analytics/cohort-dashboard'

export const metadata: Metadata = {
  title: 'Cohort Analysis | MD Owner',
  description: 'Retention curves, LTV by tier, at-risk team identification',
}

export default async function CohortsPage() {
  const auth = await getSessionTeamId()
  if (!auth.ok) {
    redirect('/login')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cohort Analysis</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Retention curves, LTV by tier, and at-risk team identification
        </p>
      </div>

      <CohortDashboard />
    </div>
  )
}
