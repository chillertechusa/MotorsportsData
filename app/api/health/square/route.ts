import { isSquareConfigured } from '@/lib/square'

export async function GET() {
  try {
    const configured = isSquareConfigured()
    
    if (!configured) {
      return Response.json(
        {
          status: 'error',
          service: 'square',
          configured: false,
          error: 'Square credentials not configured',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      )
    }

    return Response.json({
      status: 'ok',
      service: 'square',
      configured: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Square health check failed:', error)
    return Response.json(
      {
        status: 'error',
        service: 'square',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
