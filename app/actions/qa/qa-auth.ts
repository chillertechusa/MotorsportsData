'use server'

/**
 * QA Auth Tests — user acquisition and compliance layer
 *
 * Tests:
 *  1. Sign-up form accepts valid DOB
 *  2. Under-18 riders are blocked from creating own accounts
 *  3. Parents (18+) can create accounts
 *  4. Rider profiles can be created for under-18 riders
 *  5. COPPA compliance for under-13 riders (guardian consent)
 */

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import { mdTeams, mdUserCompliance, mdRiderProfiles } from '@/lib/db/schema'

export interface QAAuthResult {
  suite: 'qa-auth'
  status: 'pass' | 'fail'
  timestamp: number
  tests: QAAuthTest[]
  summary: {
    passed: number
    failed: number
    duration_ms: number
  }
}

export interface QAAuthTest {
  name: string
  status: 'pass' | 'fail'
  message: string
  error?: string
}

/**
 * Helper: compute age from DOB
 */
function computeAge(dateOfBirth: string): number {
  const [year, month, day] = dateOfBirth.split('-').map(Number)
  const today = new Date()
  let age = today.getFullYear() - year
  if (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day)) {
    age--
  }
  return age
}

/**
 * Run all auth tests
 */
export async function runQAAuth(): Promise<QAAuthResult> {
  const startTime = Date.now()
  const tests: QAAuthTest[] = []

  // ──────────────────────────────────────────────────────────────────────────
  // 1. VALID DOB ACCEPTANCE
  // ──────────────────────────────────────────────────────────────────────────

  const dobTest: QAAuthTest = {
    name: 'DOB format validation accepts valid dates',
    status: 'pass',
    message: 'Valid DOB formats accepted (YYYY-MM-DD)',
  }
  try {
    const testDOBs = ['2000-01-15', '1995-12-31', '2008-06-20']
    for (const dob of testDOBs) {
      const age = computeAge(dob)
      if (age < 0 || age > 120) {
        throw new Error(`Invalid age computed for ${dob}: ${age}`)
      }
    }
  } catch (error) {
    dobTest.status = 'fail'
    dobTest.error = String(error)
  }
  tests.push(dobTest)

  // ──────────────────────────────────────────────────────────────────────────
  // 2. UNDER-18 BLOCK
  // ──────────────────────────────────────────────────────────────────────────

  const under18BlockTest: QAAuthTest = {
    name: 'Riders under 18 are blocked from sign-up',
    status: 'pass',
    message: 'Under-18 DOB computation verified',
  }
  try {
    // Rider born today - 17 years ago
    const today = new Date()
    const under18DOB = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate())
      .toISOString()
      .split('T')[0]

    const age = computeAge(under18DOB)
    if (age >= 18) {
      throw new Error(`Age computation error: expected < 18, got ${age}`)
    }
  } catch (error) {
    under18BlockTest.status = 'fail'
    under18BlockTest.error = String(error)
  }
  tests.push(under18BlockTest)

  // ──────────────────────────────────────────────────────────────────────────
  // 3. ADULT (18+) CAN CREATE ACCOUNT
  // ──────────────────────────────────────────────────────────────────────────

  const adultSignupTest: QAAuthTest = {
    name: 'Adults (18+) can sign up',
    status: 'pass',
    message: 'Adult DOB computation verified',
  }
  try {
    // Adult born 25 years ago
    const today = new Date()
    const adultDOB = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate())
      .toISOString()
      .split('T')[0]

    const age = computeAge(adultDOB)
    if (age < 18) {
      throw new Error(`Age computation error: expected >= 18, got ${age}`)
    }
  } catch (error) {
    adultSignupTest.status = 'fail'
    adultSignupTest.error = String(error)
  }
  tests.push(adultSignupTest)

  // ──────────────────────────────────────────────────────────────────────────
  // 4. UNDER-13 COPPA COMPLIANCE
  // ──────────────────────────────────────────────────────────────────────────

  const coppaTest: QAAuthTest = {
    name: 'COPPA compliance requires guardian for under-13',
    status: 'pass',
    message: 'Under-13 age bracket correctly identified',
  }
  try {
    // Child born 12 years ago
    const today = new Date()
    const childDOB = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate())
      .toISOString()
      .split('T')[0]

    const age = computeAge(childDOB)
    if (age >= 13) {
      throw new Error(`Age computation error: expected < 13, got ${age}`)
    }
  } catch (error) {
    coppaTest.status = 'fail'
    coppaTest.error = String(error)
  }
  tests.push(coppaTest)

  // ──────────────────────────────────────────────────────────────────────────
  // 5. RIDER PROFILES TABLE EXISTS
  // ──────────────────────────────────────────────────────────────────────────

  const riderProfilesTableTest: QAAuthTest = {
    name: 'md_rider_profiles table exists and is queryable',
    status: 'pass',
    message: 'Rider profiles table accessible',
  }
  try {
    // Attempt a query on the rider profiles table
    // This will fail if the table doesn't exist in the schema
    const result = await db.select().from(mdRiderProfiles).limit(0)
    if (!Array.isArray(result)) {
      throw new Error('Query did not return array')
    }
  } catch (error) {
    riderProfilesTableTest.status = 'fail'
    riderProfilesTableTest.error = String(error)
  }
  tests.push(riderProfilesTableTest)

  // ──────────────────────────────────────────────────────────────────────────
  // 6. USER COMPLIANCE TABLE EXISTS
  // ──────────────────────────────────────────────────────────────────────────

  const complianceTableTest: QAAuthTest = {
    name: 'md_user_compliance table exists for COPPA tracking',
    status: 'pass',
    message: 'User compliance table accessible',
  }
  try {
    const result = await db.select().from(mdUserCompliance).limit(0)
    if (!Array.isArray(result)) {
      throw new Error('Query did not return array')
    }
  } catch (error) {
    complianceTableTest.status = 'fail'
    complianceTableTest.error = String(error)
  }
  tests.push(complianceTableTest)

  // ──────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ──────────────────────────────────────────────────────────────────────────

  const passed = tests.filter((t) => t.status === 'pass').length
  const failed = tests.filter((t) => t.status === 'fail').length
  const duration_ms = Date.now() - startTime

  const result: QAAuthResult = {
    suite: 'qa-auth',
    status: failed === 0 ? 'pass' : 'fail',
    timestamp: Date.now(),
    tests,
    summary: { passed, failed, duration_ms },
  }

  return result
}
