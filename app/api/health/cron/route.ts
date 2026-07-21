export async function GET() {
  try {
    // Check if payment recovery cron is enabled
    const paymentRecoveryEnabled = !!process.env.CRON_SECRET

    return Response.json({
      status: 'ok',
      service: 'cron',
      paymentRecovery: {
        enabled: paymentRecoveryEnabled,
        endpoint: '/api/cron/payment-recovery',
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Cron health check failed:', error)
    return Response.json(
      {
        status: 'error',
        service: 'cron',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
