import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET() {
  try {
    // Verify Better Auth is configured and responsive
    const session = await auth.api.getSession({ headers: await headers() })
    
    return Response.json({
      status: 'ok',
      service: 'auth',
      timestamp: new Date().toISOString(),
      configured: !!process.env.BETTER_AUTH_SECRET,
    })
  } catch (error) {
    console.error('[v0] Auth health check failed:', error)
    return Response.json(
      {
        status: 'error',
        service: 'auth',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
