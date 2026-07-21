'use server'

import { revalidatePath } from 'next/cache'
import { requireMdOwner } from '@/lib/md-owner-auth'
import {
  getSentinelStats,
  getSentinelEvents,
  acknowledgeSentinelEvent,
  runSentinelSweeps,
  type SentinelLens,
  type SentinelStats,
  type SentinelEventRow,
  type SweepResult,
} from '@/lib/sentinel'

/** Owner-only: full console payload (per-lens stats + recent events). */
export async function loadSentinelConsole(lens?: SentinelLens): Promise<{
  stats: SentinelStats
  events: SentinelEventRow[]
}> {
  await requireMdOwner()
  const [stats, events] = await Promise.all([
    getSentinelStats(),
    getSentinelEvents({ lens, limit: 150 }),
  ])
  return { stats, events }
}

/** Owner-only: acknowledge (triage) a single event. */
export async function acknowledgeEvent(id: string): Promise<{ ok: boolean }> {
  const owner = await requireMdOwner()
  await acknowledgeSentinelEvent(id, owner.email)
  revalidatePath('/data/owner/sentinel')
  return { ok: true }
}

/** Owner-only: manually run all sweep rules now (also runs on the cron schedule). */
export async function triggerSentinelSweep(): Promise<{
  ok: boolean
  totalCreated: number
  results: SweepResult[]
}> {
  await requireMdOwner()
  const { results, totalCreated } = await runSentinelSweeps()
  revalidatePath('/data/owner/sentinel')
  return { ok: true, totalCreated, results }
}
