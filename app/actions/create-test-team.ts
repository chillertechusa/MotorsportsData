'use server'

import { db, pool } from '@/lib/db'
import { mdTeams, mdTeamMembers, mdVehicles } from '@/lib/db/schema'
import { hashPassword } from 'better-auth/crypto'
import { v4 as uuid } from 'uuid'

/**
 * Create a full operational test team account for fab0891@gmail.com
 * Sets up:
 * - User account with email + password (using Better Auth schema)
 * - Team with Race Team tier subscription
 * - Team member (owner role)
 * - Sample vehicle for testing
 */
export async function createTestTeamAccount() {
  const client = await pool.connect()

  try {
    const email = 'fab0891@gmail.com'
    const password = 'thaddyboy44'
    const name = 'Thaddeus QA'

    // Check if user already exists
    const existing = await client.query('SELECT id FROM public."user" WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      throw new Error('User already exists')
    }

    // 1. Create user in public.user table (Better Auth schema)
    const userId = uuid()
    const hashedPw = await hashPassword(password)

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

    console.log('[create-test-team] User created:', userId)

    // 3. Create team in md_teams
    const teamId = uuid()
    await client.query(
      `INSERT INTO public.md_teams 
       (id, name, rider_name, subscription_tier, subscription_status, current_period_start, current_period_end, discipline, rider_class, rider_birth_year, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW() + interval '30 days', $6, $7, $8, NOW())`,
      ['uuid-' + teamId, 'QA Test Team', 'Thaddeus QA', 'race_team', 'active', 'motocross', 'amateur', 1990]
    )
    console.log('[create-test-team] Team created:', teamId)

    // 4. Add user as team member (owner role)
    await client.query(
      `INSERT INTO public.md_team_members (id, team_id, user_id, role, "createdAt") 
       VALUES ($1, $2, $3, $4, NOW())`,
      [uuid(), teamId, userId, 'owner']
    )
    console.log('[create-test-team] User added to team as owner')

    // 5. Create sample vehicle for testing
    const vehicleId = uuid()
    await client.query(
      `INSERT INTO public.md_vehicles (id, team_id, name, type, discipline, engine_hours, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, 0, NOW())`,
      ['uuid-' + vehicleId, teamId, 'Test KX 450', 'dirt_bike', 'motocross']
    )
    console.log('[create-test-team] Vehicle created:', vehicleId)

    return {
      success: true,
      data: {
        userId,
        teamId,
        vehicleId,
        email: 'fab0891@gmail.com',
        name: 'Thaddeus QA',
        team: 'QA Test Team',
        tier: 'race_team',
      },
    }
  } catch (error) {
    console.error('[create-test-team] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  } finally {
    client.release()
  }
}
