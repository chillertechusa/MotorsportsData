import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getSessionTeamId } from '@/lib/md-auth'
import { RecoveryAnalyticsDashboard } from '@/components/recovery-analytics-dashboard'

export const metadata = {
  title: 'Checkout Recovery Analytics | Motorsports Data',
  description: 'Abandoned checkout recovery email metrics and revenue impact',
}

export default async function RecoveryPage() {
  const auth = await getSessionTeamId()
  if (!auth.ok) redirect('/data/sign-in')

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Checkout Recovery Analytics
          </h1>
          <p className="text-muted-foreground">
            Monitor abandoned checkout recovery email performance and revenue recovery
          </p>
        </div>

        {/* Dashboard */}
        <Suspense
          fallback={<div className="text-muted-foreground">Loading recovery analytics...</div>}
        >
          <RecoveryAnalyticsDashboard />
        </Suspense>
      </div>
    </div>
  )
}
