import { TIER_LABELS } from '@/lib/md-tiers'

export async function GET() {
  try {
    const tiersLoaded = Object.keys(TIER_LABELS).length
    
    if (tiersLoaded === 0) {
      return Response.json(
        {
          status: 'error',
          service: 'feature-gates',
          tiersLoaded: 0,
          error: 'No tiers loaded',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }

    return Response.json({
      status: 'ok',
      service: 'feature-gates',
      tiersLoaded,
      tiers: Object.keys(TIER_LABELS),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Feature gates health check failed:', error)
    return Response.json(
      {
        status: 'error',
        service: 'feature-gates',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
