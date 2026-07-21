'use server'

import { pool } from '@/lib/db'
import { hashPassword } from 'better-auth/crypto'
import { v4 as uuid } from 'uuid'

/**
 * Create Agent and Fan tier test accounts
 * ptown_agent@motorsportsdata.io - Agent tier ($999/mo)
 * ptown_fan@motorsportsdata.io - Fan tier (free)
 */
export async function createAgentAndFanAccounts() {
  const client = await pool.connect()

  try {
    const password = 'thaddyboy454'
    const hashedPw = await hashPassword(password)

    const accounts = [
      {
        prefix: 'ptown_agent',
        email: 'ptown_agent@motorsportsdata.io',
        name: 'Agent QA Test',
        tier: 'agent',
      },
      {
        prefix: 'ptown_fan',
        email: 'ptown_fan@motorsportsdata.io',
        name: 'Fan QA Test',
        tier: 'fan',
      },
    ]

    for (const acc of accounts) {
      // Check if user already exists
      const existing = await client.query('SELECT id FROM public."user" WHERE email = $1', [acc.email])
      if (existing.rows.length > 0) {
        console.log(`[create-agent-fan] User already exists: ${acc.email}`)
        continue
      }

      // 1. Create user
      const userId = uuid()
      await client.query(
        `INSERT INTO public."user" (id, email, name, "emailVerified", "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, true, NOW(), NOW())`,
        [userId, acc.email, acc.name]
      )

      // 2. Create account record with hashed password
      await client.query(
        `INSERT INTO public.account (id, "userId", "providerId", "accountId", password, "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [uuid(), userId, 'credential', acc.email, hashedPw]
      )

      console.log(`[create-agent-fan] User created: ${acc.email} (${acc.tier})`)
    }

    return {
      success: true,
      data: {
        agent: { email: 'ptown_agent@motorsportsdata.io', password, tier: 'agent' },
        fan: { email: 'ptown_fan@motorsportsdata.io', password, tier: 'fan' },
      },
    }
  } catch (error) {
    console.error('[create-agent-fan] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  } finally {
    client.release()
  }
}
