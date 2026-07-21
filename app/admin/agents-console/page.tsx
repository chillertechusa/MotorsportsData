import { AgentsConsole } from '@/components/admin/agents-console'

export const metadata = {
  title: 'Agents Console | Admin',
  description: 'Monitor 24+ platform agents across 5 groups',
}

export default function AgentsConsolePage() {
  return (
    <div className="min-h-screen bg-zinc-950 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <AgentsConsole />
      </div>
    </div>
  )
}
