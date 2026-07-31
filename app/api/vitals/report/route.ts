import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdMetrics } from '@/lib/db/schema'

/**
 * Receives Web Vitals metrics from the client and stores them.
 * Used for performance monitoring and alerting.
 */
export async function POST(request: NextRequest) {
  try {
    const metric = await request.json()

    // Validate required fields
    if (!metric.name || metric.value === undefined) {
      return NextResponse.json({ error: 'Invalid metric' }, { status: 400 })
    }

    // Store metric in database
    await db.insert(mdMetrics).values({
      metricName: metric.name,
      metricValue: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      url: metric.url || '',
      userAgent: metric.userAgent || '',
      timestamp: new Date(metric.timestamp),
      isFID: metric.name === 'FID',
      isLCP: metric.name === 'LCP',
      isCLS: metric.name === 'CLS',
      isFCP: metric.name === 'FCP',
      isTTFB: metric.name === 'TTFB',
    })

    // Send real-time alert if metric exceeds threshold
    if (metric.rating === 'poor') {
      // Trigger alert (could be email, Slack, webhook, etc.)
      console.warn(`[v0] Poor Web Vital detected: ${metric.name} = ${metric.value}ms`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Failed to store vitals:', error)
    return NextResponse.json({ error: 'Failed to store metric' }, { status: 500 })
  }
}
