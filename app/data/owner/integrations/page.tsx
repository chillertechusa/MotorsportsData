import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSessionTeamId } from '@/lib/md-auth'
import { IntegrationsManager } from '@/components/integrations/integrations-manager'

export const metadata: Metadata = {
  title: 'API Keys & Integrations | MD Owner',
  description: 'Manage API keys, webhooks, and third-party integrations',
}

export default async function IntegrationsPage() {
  const auth = await getSessionTeamId()
  if (!auth.ok) {
    redirect('/login')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">API Keys & Integrations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage API keys for third-party integrations, webhooks, and partner access
        </p>
      </div>

      <IntegrationsManager />
    </div>
  )
}
