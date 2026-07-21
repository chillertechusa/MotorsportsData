'use server'

import { HealthCheck, HealthCheckStatus } from '@/lib/health-check-types'

/**
 * SEO 404 Detector
 * Tests for broken links that return 404
 * Crawls critical user paths to ensure all links are valid
 */
export async function run404Detector(): Promise<HealthCheck> {
  const startTime = Date.now()
  let status: HealthCheckStatus = 'pass'
  let message = 'No 404 errors found'
  let errorDetails: Record<string, any> = {}

  try {
    const baseUrl = 'https://motorsportsdata.io'
    
    // Critical pages that should always exist
    const criticalPages = [
      '/',
      '/rookie',
      '/privateer',
      '/race_team',
      '/factory_rig',
      '/wrench',
      '/agent',
      '/coach',
      '/checkout/tier',
      '/data/sign-in',
      '/data/pricing',
      '/about',
      '/legal/privacy',
      '/legal/terms',
    ]

    const brokenLinks: Array<{ path: string; status: number }> = []
    const validLinks: string[] = []

    for (const path of criticalPages) {
      try {
        const response = await fetch(`${baseUrl}${path}`, {
          method: 'HEAD',
          redirect: 'follow',
          headers: { 'User-Agent': 'Mozilla/5.0 (SEO-Bot)' },
        })

        if (response.status === 404) {
          brokenLinks.push({ path, status: 404 })
          status = 'error'
          message = `Found ${brokenLinks.length} broken link(s) returning 404`
        } else if (response.ok) {
          validLinks.push(path)
        } else if (response.status >= 500) {
          status = 'error'
          message = `Server error on ${path} (${response.status})`
          brokenLinks.push({ path, status: response.status })
        }
      } catch (err) {
        brokenLinks.push({ path, status: 0 })
        status = 'warning'
        message = 'Failed to reach some pages'
      }
    }

    errorDetails.critical_pages_checked = criticalPages.length
    errorDetails.valid_links = validLinks.length
    errorDetails.broken_links = brokenLinks.length
    if (brokenLinks.length > 0) {
      errorDetails.broken_details = brokenLinks
    }

    if (brokenLinks.length === 0) {
      message = `All ${criticalPages.length} critical pages are reachable`
      status = 'pass'
    }

    return {
      id: `seo_404_${Date.now()}`,
      check_type: 'seo_404_detector',
      status,
      message,
      response_time_ms: Date.now() - startTime,
      error_details: Object.keys(errorDetails).length > 0 ? errorDetails : undefined,
      created_at: new Date().toISOString(),
    }
  } catch (error) {
    return {
      id: `seo_404_error_${Date.now()}`,
      check_type: 'seo_404_detector',
      status: 'error',
      message: 'SEO 404 audit failed',
      response_time_ms: Date.now() - startTime,
      error_details: {
        error: error instanceof Error ? error.message : String(error),
      },
      created_at: new Date().toISOString(),
    }
  }
}
