'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

/**
 * Returns the signed-in user's email if they are in the MD_OWNER_EMAILS allowlist,
 * otherwise returns null. Used by server components and server actions.
 */
export async function getMdOwner(): Promise<{ email: string; name: string | null } | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.email) return null

    const allowlist = (process.env.MD_OWNER_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)

    if (!allowlist.includes(session.user.email.toLowerCase())) return null

    return { email: session.user.email, name: session.user.name ?? null }
  } catch {
    return null
  }
}

/**
 * Hard gate for server actions and pages. Redirects to /data/sign-in if not owner.
 */
export async function requireMdOwner() {
  const owner = await getMdOwner()
  if (!owner) redirect('/data/sign-in')
  return owner
}
