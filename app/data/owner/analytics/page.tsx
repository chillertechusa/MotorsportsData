import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getSessionTeamId } from '@/lib/md-auth'
import { AnalyticsDashboard } from '@/components/analytics-dashboard'

export const metadata = {
  title: 'Revenue Analytics | Motorsports Data',
  description: 'Conversion funnel, revenue metrics, and pricing analytics',
}

export default async function AnalyticsPage() {
  const auth = await getSessionTeamId()
  if (!auth.ok) redirect('/data/sign-in')

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Revenue Analytics</h1>
          <p className="text-muted-foreground">Conversion funnel, MRR/ARR, and pricing optimization</p>
        </div>

        {/* Dashboard */}
        <Suspense fallback={<div className="text-muted-foreground">Loading analytics...</div>}>
          <AnalyticsDashboard />
        </Suspense>
      </div>
    </div>
  )
}
