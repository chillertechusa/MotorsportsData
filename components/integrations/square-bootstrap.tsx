'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, RefreshCw, CreditCard, Zap } from 'lucide-react'
import { bootstrapCatalogAction } from '@/app/actions/square-bootstrap'

type CatalogResult = {
  ok: boolean
  created?: string[]
  skipped?: string[]
  error?: string
  reset?: boolean
}

export function SquareBootstrap() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<CatalogResult | null>(null)
  const [healthOk, setHealthOk] = useState<boolean | null>(null)
  const [healthChecking, setHealthChecking] = useState(false)

  async function checkHealth() {
    setHealthChecking(true)
    try {
      const res = await fetch('/api/health/square')
      const data = await res.json()
      setHealthOk(data.status === 'ok')
    } catch {
      setHealthOk(false)
    } finally {
      setHealthChecking(false)
    }
  }

  async function runBootstrap(reset = false) {
    setStatus('loading')
    setResult(null)
    try {
      const data = await bootstrapCatalogAction(reset)
      setStatus(data.ok ? 'success' : 'error')
      setResult(data)
    } catch (err) {
      setStatus('error')
      setResult({ ok: false, error: err instanceof Error ? err.message : 'Network error' })
    }
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-lime-400" />
            <CardTitle className="text-base font-semibold text-zinc-100">
              Square Billing Catalog
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {healthOk === true && (
              <Badge variant="outline" className="border-lime-500/40 text-lime-400 text-xs">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Connected
              </Badge>
            )}
            {healthOk === false && (
              <Badge variant="outline" className="border-red-500/40 text-red-400 text-xs">
                <AlertCircle className="mr-1 h-3 w-3" /> Not configured
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="text-zinc-500 text-sm">
          Pre-create Square subscription plans for all paid tiers so the first checkout
          does not pay the bootstrap cost. Safe to re-run — already-created plans are skipped.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Health check row */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={checkHealth}
            disabled={healthChecking}
            className="border-zinc-700 text-zinc-300 hover:text-zinc-100 text-xs"
          >
            {healthChecking ? (
              <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Zap className="mr-1.5 h-3.5 w-3.5" />
            )}
            Test Connection
          </Button>
          <span className="text-xs text-zinc-500">Verify Square credentials are active</span>
        </div>

        {/* Bootstrap actions */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => runBootstrap(false)}
            disabled={status === 'loading'}
            className="bg-lime-500 hover:bg-lime-400 text-zinc-900 font-semibold text-xs"
          >
            {status === 'loading' ? (
              <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            )}
            Bootstrap Catalog
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => runBootstrap(true)}
            disabled={status === 'loading'}
            className="border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs"
          >
            Force Reset + Rebuild
          </Button>
        </div>

        {/* Result output */}
        {result && (
          <div
            className={`rounded-md border px-4 py-3 text-xs font-mono space-y-1 ${
              result.ok
                ? 'border-lime-500/30 bg-lime-950/30 text-lime-300'
                : 'border-red-500/30 bg-red-950/30 text-red-300'
            }`}
          >
            {result.ok ? (
              <>
                <p className="font-semibold text-lime-400">Catalog bootstrap successful</p>
                {result.created && result.created.length > 0 && (
                  <p>Created plans: {result.created.join(', ')}</p>
                )}
                {result.skipped && result.skipped.length > 0 && (
                  <p>Skipped (already existed): {result.skipped.join(', ')}</p>
                )}
                {result.reset && <p>Reset mode: old local cache was cleared first</p>}
              </>
            ) : (
              <>
                <p className="font-semibold text-red-400">Bootstrap failed</p>
                <p>{result.error}</p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
