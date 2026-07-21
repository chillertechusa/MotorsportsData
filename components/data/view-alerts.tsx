'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Bell,
  BellOff,
  HeartPulse,
  TrendingDown,
  TrendingUp,
  ClipboardList,
  Timer,
  Zap,
  Check,
  AlertTriangle,
  RefreshCw,
  Settings,
  ChevronRight,
} from 'lucide-react'
import { usePushNotifications } from '@/lib/hooks/use-push-notifications'

// ── Types ─────────────────────────────────────────────────────────────────────

type AlertType =
  | 'hr_spike'
  | 'hr_drop'
  | 'hr_sustained_high'
  | 'readiness_drop'
  | 'readiness_peaked'
  | 'assignment_missed'
  | 'lap_record'

interface AlertRule {
  id: string
  alertType: AlertType
  enabled: boolean
  thresholdValue: number | null
  thresholdDirection: string | null
  cooldownSeconds: number
  lastFiredAt: string | null
}

interface AlertEvent {
  id: string
  alertType: AlertType
  context: Record<string, unknown>
  pushSent: number
  firedAt: string
}

// ── Alert metadata ─────────────────────────────────────────────────────────────

const ALERT_META: Record<
  AlertType,
  {
    label: string
    description: string
    icon: React.ElementType
    color: string
    unit: string
    defaultThreshold: number
    min: number
    max: number
    step: number
    hasThreshold: boolean
  }
