'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { mdConsentRecords, mdUserCompliance } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import {
  CURRENT_LEGAL_DOCS,
  SIGNUP_REQUIRED_DOCS,
  ageBracket,
  computeAge,
  requiresGuardian,
  type LegalDocKey,
} from '@/lib/legal'

interface GuardianInfo {
  name: string
  email: string
  relationship: string
}

interface RecordSignupComplianceInput {
  dateOfBirth: string // YYYY-MM-DD
  guardian?: GuardianInfo
  /** Doc keys the user affirmatively accepted. Defaults to the signup-required set. */
  acceptedDocs?: LegalDocKey[]
}

/**
 * Records DOB/age compliance + versioned consent for a newly created account.
 * Called right after signup (mirrors assignRookieTier). Under-13 riders MUST
 * provide guardian info; consent is recorded on a 'guardian' basis and the
 * account is flagged coppa_status='guardian_consent_pending' until verified.
 */
export async function recordSignupCompliance(input: RecordSignupComplianceInput) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) throw new Error('Unauthorized: no session')
  const userId = session.user.id

  const hdrs = await headers()
  const ipAddress = hdrs.get('x-forwarded-for')
  const userAgent = hdrs.get('user-agent')

  const age = computeAge(input.dateOfBirth)
  if (age === null || age < 0 || age > 120) {
    return { ok: false as const, reason: 'invalid_dob' }
  }

  const bracket = ageBracket(age)
  const needsGuardian = requiresGuardian(age)

  if (needsGuardian) {
    const g = input.guardian
    if (!g || !g.name?.trim() || !g.email?.trim() || !g.relationship?.trim()) {
      // Do not create the compliance row without guardian consent for a minor.
      return { ok: false as const, reason: 'guardian_required' }
    }
  }

  const birthYear = Number(input.dateOfBirth.slice(0, 4)) || null
  const consentBasis = needsGuardian ? 'guardian' : 'self'
  const coppaStatus = needsGuardian ? 'guardian_consent_pending' : 'not_applicable'

  // Upsert the compliance row.
  await db
    .insert(mdUserCompliance)
    .values({
      userId,
      dateOfBirth: input.dateOfBirth,
      birthYear: birthYear ?? undefined,
      ageAtSignup: age,
      ageBracket: bracket,
      isMinor: age < 18,
      requiresGuardian: needsGuardian,
      coppaStatus,
      guardianName: input.guardian?.name?.trim(),
      guardianEmail: input.guardian?.email?.trim(),
      guardianRelationship: input.guardian?.relationship?.trim(),
    })
    .onConflictDoUpdate({
      target: mdUserCompliance.userId,
      set: {
        dateOfBirth: input.dateOfBirth,
        birthYear: birthYear ?? undefined,
        ageAtSignup: age,
        ageBracket: bracket,
        isMinor: age < 18,
        requiresGuardian: needsGuardian,
        coppaStatus,
        guardianName: input.guardian?.name?.trim(),
        guardianEmail: input.guardian?.email?.trim(),
        guardianRelationship: input.guardian?.relationship?.trim(),
        updatedAt: new Date(),
      },
    })

  // Record a versioned consent row for each required doc.
  const docKeys =
    input.acceptedDocs && input.acceptedDocs.length > 0
      ? input.acceptedDocs
      : SIGNUP_REQUIRED_DOCS.map((d) => d.key)

  const rows = docKeys
    .map((key) => CURRENT_LEGAL_DOCS[key])
    .filter(Boolean)
    .map((doc) => ({
      userId,
      docKey: doc.key,
      docVersion: doc.version,
      consentBasis,
      guardianName: input.guardian?.name?.trim(),
      guardianEmail: input.guardian?.email?.trim(),
      guardianRelationship: input.guardian?.relationship?.trim(),
      ipAddress,
      userAgent,
    }))

  if (rows.length > 0) {
    await db.insert(mdConsentRecords).values(rows)
  }

  console.log(
    `[v0] Recorded signup compliance for ${userId}: age ${age} (${bracket}), basis ${consentBasis}, ${rows.length} consent rows`,
  )

  return {
    ok: true as const,
    ageBracket: bracket,
    requiresGuardian: needsGuardian,
    coppaStatus,
  }
}

/** Returns the current user's compliance row + consent history, or null. */
export async function getMyComplianceStatus() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) throw new Error('Unauthorized: no session')
  const userId = session.user.id

  const [compliance] = await db
    .select()
    .from(mdUserCompliance)
    .where(eq(mdUserCompliance.userId, userId))
    .limit(1)

  const consents = await db
    .select()
    .from(mdConsentRecords)
    .where(eq(mdConsentRecords.userId, userId))

  return { compliance: compliance ?? null, consents }
}

/**
 * Records acceptance of a single document version (e.g. re-acceptance after a
 * version bump). Scoped to the signed-in user.
 */
export async function acceptDocument(docKey: LegalDocKey) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) throw new Error('Unauthorized: no session')
  const userId = session.user.id

  const doc = CURRENT_LEGAL_DOCS[docKey]
  if (!doc) return { ok: false as const, reason: 'unknown_doc' }

  const hdrs = await headers()

  // Skip if already accepted this exact version.
  const existing = await db
    .select({ id: mdConsentRecords.id })
    .from(mdConsentRecords)
    .where(
      and(
        eq(mdConsentRecords.userId, userId),
        eq(mdConsentRecords.docKey, doc.key),
        eq(mdConsentRecords.docVersion, doc.version),
      ),
    )
    .limit(1)

  if (existing.length > 0) return { ok: true as const, alreadyAccepted: true }

  await db.insert(mdConsentRecords).values({
    userId,
    docKey: doc.key,
    docVersion: doc.version,
    consentBasis: 'self',
    ipAddress: hdrs.get('x-forwarded-for'),
    userAgent: hdrs.get('user-agent'),
  })

  return { ok: true as const, alreadyAccepted: false }
}
