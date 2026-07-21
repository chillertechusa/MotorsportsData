/**
 * API Availability Protocol
 * 
 * Checks which paid/external APIs are properly configured.
 * If not configured, features are hidden or marked as "Test Bench".
 * Users never see broken integrations.
 */

export type ApiStatus = 'available' | 'test-bench' | 'unavailable'

export interface ApiConfig {
  name: string
  envVars: string[]
  tier: 'free' | 'pro' | 'enterprise' // Which tier requires this
  category: 'wearable' | 'payment' | 'communication' | 'analytics' | 'storage'
}

const APIS: Record<string, ApiConfig> = {
  terra: {
    name: 'Wearable Sync (Terra)',
    envVars: ['TERRA_API_KEY', 'TERRA_DEV_ID'],
    tier: 'enterprise',
    category: 'wearable',
  },
  stripe: {
    name: 'Stripe Payments',
    envVars: ['STRIPE_SECRET_KEY', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'],
    tier: 'pro',
    category: 'payment',
  },
  square: {
    name: 'Square Payments',
    envVars: ['SQUARE_ACCESS_TOKEN', 'NEXT_PUBLIC_SQUARE_APP_ID'],
    tier: 'free',
    category: 'payment',
  },
  resend: {
    name: 'Resend Email',
    envVars: ['RESEND_API_KEY'],
    tier: 'free',
    category: 'communication',
  },
  googleAnalytics: {
    name: 'Google Analytics',
    envVars: ['NEXT_PUBLIC_GA_ID'],
    tier: 'free',
    category: 'analytics',
  },
  googleAds: {
    name: 'Google Ads',
    envVars: ['NEXT_PUBLIC_GOOGLE_ADS_ID'],
    tier: 'free',
    category: 'analytics',
  },
  upstashRedis: {
    name: 'Upstash Redis',
    envVars: ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
    tier: 'free',
    category: 'storage',
  },
}

/**
 * Check if an API is properly configured
 */
export function isApiAvailable(apiKey: keyof typeof APIS): boolean {
  const api = APIS[apiKey]
  if (!api) return false

  return api.envVars.every(
    (envVar) => process.env[envVar] && process.env[envVar]!.trim().length > 0
  )
}

/**
 * Get all currently available APIs
 */
export function getAvailableApis(): (keyof typeof APIS)[] {
  return Object.keys(APIS).filter((key) =>
    isApiAvailable(key as keyof typeof APIS)
  ) as (keyof typeof APIS)[]
}

/**
 * Get all unavailable APIs for diagnostics
 */
export function getUnavailableApis(): (keyof typeof APIS)[] {
  return Object.keys(APIS).filter((key) =>
    !isApiAvailable(key as keyof typeof APIS)
  ) as (keyof typeof APIS)[]
}

/**
 * Determine feature status: available, test-bench, or hidden entirely
 */
export function getFeatureStatus(apiKey: keyof typeof APIS): ApiStatus {
  if (isApiAvailable(apiKey)) {
    return 'available'
  }
  // If it's a premium tier feature and not available, mark as test-bench
  const api = APIS[apiKey]
  if (api.tier === 'enterprise') {
    return 'test-bench'
  }
  // If it's free tier but missing, it's unavailable (shouldn't happen in prod)
  return 'unavailable'
}

/**
 * Get the config for an API
 */
export function getApiConfig(apiKey: keyof typeof APIS): ApiConfig | null {
  return APIS[apiKey] || null
}

/**
 * Log API availability on startup (dev only)
 */
export function logApiStatus() {
  if (process.env.NODE_ENV !== 'development') return

  const available = getAvailableApis()
  const unavailable = getUnavailableApis()

  console.log('[API Status] Available:', available)
  console.log('[API Status] Unavailable:', unavailable)
}
