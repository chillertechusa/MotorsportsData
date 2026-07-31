'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Copy, CheckCircle2, Activity, UserPlus } from 'lucide-react'

interface Household {
  members: { name: string; role: string; joined: string }[]
  joinCode: string
  lastActivity: { member: string; action: string; timestamp: string }[]
}

export function RiderHouseholdConsole() {
  const [household, setHousehold] = useState<Household | null>(null)
  const [copied, setCopied] = useState(false)
  const [activityVisible, setActivityVisible] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/md-household')
        if (res.ok) {
          setHousehold(await res.json())
        }
      } catch {}
    }
    load()
  }, [])

  if (!household) {
    return <div className="text-zinc-500 text-sm">Loading family roster...</div>
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(household.joinCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Family Members
          </CardTitle>
          <CardDescription>Household roster and roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {household.members.map((m, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-100">{m.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Joined {m.joined}</p>
                </div>
                <Badge variant="secondary" className="shrink-0">{m.role}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invite Code</CardTitle>
          <CardDescription>Share to add family members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="bg-zinc-900 px-3 py-2 rounded font-mono text-sm flex-1 text-zinc-200 border border-zinc-800">
              {household.joinCode}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyCode}
              className="shrink-0"
            >
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {activityVisible && household.lastActivity.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setActivityVisible(false)}
              className="h-6 px-2 text-xs"
            >
              Hide
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {household.lastActivity.map((a, i) => (
                <div key={i} className="text-xs py-1 border-b border-zinc-900 last:border-0">
                  <span className="text-zinc-400">{new Date(a.timestamp).toLocaleTimeString()}</span>
                  <span className="text-zinc-300 mx-2">{a.member}</span>
                  <span className="text-zinc-500">{a.action}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
