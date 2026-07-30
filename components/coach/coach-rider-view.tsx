'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Lock, Calendar, Users } from 'lucide-react'

interface RiderProfile {
  id: string
  riderName: string
  bikeNumber: string
  ageBracket: string
  dateOfBirth: string
}

interface Race {
  id: string
  raceName: string
  raceDate: string
  location: string
}

export function CoachRiderView({
  riderEmail,
  riderName,
}: {
  riderEmail: string
  riderName: string
}) {
  const [profiles, setProfiles] = useState<RiderProfile[]>([])
  const [races, setRaces] = useState<Race[]>([])
  const [loading, setLoading] = useState(true)
  const [exportBlocked, setExportBlocked] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, raceRes] = await Promise.all([
          fetch(`/api/coach/rider-profiles?rider=${riderEmail}`),
          fetch(`/api/coach/rider-races?rider=${riderEmail}`),
        ])

        if (profileRes.ok) setProfiles(await profileRes.json())
        if (raceRes.ok) setRaces(await raceRes.json())
      } catch (error) {
        console.error('[coach-rider-view] Load failed:', error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [riderEmail])

  const handleExportAttempt = async () => {
    try {
      const res = await fetch('/api/coach/export-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riderEmail, reason: 'User clicked export' }),
      })
      const data = await res.json()
      if (data.blocked) {
        setExportBlocked(true)
        setTimeout(() => setExportBlocked(false), 3000)
      }
    } catch (error) {
      console.error('[coach-rider-view] Export attempt failed:', error)
    }
  }

  if (loading) {
    return <div className="text-zinc-500 text-sm">Loading rider data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Read-Only Alert */}
      <Card className="bg-amber-950 border-amber-900">
        <CardContent className="pt-6 flex items-center gap-2">
          <Lock className="h-4 w-4 text-amber-500" />
          <span className="text-sm text-amber-200">
            Read-only access. You can view {riderName}&apos;s data but cannot export or modify it.
          </span>
        </CardContent>
      </Card>

      {/* Profiles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Rider Profiles
          </CardTitle>
          <CardDescription>Bike numbers and age categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {profiles.map((p) => (
              <div key={p.id} className="border border-zinc-800 rounded p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-zinc-100">{p.riderName}</p>
                  <p className="text-xs text-zinc-500">#{p.bikeNumber}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {p.ageBracket}
                </Badge>
              </div>
            ))}
            {profiles.length === 0 && (
              <p className="text-sm text-zinc-500">No profile data available.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Races */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Races
          </CardTitle>
          <CardDescription>Race history and results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {races.map((r) => (
              <div key={r.id} className="border-b border-zinc-800 pb-2 last:border-0">
                <p className="font-medium text-sm text-zinc-100">{r.raceName}</p>
                <p className="text-xs text-zinc-500">
                  {new Date(r.raceDate).toLocaleDateString()} • {r.location}
                </p>
              </div>
            ))}
            {races.length === 0 && (
              <p className="text-sm text-zinc-500">No race data available.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Export Block */}
      {exportBlocked && (
        <Card className="bg-red-950 border-red-900">
          <CardContent className="pt-6">
            <p className="text-sm text-red-200">
              Export is not permitted for read-only coach access. Contact the rider or team for data export requests.
            </p>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleExportAttempt}
        variant="outline"
        className="w-full"
        disabled={exportBlocked}
      >
        <Download className="h-4 w-4 mr-2" />
        Export Data
      </Button>
    </div>
  )
}
