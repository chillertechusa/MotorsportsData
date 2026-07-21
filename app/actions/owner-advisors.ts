'use server'

import { requireMdOwner } from '@/lib/md-owner-auth'
import {
  getLatestAdvisorReports,
  getAdvisorHistory,
  acknowledgeAdvisorReport,
  runAllAdvisors,
  runAdvisor,
  type AdvisorKey,
} from '@/lib/advisors'

export async function fetchLatestAdvisorReports() {
  await requireMdOwner()
  return getLatestAdvisorReports()
}

export async function fetchAdvisorHistory(key: AdvisorKey) {
  await requireMdOwner()
  return getAdvisorHistory(key)
}

export async function runAdvisorsNow() {
  await requireMdOwner()
  const results = await runAllAdvisors()
  const latest = await getLatestAdvisorReports()
  return { results, latest }
}

export async function runSingleAdvisorNow(key: AdvisorKey) {
  await requireMdOwner()
  return runAdvisor(key)
}

export async function acknowledgeAdvisor(id: string) {
  await requireMdOwner()
  await acknowledgeAdvisorReport(id)
  return { ok: true }
}
