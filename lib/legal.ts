/**
 * Shared legal / consent constants and pure helpers.
 * Safe to import from both client and server (no 'use server', no DB).
 * The DB (md_legal_documents) is the source of truth for versions; these
 * constants mirror the seeded "current" versions so the UI can render and
 * record consent without an extra round-trip.
 */

export type LegalDocKey = 'terms' | 'privacy' | 'data_consent' | 'cookies'

export interface LegalDocMeta {
  key: LegalDocKey
  version: string
  title: string
  href: string
  /** Whether affirmative acceptance is required at signup. */
  requiresAcceptance: boolean
}

/** Current in-force versions. Keep in sync with the md_legal_documents seed. */
export const CURRENT_LEGAL_DOCS: Record<LegalDocKey, LegalDocMeta> = {
  terms: {
    key: 'terms',
    version: '2.0.0-draft',
    title: 'Terms of Service',
    href: '/legal/terms',
    requiresAcceptance: true,
  },
  privacy: {
    key: 'privacy',
    version: '2.0.0-draft',
    title: 'Privacy Policy',
    href: '/legal/privacy',
    requiresAcceptance: true,
  },
  data_consent: {
    key: 'data_consent',
    version: '1.0.0-draft',
    title: 'Data Sharing & Consent',
    href: '/legal/data-consent',
    requiresAcceptance: true,
  },
  cookies: {
    key: 'cookies',
    version: '1.0.0-draft',
    title: 'Cookie Policy',
    href: '/legal/cookies',
    requiresAcceptance: false,
  },
}

/** Documents a user must affirmatively accept when creating an account. */
export const SIGNUP_REQUIRED_DOCS: LegalDocMeta[] = [
  CURRENT_LEGAL_DOCS.terms,
  CURRENT_LEGAL_DOCS.privacy,
  CURRENT_LEGAL_DOCS.data_consent,
]

export type AgeBracket = 'under_13' | 'teen_13_15' | 'teen_16_17' | 'adult'

/** COPPA: under 13 requires verifiable parental consent before data collection. */
export const COPPA_MIN_AGE = 13

/** Compute age in whole years from a YYYY-MM-DD date string, as of `asOf`. */
export function computeAge(dateOfBirth: string, asOf: Date = new Date()): number | null {
  const dob = new Date(dateOfBirth + 'T00:00:00')
  if (Number.isNaN(dob.getTime())) return null
  let age = asOf.getFullYear() - dob.getFullYear()
  const m = asOf.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && asOf.getDate() < dob.getDate())) age--
  return age
}

export function ageBracket(age: number): AgeBracket {
  if (age < COPPA_MIN_AGE) return 'under_13'
  if (age <= 15) return 'teen_13_15'
  if (age <= 17) return 'teen_16_17'
  return 'adult'
}

/** Under-13 riders need a guardian to provide verifiable parental consent. */
export function requiresGuardian(age: number): boolean {
  return age < COPPA_MIN_AGE
}

/** True if the whole DRAFT-review banner should show (any current doc is a draft). */
export function hasDraftDocs(): boolean {
  return Object.values(CURRENT_LEGAL_DOCS).some((d) => d.version.includes('draft'))
}
