'use server'

import { pool } from '@/lib/db'
import { hashPassword } from 'better-auth/crypto'
import { v4 as uuid } from 'uuid'

type TestAccount = {
  username: string
  email: string
  planTier: 'factory_rig' | 'wrench'
  teamName: string
  password: string
}

const accounts: TestAccount[] = [
  {
    username: 'ptown4',
    email: 'ptown4@motorsportsdata.io',
    planTier: 'factory_rig',
    teamName: 'Factory Operations QA',
    password: 'thaddyboy454',
  },
  {
    username: 'ptown5',
    email: 'ptown5@motorsportsdata.io',
    planTier: 'wrench',
    teamName: 'Wrench Portfolio QA',
    password: 'thaddyboy454',
  },
]

export async function createFinalTeamAccounts() {
  const client = await pool.connect()
  const results: { success: boolean; email: string; error?: string }[] = []

  try {
    for (const account of accounts) {
      try {
        // Check if user already exists
        const existing = await client.query('SELECT id FROM public."user" WHERE email = $1', [
          account.email,
        ])
        if (existing.rows.length > 0) {
          results.push({
            success: false,
            email: account.email,
            error: 'User already exists',
          })
          continue
        }

        const userId = uuid()
        const hashedPw = await hashPassword(account.password)

        // Create user
        await client.query(
          `INSERT INTO public."user" (id, email, name, "emailVerified", "createdAt", "updatedAt") 
           VALUES ($1, $2, $3, true, NOW(), NOW())`,
          [userId, account.email, account.username]
        )

        // Create account with password
        await client.query(
          `INSERT INTO public.account (id, "userId", "providerId", "accountId", password, "createdAt", "updatedAt") 
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
          [uuid(), userId, 'credential', account.email, hashedPw]
        )

        // Create team
        const teamId = uuid()
        await client.query(
          `INSERT INTO public.md_teams 
           (id, name, rider_name, subscription_tier, subscription_status, current_period_start, current_period_end, discipline, rider_class, rider_birth_year, "createdAt") 
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW() + interval '30 days', $6, $7, $8, NOW())`,
          [
            'uuid-' + teamId,
            account.teamName,
            account.username,
            account.planTier,
            'active',
            'motocross',
            'professional',
            1990,
          ]
        )

        // Add user as team member (owner)
        await client.query(
          `INSERT INTO public.md_team_members (id, team_id, user_id, role, "createdAt") 
           VALUES ($1, $2, $3, $4, NOW())`,
          [uuid(), teamId, userId, 'owner']
        )

        // Create sample vehicle
        await client.query(
          `INSERT INTO public.md_vehicles (id, team_id, name, type, discipline, engine_hours, "createdAt") 
           VALUES ($1, $2, $3, $4, $5, 0, NOW())`,
          [uuid(), teamId, 'Test KX 450', 'dirt_bike', 'motocross']
        )

        results.push({
          success: true,
          email: account.email,
        })

        console.log(`[create-final-teams] Created ${account.planTier} account: ${account.email}`)
      } catch (error) {
        results.push({
          success: false,
          email: account.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        console.error(`[create-final-teams] Error creating ${account.email}:`, error)
      }
    }

    return {
      success: true,
      results,
    }
  } finally {
    client.release()
  }
}
