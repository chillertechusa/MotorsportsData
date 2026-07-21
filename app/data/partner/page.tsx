import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSessionTeamId } from '@/lib/md-auth'
import { PartnerDashboard } from '@/components/partner/partner-dashboard'

export const metadata: Metadata = {
  title: 'Partner Dashboard | MD',
  description: 'Monitor API usage, webhooks, and integration performance',
}

export default async function PartnerPage() {
  const auth = await getSessionTeamId()
  if (!auth.ok) {
    redirect('/login')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Partner Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor your API usage, webhook deliveries, and integration health
        </p>
      </div>

      <PartnerDashboard />
    </div>
  )
}
