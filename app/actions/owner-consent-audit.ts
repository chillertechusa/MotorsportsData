'use server'

import { requireMdOwner } from '@/lib/md-owner-auth'
import { db } from '@/lib/db'
import { mdConsentRecords, mdUserCompliance, mdLegalDocuments } from '@/lib/db/schema'
import { desc, sql } from 'drizzle-orm'

export interface ConsentAuditSummary {
  totalConsentRecords: number
  totalUsersWithCompliance: number
  minors: number
  under13: number
  guardianPending: number
  guardianVerified: number
  byBracket: { bracket: string; count: number }[]
  byDoc: { docKey: string; docVersion: string; count: number }[]
  recentConsents: {
    id: string
    userId: string
    docKey: string
    docVersion: string
    consentBasis: string
    guardianName: string | null
    createdAt: Date | null
  }[]
  documents: {
    docKey: string
    version: string
    title: string
    status: string
    isCurrent: boolean
    requiresAcceptance: boolean
    effectiveDate: string | null
  }[]
}

/**
 * Aggregate consent + compliance stats for the owner console. Owner-gated.
 * Read-only; no user data is mutated.
 */
export async function getConsentAudit(): Promise<ConsentAuditSummary> {
  await requireMdOwner()

  const [
    totals,
    bracketRows,
    docRows,
    recent,
    docsRegistry,
  ] = await Promise.all([
    db
      .select({
        totalConsent: sql<number>`(SELECT COUNT(*) FROM md_consent_records)`,
        totalCompliance: sql<number>`(SELECT COUNT(*) FROM md_user_compliance)`,
        minors: sql<number>`(SELECT COUNT(*) FROM md_user_compliance WHERE is_minor = true)`,
        under13: sql<number>`(SELECT COUNT(*) FROM md_user_compliance WHERE age_bracket = 'under_13')`,
        guardianPending: sql<number>`(SELECT COUNT(*) FROM md_user_compliance WHERE coppa_status = 'guardian_consent_pending')`,
        guardianVerified: sql<number>`(SELECT COUNT(*) FROM md_user_compliance WHERE coppa_status = 'guardian_consent_verified')`,
      })
      .from(sql`(SELECT 1) AS _`),
    db
      .select({
        bracket: sql<string>`COALESCE(age_bracket, 'unknown')`,
        count: sql<number>`COUNT(*)`,
      })
      .from(mdUserCompliance)
      .groupBy(sql`age_bracket`),
    db
      .select({
        docKey: mdConsentRecords.docKey,
        docVersion: mdConsentRecords.docVersion,
        count: sql<number>`COUNT(*)`,
      })
      .from(mdConsentRecords)
      .groupBy(mdConsentRecords.docKey, mdConsentRecords.docVersion),
    db
      .select({
        id: mdConsentRecords.id,
        userId: mdConsentRecords.userId,
        docKey: mdConsentRecords.docKey,
        docVersion: mdConsentRecords.docVersion,
        consentBasis: mdConsentRecords.consentBasis,
        guardianName: mdConsentRecords.guardianName,
        createdAt: mdConsentRecords.createdAt,
      })
      .from(mdConsentRecords)
      .orderBy(desc(mdConsentRecords.createdAt))
      .limit(25),
    db
      .select()
      .from(mdLegalDocuments)
      .orderBy(mdLegalDocuments.docKey, desc(mdLegalDocuments.createdAt)),
  ])

  const t = totals[0] ?? {
    totalConsent: 0,
    totalCompliance: 0,
    minors: 0,
    under13: 0,
    guardianPending: 0,
    guardianVerified: 0,
  }

  return {
    totalConsentRecords: Number(t.totalConsent) || 0,
    totalUsersWithCompliance: Number(t.totalCompliance) || 0,
    minors: Number(t.minors) || 0,
    under13: Number(t.under13) || 0,
    guardianPending: Number(t.guardianPending) || 0,
    guardianVerified: Number(t.guardianVerified) || 0,
    byBracket: bracketRows.map((r) => ({ bracket: r.bracket, count: Number(r.count) || 0 })),
    byDoc: docRows.map((r) => ({
      docKey: r.docKey,
      docVersion: r.docVersion,
      count: Number(r.count) || 0,
    })),
    recentConsents: recent.map((r) => ({
      id: r.id,
      userId: r.userId,
      docKey: r.docKey,
      docVersion: r.docVersion,
      consentBasis: r.consentBasis,
      guardianName: r.guardianName ?? null,
      createdAt: r.createdAt,
    })),
    documents: docsRegistry.map((d) => ({
      docKey: d.docKey,
      version: d.version,
      title: d.title,
      status: d.status,
      isCurrent: d.isCurrent,
      requiresAcceptance: d.requiresAcceptance,
      effectiveDate: d.effectiveDate ?? null,
    })),
  }
}
