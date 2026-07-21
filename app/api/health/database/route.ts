import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export async function GET() {
  try {
    // Run a simple query to verify database connection
    await db.execute(sql`SELECT 1`)
    
    return Response.json({
      status: 'ok',
      service: 'database',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Database health check failed:', error)
    return Response.json(
      {
        status: 'error',
        service: 'database',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
