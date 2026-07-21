'use server'

import { pool } from '@/lib/db'
import { hashPassword } from 'better-auth/crypto'
import { v4 as uuid } from 'uuid'
import type { MdPlanId } from '@/lib/md-plans'

type BatchTeamConfig = {
  emailPrefix: string
  domain: string
  password: string
  plans: MdPlanId[]
}

/**
 * Create multiple test team accounts in ascending order by plan
 * Example: ptown1@motorsportsdata.io (Rookie), ptown2@motorsportsdata.io (Privateer), etc.
 */
export async function createBatchTeamAccounts(config: BatchTeamConfig) {
  const client = await pool.connect()
  const results = []

  try {
    for (let i = 0; i < config.plans.length; i++) {
      const planId = config.plans[i]
      const accountNum = i + 1
      const email = `${config.emailPrefix}${accountNum}@${config.domain}`
      const name = `${config.emailPrefix}${accountNum}`

      try {
        // Check if user already exists
        const existing = await client.query('SELECT id FROM public."user" WHERE email = $1', [email])
        if (existing.rows.length > 0) {
          results.push({
            email,
            tier: planId,
            success: false,
            error: 'User already exists',
          })
          continue
        }

        // 1. Create user
        const userId = uuid()
        const hashedPw = await hashPassword(config.password)

        await client.query(
          `INSERT INTO public."user" (id, email, name, "emailVerified", "createdAt", "updatedAt") 
           VALUES ($1, $2, $3, true, NOW(), NOW())`,
          [userId, email, name]
        )

        // 2. Create account record with hashed password
        await client.query(
          `INSERT INTO public.account (id, "userId", "providerId", "accountId", password, "createdAt", "updatedAt") 
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
          [uuid(), userId, 'credential', email, hashedPw]
        )

        // 3. Create team
        const teamId = 'team-' + uuid()
        const subscriptionStatus = planId === 'rookie' ? 'active' : 'active'
        
        await client.query(
          `INSERT INTO public.md_teams 
           (id, name, rider_name, subscription_tier, subscription_status, current_period_start, current_period_end, discipline, rider_class, rider_birth_year, "createdAt") 
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW() + interval '30 days', $6, $7, $8, NOW())`,
          [teamId, `${name} Team`, name, planId, subscriptionStatus, 'motocross', 'amateur', 1990]
        )

        // 4. Add user as team member (owner role)
        await client.query(
          `INSERT INTO public.md_team_members (id, team_id, user_id, role, "createdAt") 
           VALUES ($1, $2, $3, $4, NOW())`,
          [uuid(), teamId, userId, 'owner']
        )

        // 5. Create sample vehicle
        const vehicleId = 'vehicle-' + uuid()
        await client.query(
          `INSERT INTO public.md_vehicles (id, team_id, name, type, discipline, engine_hours, "createdAt") 
           VALUES ($1, $2, $3, $4, $5, 0, NOW())`,
          [vehicleId, teamId, `Test KX 450 (${name})`, 'dirt_bike', 'motocross']
        )

        results.push({
          email,
          tier: planId,
          success: true,
          userId,
          teamId,
          vehicleId,
        })

        console.log(`[create-batch-teams] Created ${email} with tier ${planId}`)
      } catch (error) {
        results.push({
          email,
          tier: planId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        console.error(`[create-batch-teams] Failed to create ${email}:`, error)
      }
    }

    return {
      success: true,
      data: results,
      summary: {
        total: results.length,
        created: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      },
    }
  } finally {
    client.release()
  }
}
