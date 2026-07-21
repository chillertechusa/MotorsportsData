'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Session {
  id: string
  trackName: string
  bestLapSeconds?: number
  trackConditions?: string
  createdAt: string
}

interface SessionsTableProps {
  vehicleId?: string
}

export function SessionsTable({ vehicleId }: SessionsTableProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const url = vehicleId 
          ? `/api/sessions?vehicleId=${vehicleId}` 
          : '/api/sessions'
        
        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to fetch')
        
        const data = await response.json()
        setSessions(data.sessions || [])
      } catch (error) {
        console.error('[v0] Error fetching sessions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [vehicleId])

  if (isLoading) {
    return <div className="p-4 text-zinc-400">Loading sessions...</div>
  }

  if (sessions.length === 0) {
    return (
      <Card className="border-zinc-800 bg-zinc-900">
        <CardContent className="pt-6">
          <p className="text-center text-zinc-400">No sessions logged yet. Create your first session!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-zinc-800">
      <CardHeader>
        <CardTitle className="text-primary">Session History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800">
              <TableHead className="text-primary">Track</TableHead>
              <TableHead className="text-primary">Best Lap</TableHead>
              <TableHead className="text-primary">Conditions</TableHead>
              <TableHead className="text-primary">Date</TableHead>
              <TableHead className="text-primary">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map(session => (
              <TableRow key={session.id} className="border-zinc-800">
                <TableCell className="font-medium">{session.trackName}</TableCell>
                <TableCell>
                  {session.bestLapSeconds 
                    ? `${session.bestLapSeconds.toFixed(2)}s` 
                    : '-'
                  }
                </TableCell>
                <TableCell>
                  {session.trackConditions && (
                    <Badge variant="outline" className="border-primary/50 text-primary">
                      {session.trackConditions}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-zinc-400">
                  {new Date(session.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary hover:bg-primary/10"
                    onClick={() => console.log('[v0] View session:', session.id)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
