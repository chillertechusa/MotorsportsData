import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

// Lazy singletons — avoids ERR_INVALID_URL crash during Next.js build
// when DATABASE_URL is absent from the build environment.
let _pool: Pool | null = null
let _db: NodePgDatabase<typeof schema> | null = null

// Shared pool getter. Both Drizzle (here) and Better Auth (lib/auth.ts) use
// this SAME pool — one connection, one source of truth, per the Neon stack.
// connectionTimeoutMillis is critical in serverless: without it, a connection
// that cannot be established hangs the function forever instead of erroring.
export function getPool(): Pool {
  if (!_pool) {
    // Do NOT throw when DATABASE_URL is missing: the auth route evaluates
    // `auth.handler` at build time (no DATABASE_URL in the build env), and
    // throwing here breaks page-data collection. pg only connects on the first
    // query, which never happens during build. At runtime the var is present,
    // and connectionTimeoutMillis makes a bad connection fail fast, not hang.
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Fail fast instead of hanging forever if the DB is unreachable.
      connectionTimeoutMillis: 10000,
      // Keep the serverless footprint small and recycle idle sockets.
      max: 5,
      idleTimeoutMillis: 30000,
      // Neon pooled endpoints require TLS.
      ssl: { rejectUnauthorized: false },
    })
    // Never let an idle-client error crash the process; log and move on.
    _pool.on('error', (err) => {
      console.log('[v0] pg pool error:', err.message)
    })
  }
  return _pool
}

export function getDb(): NodePgDatabase<typeof schema> {
  if (!_db) {
    _db = drizzle(getPool(), { schema })
  }
  return _db
}

// `db` proxy: all existing `import { db } from '@/lib/db'` calls work unchanged.
// The real connection is only opened the first time a query is executed.
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop: string) {
    return (getDb() as any)[prop]
  },
})

// `pool` proxy for any direct pool access
export const pool = new Proxy({} as Pool, {
  get(_target, prop: string) {
    getDb() // ensure pool is initialized
    return (_pool as any)[prop]
  },
})
