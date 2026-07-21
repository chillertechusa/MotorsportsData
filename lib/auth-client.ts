'use client'

import { createAuthClient } from 'better-auth/react'
import { twoFactorClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  // Use `||` (not `??`) so an empty-string env var falls through to the runtime origin.
  // A blank baseURL triggers `new URL('')` which crashes the SSR bundle at build time.
  baseURL:
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
  plugins: [
    twoFactorClient({
      twoFactorPage: '/account/2fa/verify',
    }),
  ],
})

export const { signIn, signUp, signOut, useSession } = authClient
