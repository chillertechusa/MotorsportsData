import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { hashPassword } from 'better-auth/crypto'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Missing token or password.' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      )
    }

    // Find user by reset token and check expiration
    const result = await db.execute(
      sql`SELECT id, email FROM "user" WHERE "passwordResetToken" = ${token} AND "passwordResetTokenExpiresAt" > NOW() LIMIT 1`
    )

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token.' },
        { status: 400 }
      )
    }

    const userId = (result.rows[0] as any).id

    // Hash new password
    const hashedPassword = await hashPassword(password)

    // Update password in account table (Better Auth credential storage) and clear reset token from user table
    await db.execute(
      sql`UPDATE "account" SET password = ${hashedPassword} WHERE "userId" = ${userId} AND "providerId" = 'credential'`
    )
    
    await db.execute(
      sql`UPDATE "user" SET "passwordResetToken" = NULL, "passwordResetTokenExpiresAt" = NULL WHERE id = ${userId}`
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Password reset error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    )
  }
}
