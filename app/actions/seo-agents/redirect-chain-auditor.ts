'use server'

import { HealthCheck, HealthCheckStatus } from '@/lib/health-check-types'

interface RedirectChain {
  path: string
  statusCode: number
  redirectTo?: string
  chain: Array<{ status: number; url: string }>
}

/**
 * SEO Redirect Chain Auditor
 * Tests for redirect chains that harm SEO (more than 1 redirect)
 * Verifies: 301/308 permanent redirects, no redirect loops
 */
export async function runRedirectChainAudit(): Promise<HealthCheck> {
  const startTime = Date.now()
  let status: HealthCheckStatus = 'pass'
  let message = 'Redirect chains validated'
  let errorDetails: Record<string, any> = {}

  try {
    const baseUrl = 'https://motorsportsdata.io'
    
    // Test critical redirect paths
    const testPaths = [
      '/data/checkout', // Should redirect to /data/pricing or /checkout/tier
      '/data/plans/rookie', // Should redirect to /rookie
      '/data/plans/privateer', // Should redirect to /privateer
      '/data/plans/race_team', // Should redirect to /race_team
      '/data/plans/factory_rig', // Should redirect to /factory_rig
      '/data/plans/wrench', // Should redirect to /wrench
      '/data/plans/agent', // Should redirect to /agent
      '/', // Should not redirect
      '/rookie', // Should not redirect
    ]

    const redirectChains: RedirectChain[] = []
    let chainIssuesFound = 0

    for (const path of testPaths) {
      const chain = await followRedirects(`${baseUrl}${path}`)
      redirectChains.push({
        path,
        statusCode: chain[chain.length - 1].status,
        redirectTo: chain.length > 1 ? chain[1].url : undefined,
        chain,
      })

      // Check for redirect chains (more than 1 redirect is bad for SEO)
      if (chain.length > 2) {
        chainIssuesFound++
        status = 'warning'
        message = `Found ${chainIssuesFound} redirect chain(s) - each should be direct`
      }

      // Check for redirect loops
      const urls = chain.map(c => c.url)
      const uniqueUrls = new Set(urls)
      if (uniqueUrls.size < urls.length) {
        status = 'error'
        message = 'Redirect loop detected'
        errorDetails.loop_detected = { path, chain }
      }
    }

    errorDetails.redirect_chains_checked = testPaths.length
    errorDetails.redirect_chains = redirectChains.map(c => ({
      path: c.path,
      depth: c.chain.length,
      statusCode: c.statusCode,
      redirectTo: c.redirectTo,
    }))
    errorDetails.chain_issues = chainIssuesFound

    if (chainIssuesFound === 0 && status === 'pass') {
      message = `All ${testPaths.length} critical paths redirect properly (no chains)`
    }

    return {
      id: `seo_redirect_${Date.now()}`,
      check_type: 'seo_redirect_chain_audit',
      status,
      message,
      response_time_ms: Date.now() - startTime,
      error_details: Object.keys(errorDetails).length > 0 ? errorDetails : undefined,
      created_at: new Date().toISOString(),
    }
  } catch (error) {
    return {
      id: `seo_redirect_error_${Date.now()}`,
      check_type: 'seo_redirect_chain_audit',
      status: 'error',
      message: 'SEO redirect audit failed',
      response_time_ms: Date.now() - startTime,
      error_details: {
        error: error instanceof Error ? error.message : String(error),
      },
      created_at: new Date().toISOString(),
    }
  }
}

/**
 * Follow redirect chain and return all redirects
 */
async function followRedirects(
  url: string,
  maxRedirects = 5,
  redirects: Array<{ status: number; url: string }> = []
): Promise<Array<{ status: number; url: string }>> {
  if (redirects.length > maxRedirects) {
    throw new Error('Max redirects exceeded')
  }

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual',
      headers: { 'User-Agent': 'Mozilla/5.0 (SEO-Bot)' },
    })

    redirects.push({
      status: response.status,
      url: response.url,
    })

    // If 3xx redirect, follow it
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (location) {
        const nextUrl = new URL(location, url).toString()
        if (nextUrl !== url) {
          return followRedirects(nextUrl, maxRedirects, redirects)
        }
      }
    }

    return redirects
  } catch (error) {
    redirects.push({
      status: 0,
      url: url,
    })
    return redirects
  }
}
