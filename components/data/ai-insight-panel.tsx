'use client'

import { useState, useCallback } from 'react'
import { Sparkles, Loader2, RefreshCw, X } from 'lucide-react'

interface AiInsightPanelProps {
  section: 'fitness' | 'mental'
  data: Record<string, unknown>
  /** If true, auto-fetches immediately on mount. Default false — caller triggers. */
  autoFetch?: boolean
  onDismiss?: () => void
}

export default function AiInsightPanel({ section, data, autoFetch = false, onDismiss }: AiInsightPanelProps) {
  const [insight, setInsight] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const fetch_ = useCallback(async () => {
    if (loading) return
    setLoading(true)
    setInsight('')
    try {
      const res = await fetch('/api/md-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, data }),
      })
      if (!res.body) throw new Error('no stream')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setInsight(acc)
      }
      setFetched(true)
    } catch {
      setInsight('Could not generate insight — check your connection and try again.')
      setFetched(true)
    } finally {
      setLoading(false)
    }
  }, [section, data, loading])

  // Auto-fetch on first render if requested
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useState(() => { if (autoFetch) fetch_() })

  if (dismissed) return null

  function dismiss() {
    setDismissed(true)
    onDismiss?.()
  }

  return (
    <div className="rounded-2xl border border-lime-400/20 bg-zinc-950 p-4">
      <div className="flex items-center gap-2 mb-2.5">
        <Sparkles className="h-3.5 w-3.5 text-lime-400 shrink-0" />
        <span className="text-xs font-bold uppercase tracking-widest text-lime-400">AI Insight</span>
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-500 ml-auto" />}
        {fetched && !loading && (
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={fetch_}
              className="p-1 text-zinc-600 hover:text-zinc-400 transition-colors rounded"
              aria-label="Refresh insight"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={dismiss}
              className="p-1 text-zinc-600 hover:text-zinc-400 transition-colors rounded"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {insight ? (
        <p className="text-sm text-zinc-200 leading-relaxed">{insight}</p>
      ) : loading ? (
        <div className="space-y-2">
          {[100, 80, 55].map(w => (
            <div key={w} className="h-2.5 rounded-full bg-zinc-800 animate-pulse" style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : (
        <button
          onClick={fetch_}
          className="text-sm text-zinc-400 hover:text-lime-400 transition-colors underline underline-offset-2"
        >
          Analyze this entry
        </button>
      )}
    </div>
  )
}
