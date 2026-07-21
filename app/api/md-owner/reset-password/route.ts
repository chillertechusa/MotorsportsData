import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { user as userTable, account as accountTable } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

/**
 * Owner-only password reset for TEST accounts.
 *
 * Better Auth stores credential passwords as a one-way hash in
 * account.password (providerId = 'credential'). We cannot read an existing
 * password, but we can overwrite it with a correctly-hashed new value using
 * Better Auth's own password hasher (auth.$context.password.hash), so the
 * reset password logs in exactly like a normal credential.
 *
 * Usage:
 *   GET /api/md-owner/reset-password?token=<MD_OWNER_SEED_PASSWORD>
 *       &email=<email>&password=<newPassword>
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  const email = url.searchParams.get('email')?.toLowerCase().trim()
  const newPassword = url.searchParams.get('password')

  const expected = process.env.MD_OWNER_SEED_PASSWORD
  if (!expected) {
    return NextResponse.json({ error: 'MD_OWNER_SEED_PASSWORD is not set' }, { status: 500 })
  }
  if (!token || token !== expected) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
  if (!email || !newPassword) {
    return NextResponse.json({ error: 'email and password query params are required' }, { status: 400 })
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'password must be at least 8 characters' }, { status: 400 })
  }

  // 1. Find the user.
  const [existing] = await db
    .select({ id: userTable.id })
    .from(userTable)
    .where(eq(userTable.email, email))
    .limit(1)

  if (!existing) {
    return NextResponse.json({ error: `No user found for ${email}` }, { status: 404 })
  }

  // 2. Hash the new password with Better Auth's own hasher.
  const ctx = await auth.$context
  const hashed = await ctx.password.hash(newPassword)

  // 3. Update the credential account row (create one if it somehow doesn't exist).
  const [cred] = await db
    .select({ id: accountTable.id })
    .from(accountTable)
    .where(and(eq(accountTable.userId, existing.id), eq(accountTable.providerId, 'credential')))
    .limit(1)

  if (cred) {
    await db
      .update(accountTable)
      .set({ password: hashed, updatedAt: new Date() })
      .where(eq(accountTable.id, cred.id))
  } else {
    await db.insert(accountTable).values({
      id: crypto.randomUUID(),
      accountId: existing.id,
      providerId: 'credential',
      userId: existing.id,
      password: hashed,
    })
  }

  return NextResponse.json({
    ok: true,
    email,
    action: cred ? 'password-updated' : 'credential-created',
  })
}
