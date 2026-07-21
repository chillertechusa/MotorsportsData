import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// ONE-TIME seed route — creates the motorsportsdata@gmail.com owner account.
// Protected by MD_OWNER_SEED_PASSWORD env var — only works once (fails if the
// account already exists). Hit GET /api/md-owner/seed?token=<password> to run.
// Delete MD_OWNER_SEED_PASSWORD from env vars after confirming the account works.

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token')
  const expected = process.env.MD_OWNER_SEED_PASSWORD
  const email = 'motorsportsdata@gmail.com'

  if (!expected) {
    return NextResponse.json({ error: 'MD_OWNER_SEED_PASSWORD is not set' }, { status: 500 })
  }

  if (!token || token !== expected) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  try {
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password: expected,
        name: 'Motorsport Data Owner',
      },
    })

    if (!result?.user) {
      return NextResponse.json({ error: 'Sign-up returned no user — account may already exist. Try signing in at /data/sign-in.' }, { status: 400 })
    }

    return NextResponse.json({
      ok: true,
      message: `Account created for ${email}. You can now sign in at /data/sign-in. Delete MD_OWNER_SEED_PASSWORD from env vars.`,
      userId: result.user.id,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    // Better Auth throws when the email is already registered
    if (/already|exists|duplicate/i.test(msg)) {
      return NextResponse.json({
        ok: false,
        message: `Account already exists for ${email}. Sign in at /data/sign-in.`,
      }, { status: 409 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
