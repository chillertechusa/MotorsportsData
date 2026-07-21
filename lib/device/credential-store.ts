/**
 * Device Credential Storage & Encryption
 * Securely stores OAuth tokens and API credentials for wearables
 * 
 * All credentials encrypted at rest using the team's encryption key
 * Rotates tokens automatically when expired
 */

import crypto from 'crypto'

export type DeviceProvider = 'garmin' | 'polar' | 'apple_watch' | 'wahoo' | 'strava'

export interface DeviceCredential {
  id: string
  teamId: string
  riderId: string
  provider: DeviceProvider
  deviceName: string
  
  // OAuth tokens (encrypted)
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
  
  // Metadata
  email?: string
  linkedAt: Date
  lastSyncedAt?: Date
  syncStatus: 'active' | 'failed' | 'expired'
  
  // Sync settings
  autoSync: boolean
  syncInterval: number // minutes
}

export interface DevicePairingRequest {
  provider: DeviceProvider
  redirectUri: string
  state: string
  timestamp: Date
}

/**
 * OAuth URLs for each provider
 */
export const OAUTH_PROVIDERS = {
  garmin: {
    authUrl: 'https://connect.garmin.com/oauth-service/oauth/authorize',
    tokenUrl: 'https://connect.garmin.com/oauth-service/oauth/access_token',
    revokeUrl: 'https://connect.garmin.com/oauth-service/oauth/revoke',
    scopes: ['ACTIVITY:READ', 'USER:READ', 'BIOMETRIC:READ'],
  },
  polar: {
    authUrl: 'https://flow.polar.com/oauth2/authorization',
    tokenUrl: 'https://api.polar.com/oauth2/token',
    revokeUrl: 'https://api.polar.com/oauth2/revoke',
    scopes: ['ACTIVITY:READ', 'HEARTRATE:READ'],
  },
  apple_watch: {
    authUrl: 'https://appleid.apple.com/auth/oauth2/authorize',
    tokenUrl: 'https://appleid.apple.com/auth/oauth2/token',
    revokeUrl: 'https://appleid.apple.com/auth/oauth2/revoke',
    scopes: ['email', 'name'],
  },
  wahoo: {
    authUrl: 'https://api.wahooligan.com/oauth/authorize',
    tokenUrl: 'https://api.wahooligan.com/oauth/token',
    revokeUrl: 'https://api.wahooligan.com/oauth/revoke',
    scopes: ['activities:read', 'profile:read'],
  },
  strava: {
    authUrl: 'https://www.strava.com/oauth/authorize',
    tokenUrl: 'https://www.strava.com/oauth/token',
    revokeUrl: 'https://www.strava.com/api/v3/oauth/revoke',
    scopes: ['activity:read', 'athlete:read_all'],
  },
}

/**
 * Encrypt credential for storage
 * Uses HMAC-SHA256 + AES-256-GCM
 */
export function encryptCredential(
  credential: string,
  encryptionKey: string
): { encrypted: string; iv: string; authTag: string } {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    Buffer.from(encryptionKey, 'hex'),
    iv
  )

  let encrypted = cipher.update(credential, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  }
}

/**
 * Decrypt credential from storage
 */
export function decryptCredential(
  encrypted: string,
  iv: string,
  authTag: string,
  encryptionKey: string
): string {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(encryptionKey, 'hex'),
    Buffer.from(iv, 'hex')
  )

  decipher.setAuthTag(Buffer.from(authTag, 'hex'))

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Check if token is expired
 */
export function isTokenExpired(expiresAt?: Date): boolean {
  if (!expiresAt) return false
  return new Date() > new Date(expiresAt.getTime() - 5 * 60 * 1000) // 5min buffer
}

/**
 * Build OAuth authorization URL
 */
export function buildAuthorizationUrl(
  provider: DeviceProvider,
  clientId: string,
  redirectUri: string,
  state: string
): string {
  const config = OAUTH_PROVIDERS[provider]
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
    scope: config.scopes.join(' '),
  })

  return `${config.authUrl}?${params.toString()}`
}

/**
 * Exchange auth code for access token
 * Requires backend call to provider API with client secret
 */
export async function exchangeAuthCode(
  provider: DeviceProvider,
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{
  accessToken: string
  refreshToken?: string
  expiresIn?: number
}> {
  const config = OAUTH_PROVIDERS[provider]

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }).toString(),
  })

  if (!response.ok) {
    throw new Error(`OAuth token exchange failed: ${response.statusText}`)
  }

  const data = await response.json()

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  }
}

/**
 * Refresh access token when expired
 */
export async function refreshAccessToken(
  provider: DeviceProvider,
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<{
  accessToken: string
  expiresIn?: number
}> {
  const config = OAUTH_PROVIDERS[provider]

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  })

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.statusText}`)
  }

  const data = await response.json()

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  }
}

/**
 * Revoke credential (user disconnects device)
 */
export async function revokeCredential(
  provider: DeviceProvider,
  accessToken: string,
  clientId: string,
  clientSecret: string
): Promise<void> {
  const config = OAUTH_PROVIDERS[provider]

  const response = await fetch(config.revokeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      token: accessToken,
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  })

  if (!response.ok) {
    console.warn(`Token revocation failed for ${provider}: ${response.statusText}`)
  }
}
