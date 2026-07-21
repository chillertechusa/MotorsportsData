import { TestAgentsDashboardClient } from './test-agents-client'
import { requireMdOwner } from '@/lib/md-owner-auth'

export const metadata = {
  title: 'Test Agents — Platform Monitoring',
  description: 'Run and monitor platform health checks and test agents.',
}

export default async function TestAgentsPage() {
  await requireMdOwner()
  return <TestAgentsDashboardClient />
}
