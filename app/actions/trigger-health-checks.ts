'use server'

/**
 * Manually trigger health checks
 * Can be called from dashboard or API for on-demand verification
 */
export async function triggerHealthChecks() {
  try {
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret) {
      console.error('[v0] CRON_SECRET not configured')
      return {
        ok: false,
        error: 'CRON_SECRET not configured',
      }
    }

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    const response = await fetch(`${baseUrl}/api/cron/health-checks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[v0] Health check trigger failed:', data)
      return {
        ok: false,
        error: data.error || 'Failed to trigger health checks',
      }
    }

    console.log('[v0] Health checks triggered successfully')
    return {
      ok: true,
      data,
    }
  } catch (error) {
    console.error('[v0] Error triggering health checks:', error)
    return {
      ok: false,
      error: String(error),
    }
  }
}