> = {
  hr_spike: {
    label: 'HR Spike',
    description: 'Fires when a rider\'s heart rate exceeds the threshold BPM',
    icon: Zap,
    color: 'text-red-400',
    unit: 'BPM',
    defaultThreshold: 185,
    min: 150,
    max: 220,
    step: 5,
    hasThreshold: true,
  },
  hr_drop: {
    label: 'HR Drop',
    description: 'Fires when a rider\'s heart rate falls below the threshold BPM',
    icon: TrendingDown,
    color: 'text-blue-400',
    unit: 'BPM',
    defaultThreshold: 50,
    min: 35,
    max: 80,
    step: 5,
    hasThreshold: true,
  },
  hr_sustained_high: {
    label: 'Sustained High HR',
    description: 'Fires when a rider stays above the threshold BPM for an extended period',
    icon: HeartPulse,
    color: 'text-orange-400',
    unit: 'BPM',
    defaultThreshold: 175,
    min: 150,
    max: 210,
    step: 5,
    hasThreshold: true,
  },
  readiness_peaked: {
    label: 'Readiness Peaked',
    description: 'Fires when a rider\'s readiness score reaches the threshold — race-day ready',
    icon: TrendingUp,
    color: 'text-lime-400',
    unit: 'score',
    defaultThreshold: 88,
    min: 70,
    max: 100,
    step: 1,
    hasThreshold: true,
  },
  readiness_drop: {
    label: 'Readiness Drop',
    description: 'Fires when a rider\'s readiness score falls below the threshold',
    icon: TrendingDown,
    color: 'text-yellow-400',
    unit: 'score',
    defaultThreshold: 65,
    min: 30,
    max: 80,
    step: 1,
    hasThreshold: true,
  },
  assignment_missed: {
    label: 'Assignment Missed',
    description: 'Fires when a rider fails to acknowledge or complete a scheduled assignment',
    icon: ClipboardList,
    color: 'text-zinc-400',
    unit: '',
    defaultThreshold: 0,
    min: 0,
    max: 0,
    step: 1,
    hasThreshold: false,
  },
  lap_record: {
    label: 'Lap Record',
    description: 'Fires when a rider sets a new personal best lap time',
    icon: Timer,
    color: 'text-lime-400',
    unit: '',
    defaultThreshold: 0,
    min: 0,
    max: 0,
    step: 1,
    hasThreshold: false,
  },
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ── Rule card ──────────────────────────────────────────────────────────────────

function RuleCard({
  rule,
  onToggle,
  onThresholdChange,
}: {
  rule: AlertRule
  onToggle: (alertType: AlertType, enabled: boolean) => void
  onThresholdChange: (alertType: AlertType, value: number) => void
}) {
  const meta = ALERT_META[rule.alertType]
  const Icon = meta.icon
  const [editing, setEditing] = useState(false)
  const [localThreshold, setLocalThreshold] = useState(rule.thresholdValue ?? meta.defaultThreshold)

  const handleSaveThreshold = () => {
    onThresholdChange(rule.alertType, localThreshold)
    setEditing(false)
  }

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        rule.enabled
          ? 'border-zinc-700 bg-zinc-900/60'
          : 'border-zinc-800 bg-zinc-900/30 opacity-60'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${meta.color}`}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-zinc-100 text-sm">{meta.label}</span>

            {/* Toggle */}
            <button
              onClick={() => onToggle(rule.alertType, !rule.enabled)}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors focus:outline-none ${
                rule.enabled ? 'bg-lime-500' : 'bg-zinc-700'
              }`}
              aria-label={rule.enabled ? 'Disable alert' : 'Enable alert'}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-0.5 ${
                  rule.enabled ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{meta.description}</p>

          {/* Threshold control */}
          {meta.hasThreshold && rule.enabled && (
            <div className="mt-3">
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={meta.min}
                    max={meta.max}
                    step={meta.step}
                    value={localThreshold}
                    onChange={(e) => setLocalThreshold(Number(e.target.value))}
                    className="flex-1 accent-lime-400 h-1.5"
                  />
                  <span className="text-xs font-mono text-lime-400 w-16 text-right">
                    {localThreshold} {meta.unit}
                  </span>
                  <button
                    onClick={handleSaveThreshold}
                    className="flex items-center gap-1 px-2 py-1 bg-lime-400 text-zinc-950 text-xs font-black rounded"
                  >
                    <Check className="h-3 w-3" />
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setLocalThreshold(rule.thresholdValue ?? meta.defaultThreshold); setEditing(true) }}
                  className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors group"
                >
                  <span className="font-mono text-zinc-300">
                    {rule.thresholdDirection === 'below' ? 'Below ' : 'Above '}
                    <span className="text-lime-400 font-bold">
                      {rule.thresholdValue ?? meta.defaultThreshold} {meta.unit}
                    </span>
                  </span>
                  <Settings className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>
          )}

          {/* Cooldown + last fired */}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-zinc-600">
              Cooldown: {rule.cooldownSeconds >= 3600
                ? `${Math.floor(rule.cooldownSeconds / 3600)}h`
                : rule.cooldownSeconds >= 60
                ? `${Math.floor(rule.cooldownSeconds / 60)}m`
                : `${rule.cooldownSeconds}s`}
            </span>
            {rule.lastFiredAt && (
              <span className="text-xs text-zinc-600">
                Last fired: {timeAgo(rule.lastFiredAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Event feed item ────────────────────────────────────────────────────────────

function EventItem({ event }: { event: AlertEvent }) {
  const meta = ALERT_META[event.alertType]
  const Icon = meta?.icon ?? Bell
  const ctx = event.context

  const summary = (() => {
    switch (event.alertType) {
      case 'hr_spike': return `${ctx.riderName ?? 'Rider'} hit ${ctx.bpm} BPM`
      case 'hr_drop': return `${ctx.riderName ?? 'Rider'} dropped to ${ctx.bpm} BPM`
      case 'hr_sustained_high': return `${ctx.riderName ?? 'Rider'} sustained ${ctx.bpm} BPM`
      case 'readiness_peaked': return `${ctx.riderName ?? 'Rider'} peaked at ${ctx.readinessScore}`
      case 'readiness_drop': return `${ctx.riderName ?? 'Rider'} dropped to ${ctx.readinessScore} (was ${ctx.previousScore ?? '?'})`
      case 'assignment_missed': return `${ctx.riderName ?? 'Rider'} missed: ${ctx.assignmentType ?? 'assignment'}`
      case 'lap_record': return `${ctx.riderName ?? 'Rider'} new best: ${ctx.lapTime}s`
      default: return event.alertType
    }
  })()

  return (
    <div className="flex items-start gap-3 py-3 border-b border-zinc-800 last:border-0">
      <div className={`mt-0.5 shrink-0 ${meta?.color ?? 'text-zinc-400'}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-200">{summary}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-zinc-500">{timeAgo(event.firedAt)}</span>
          {event.pushSent > 0 && (
            <span className="text-xs text-lime-600 flex items-center gap-1">
              <Bell className="h-2.5 w-2.5" />
              {event.pushSent} push sent
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function ViewAlerts() {
  const { isSupported, subscription, subscribe, unsubscribe } = usePushNotifications()
  const [rules, setRules] = useState<AlertRule[]>([])
  const [events, setEvents] = useState<AlertEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [pushLoading, setPushLoading] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'rules' | 'history'>('rules')

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/md-alerts')
      if (!res.ok) return
      const data = await res.json()
      setRules(data.rules ?? [])
      setEvents(data.events ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handlePushToggle = async () => {
    setPushLoading(true)
    try {
      if (subscription) {
        await unsubscribe()
      } else {
        await subscribe()
      }
    } finally {
      setPushLoading(false)
    }
  }

  const handleToggle = async (alertType: AlertType, enabled: boolean) => {
    setSaving(alertType)
    try {
      const res = await fetch('/api/md-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertType, enabled }),
      })
      if (res.ok) {
        const data = await res.json()
        setRules((prev) => prev.map((r) => (r.alertType === alertType ? data.rule : r)))
      }
    } finally {
      setSaving(null)
    }
  }

  const handleThresholdChange = async (alertType: AlertType, thresholdValue: number) => {
    setSaving(alertType)
    try {
      const res = await fetch('/api/md-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertType, thresholdValue }),
      })
      if (res.ok) {
        const data = await res.json()
        setRules((prev) => prev.map((r) => (r.alertType === alertType ? data.rule : r)))
      }
    } finally {
      setSaving(null)
    }
  }

  const enabledCount = rules.filter((r) => r.enabled).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <RefreshCw className="h-6 w-6 text-zinc-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-100 tracking-tight">Coach Alerts</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Real-time push notifications for critical rider events
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-lime-400">{enabledCount}</p>
          <p className="text-xs text-zinc-500">active rules</p>
        </div>
      </div>

      {/* Push notification toggle */}
      <div className={`rounded-lg border p-5 ${subscription ? 'border-lime-800 bg-lime-950/30' : 'border-zinc-700 bg-zinc-900/60'}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={subscription ? 'text-lime-400' : 'text-zinc-500'}>
              {subscription ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
            </div>
            <div>
              <p className="font-bold text-zinc-100 text-sm">Push Notifications</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {!isSupported
                  ? 'Not supported in this browser'
                  : subscription
                  ? 'Notifications enabled — alerts will fire on this device'
                  : 'Enable to receive alerts when thresholds are breached'}
              </p>
            </div>
          </div>

          {isSupported && (
            <button
              onClick={handlePushToggle}
              disabled={pushLoading}
              className={`shrink-0 px-4 py-2 font-black uppercase tracking-widest rounded text-xs transition-colors disabled:opacity-50 ${
                subscription
                  ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
                  : 'bg-lime-400 text-zinc-950 hover:bg-lime-300'
              }`}
            >
              {pushLoading ? '...' : subscription ? 'Disable' : 'Enable'}
            </button>
          )}
        </div>

        {!subscription && isSupported && (
          <div className="mt-3 flex items-center gap-2 text-xs text-yellow-500/80">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>Push must be enabled for alerts to reach you — they still log even when disabled.</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
        {(['rules', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded transition-colors ${
              activeTab === tab
                ? 'bg-zinc-700 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab === 'rules' ? `Alert Rules (${rules.length})` : `History (${events.length})`}
          </button>
        ))}
      </div>

      {/* Rules tab */}
      {activeTab === 'rules' && (
        <div className="space-y-3">
          {rules.length === 0 ? (
            <div className="text-center py-12 text-zinc-600">
              <Bell className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p className="font-bold">No alert rules configured</p>
              <p className="text-sm mt-1">Reload to seed defaults</p>
            </div>
          ) : (
            <>
              {/* HR alerts group */}
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Heart Rate</p>
              {rules
                .filter((r) => r.alertType.startsWith('hr_'))
                .map((rule) => (
                  <RuleCard
                    key={rule.id}
                    rule={rule}
                    onToggle={handleToggle}
                    onThresholdChange={handleThresholdChange}
                  />
                ))}

              {/* Readiness group */}
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-4">Readiness</p>
              {rules
                .filter((r) => r.alertType.startsWith('readiness_'))
                .map((rule) => (
                  <RuleCard
                    key={rule.id}
                    rule={rule}
                    onToggle={handleToggle}
                    onThresholdChange={handleThresholdChange}
                  />
                ))}

              {/* Other alerts */}
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-4">Team Events</p>
              {rules
                .filter((r) => !r.alertType.startsWith('hr_') && !r.alertType.startsWith('readiness_'))
                .map((rule) => (
                  <RuleCard
                    key={rule.id}
                    rule={rule}
                    onToggle={handleToggle}
                    onThresholdChange={handleThresholdChange}
                  />
                ))}
            </>
          )}

          {saving && (
            <p className="text-xs text-lime-500 text-center animate-pulse">Saving...</p>
          )}
        </div>
      )}

      {/* History tab */}
      {activeTab === 'history' && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60">
          {events.length === 0 ? (
            <div className="text-center py-12 text-zinc-600">
              <Check className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p className="font-bold">No alerts fired yet</p>
              <p className="text-sm mt-1">Events will appear here when thresholds are breached</p>
            </div>
          ) : (
            <div className="px-4">
              {events.map((event) => (
                <EventItem key={event.id} event={event} />
              ))}
              {events.length === 50 && (
                <p className="text-xs text-zinc-600 text-center py-3">Showing last 50 events</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Setup callout for VAPID */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex items-start gap-3">
          <ChevronRight className="h-4 w-4 text-zinc-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-zinc-400">Push notification setup</p>
            <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
              Requires <span className="font-mono text-zinc-500">NEXT_PUBLIC_VAPID_PUBLIC_KEY</span>,{' '}
              <span className="font-mono text-zinc-500">VAPID_PRIVATE_KEY</span>, and{' '}
              <span className="font-mono text-zinc-500">VAPID_SUBJECT</span> env vars.
              Generate keys with: <span className="font-mono text-zinc-400">npx web-push generate-vapid-keys</span>.
              HR alerts also require Terra API to be connected.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
