import { betterAuth } from 'better-auth'
import { twoFactor } from 'better-auth/plugins'
import { getPool } from '@/lib/db'

function buildAuth() {
  // Reuse the single shared pool (fail-fast connection timeout configured in
  // lib/db). Opening a second pool here doubled connection pressure and could
  // hang serverless functions when connections could not be established.
  const pool = getPool()

  return betterAuth({
    database: pool,
    baseURL:
      process.env.BETTER_AUTH_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : process.env.V0_RUNTIME_URL || 'http://localhost:3000'),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      minPasswordLength: 8,
    },
    trustedOrigins: [
      'https://motorsportsdata.io',
      'https://www.motorsportsdata.io',
      '*.vusercontent.net',
      '*.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    plugins: [twoFactor()],
    advanced: {
      defaultCookieAttributes: {
        sameSite: 'none' as const,
        secure: true,
      },
    },
  })
}

// Lazy singleton — only initialized on first real API call, never during build/SSG.
let _auth: ReturnType<typeof buildAuth> | null = null

// Symbols and internal React/Node props that must NOT trigger DB init.
const SKIP_PROPS = new Set([
  'then', 'catch', 'finally', // Promise detection
  Symbol.toPrimitive, Symbol.iterator, Symbol.toStringTag,
  '__esModule', '$$typeof', '_isMockFunction',
])

export const auth = new Proxy({} as ReturnType<typeof buildAuth>, {
  get(_target, prop) {
    if (SKIP_PROPS.has(prop as any)) return undefined
    if (!_auth) _auth = buildAuth()
    return (_auth as any)[prop]
  },
})
