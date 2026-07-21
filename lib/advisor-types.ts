/**
 * Client-safe advisor types + registry (NO db import) so the owner console client
 * can use them without bundling the Postgres driver. The engine (lib/advisors.ts)
 * re-exports these.
 */

export type AdvisorKey = 'growth' | 'revenue' | 'retention' | 'data_asset'
export type HealthSignal = 'good' | 'watch' | 'risk'

export const ADVISORS: {
  key: AdvisorKey
  label: string
  role: string
  description: string
}[] = [
  {
    key: 'growth',
    label: 'Growth Advisor',
    role: 'Acquisition & conversion',
    description: 'Signups, Free Rider adoption, free-to-paid conversion, tier mix, and agent-driven acquisition.',
  },
  {
    key: 'revenue',
    label: 'Revenue Advisor',
    role: 'Monetization & renewals',
    description: 'External-account streams and subscription MRR. Underpriced accounts, expansion, at-risk renewals.',
  },
  {
    key: 'retention',
    label: 'Retention Advisor',
    role: 'Engagement & churn',
    description: 'Riders and teams going quiet before they churn, and which features keep them active.',
  },
  {
    key: 'data_asset',
    label: 'Data-Asset Advisor',
    role: 'Dataset & moat',
    description: 'Aggregate dataset growth, consent rates, and discipline density (WMX first) — when the moat is monetizable to OEMs.',
  },
]

export type AdvisorRecommendation = {
  title: string
  detail: string
  priority: 'high' | 'medium' | 'low'
}

export type AdvisorReport = {
  id: string
  advisorKey: AdvisorKey
  period: string
  healthSignal: HealthSignal
  headline: string
  summary: string | null
  metrics: Record<string, number | string | null>
  recommendations: AdvisorRecommendation[]
  synthesizedBy: string
  acknowledged: boolean
  createdAt: Date | null
}

export function advisorMeta(key: AdvisorKey) {
  return ADVISORS.find((a) => a.key === key)
}
