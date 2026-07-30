import 'server-only'

import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { mdSquareConnections } from '@/lib/db/schema'

const SCOPES = [
  'CUSTOMERS_READ',
  'CUSTOMERS_WRITE',
  'INVOICES_READ',
  'INVOICES_WRITE',
  'ORDERS_READ',
  'ORDERS_WRITE',
  'MERCHANT_PROFILE_READ',
] as const

interface EncryptedValue {
  encrypted: string
  iv: string
  tag: string
}

interface OAuthState {
  teamId: string
  userId: string
  nonce: string
  expiresAt: number
}

interface SquareTokenResponse {
  access_token?: string
  token_type?: string
  expires_at?: string
  merchant_id?: string
  refresh_token?: string
  short_lived?: boolean
  errors?: Array<{ code?: string; detail?: string }>
}

interface SquareLocationResponse {
  locations?: Array<{ id?: string; name?: string; status?: string }>
  errors?: Array<{ code?: string; detail?: string }>
}

interface SquareMerchantResponse {
  merchant?: { id?: string; business_name?: string }
  errors?: Array<{ code?: string; detail?: string }>
}

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not configured`)
  return value
}

function encryptionKey(): Buffer {
  const raw = required('SQUARE_TOKEN_ENCRYPTION_KEY')
  if (raw.length < 20) {
    throw new Error('SQUARE_TOKEN_ENCRYPTION_KEY must be at least 20 characters')
  }
  // A 64-character hex value maps directly to 32 bytes. Other strong secrets
  // are domain-separated and deterministically expanded into an AES-256 key.
  return /^[a-fA-F0-9]{64}$/.test(raw)
    ? Buffer.from(raw, 'hex')
    : createHash('sha256').update(`motorsports-data:square:${raw}`, 'utf8').digest()
}

function stateSecret(): string {
  return process.env.BETTER_AUTH_SECRET ?? required('SQUARE_APPLICATION_SECRET')
}

function squareEnvironment(): 'sandbox' | 'production' {
  return process.env.SQUARE_ENVIRONMENT === 'production' || process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === 'production'
    ? 'production'
    : 'sandbox'
}

function connectBaseUrl(): string {
  return squareEnvironment() === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com'
}

function apiBaseUrl(): string {
  return squareEnvironment() === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com'
}

export function appBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

function encrypt(value: string): EncryptedValue {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  return {
    encrypted: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex'),
  }
}

function decrypt(value: EncryptedValue): string {
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(value.iv, 'hex'))
  decipher.setAuthTag(Buffer.from(value.tag, 'hex'))
  return Buffer.concat([
    decipher.update(Buffer.from(value.encrypted, 'hex')),
    decipher.final(),
  ]).toString('utf8')
}

export function createOAuthState(teamId: string, userId: string): string {
  const payload: OAuthState = {
    teamId,
    userId,
    nonce: randomBytes(16).toString('hex'),
    expiresAt: Date.now() + 10 * 60 * 1000,
  }
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', stateSecret()).update(encoded).digest('base64url')
  return `${encoded}.${signature}`
}

export function verifyOAuthState(value: string): OAuthState {
  const [encoded, providedSignature] = value.split('.')
  if (!encoded || !providedSignature) throw new Error('Invalid OAuth state')
  const expectedSignature = createHmac('sha256', stateSecret()).update(encoded).digest('base64url')
  const provided = Buffer.from(providedSignature)
  const expected = Buffer.from(expectedSignature)
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    throw new Error('Invalid OAuth state signature')
  }
  const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as OAuthState
  if (!payload.teamId || !payload.userId || payload.expiresAt < Date.now()) {
    throw new Error('OAuth state expired')
  }
  return payload
}

export function getSquareAuthorizeUrl(teamId: string, userId: string): string {
  const url = new URL('/oauth2/authorize', connectBaseUrl())
  url.searchParams.set('client_id', required('SQUARE_APPLICATION_ID'))
  url.searchParams.set('scope', SCOPES.join(' '))
  url.searchParams.set('session', 'false')
  url.searchParams.set('state', createOAuthState(teamId, userId))
  url.searchParams.set('redirect_uri', `${appBaseUrl()}/api/square/callback`)
  return url.toString()
}

async function squareFetch<T>(path: string, accessToken: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Square-Version': '2026-01-22',
      ...init?.headers,
    },
  })
  const body = (await response.json()) as T & { errors?: Array<{ detail?: string }> }
  if (!response.ok) {
    throw new Error(body.errors?.[0]?.detail ?? `Square request failed (${response.status})`)
  }
  return body
}

export async function exchangeSquareCode(code: string): Promise<SquareTokenResponse> {
  const response = await fetch(`${connectBaseUrl()}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Square-Version': '2026-01-22',
    },
    body: JSON.stringify({
      client_id: required('SQUARE_APPLICATION_ID'),
      client_secret: required('SQUARE_APPLICATION_SECRET'),
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${appBaseUrl()}/api/square/callback`,
    }),
  })
  const body = (await response.json()) as SquareTokenResponse
  if (!response.ok || !body.access_token || !body.refresh_token || !body.merchant_id || !body.expires_at) {
    throw new Error(body.errors?.[0]?.detail ?? 'Square did not return complete seller credentials')
  }
  return body
}

export async function saveSquareConnection(teamId: string, token: SquareTokenResponse): Promise<void> {
  const accessToken = token.access_token!
  const merchantId = token.merchant_id!
  const [locationsBody, merchantBody] = await Promise.all([
    squareFetch<SquareLocationResponse>('/v2/locations', accessToken),
    squareFetch<SquareMerchantResponse>(`/v2/merchants/${merchantId}`, accessToken),
  ])
  const location = locationsBody.locations?.find((item) => item.status === 'ACTIVE' && item.id)
  if (!location?.id) throw new Error('Square account has no active location')

  const encryptedAccess = encrypt(accessToken)
  const encryptedRefresh = encrypt(token.refresh_token!)
  await db.insert(mdSquareConnections).values({
    teamId,
    merchantId,
    locationId: location.id,
    merchantName: merchantBody.merchant?.business_name ?? location.name ?? 'Square seller',
    accessTokenEncrypted: encryptedAccess.encrypted,
    accessTokenIv: encryptedAccess.iv,
    accessTokenTag: encryptedAccess.tag,
    refreshTokenEncrypted: encryptedRefresh.encrypted,
    refreshTokenIv: encryptedRefresh.iv,
    refreshTokenTag: encryptedRefresh.tag,
    expiresAt: new Date(token.expires_at!),
    status: 'active',
    scopes: [...SCOPES],
    refreshedAt: new Date(),
    updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: mdSquareConnections.teamId,
    set: {
      merchantId,
      locationId: location.id,
      merchantName: merchantBody.merchant?.business_name ?? location.name ?? 'Square seller',
      accessTokenEncrypted: encryptedAccess.encrypted,
      accessTokenIv: encryptedAccess.iv,
      accessTokenTag: encryptedAccess.tag,
      refreshTokenEncrypted: encryptedRefresh.encrypted,
      refreshTokenIv: encryptedRefresh.iv,
      refreshTokenTag: encryptedRefresh.tag,
      expiresAt: new Date(token.expires_at!),
      status: 'active',
      scopes: [...SCOPES],
      refreshedAt: new Date(),
      updatedAt: new Date(),
    },
  })
}

async function refreshConnection(connection: typeof mdSquareConnections.$inferSelect) {
  const refreshToken = decrypt({
    encrypted: connection.refreshTokenEncrypted,
    iv: connection.refreshTokenIv,
    tag: connection.refreshTokenTag,
  })
  const response = await fetch(`${connectBaseUrl()}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Square-Version': '2026-01-22' },
    body: JSON.stringify({
      client_id: required('SQUARE_APPLICATION_ID'),
      client_secret: required('SQUARE_APPLICATION_SECRET'),
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })
  const body = (await response.json()) as SquareTokenResponse
  if (!response.ok || !body.access_token || !body.refresh_token || !body.expires_at) {
    await db.update(mdSquareConnections).set({ status: 'refresh_failed', updatedAt: new Date() })
      .where(eq(mdSquareConnections.id, connection.id))
    throw new Error(body.errors?.[0]?.detail ?? 'Square connection needs to be reconnected')
  }
  const access = encrypt(body.access_token)
  const refresh = encrypt(body.refresh_token)
  await db.update(mdSquareConnections).set({
    accessTokenEncrypted: access.encrypted,
    accessTokenIv: access.iv,
    accessTokenTag: access.tag,
    refreshTokenEncrypted: refresh.encrypted,
    refreshTokenIv: refresh.iv,
    refreshTokenTag: refresh.tag,
    expiresAt: new Date(body.expires_at),
    status: 'active',
    refreshedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(mdSquareConnections.id, connection.id))
  return body.access_token
}

export async function getSquareCredentialsForTeam(teamId: string): Promise<{
  accessToken: string
  locationId: string
  merchantId: string
}> {
  const [connection] = await db.select().from(mdSquareConnections)
    .where(and(eq(mdSquareConnections.teamId, teamId), eq(mdSquareConnections.status, 'active')))
    .limit(1)
  if (!connection) throw new Error('Connect the family Square account before sending invoices')
  const refreshBefore = Date.now() + 7 * 24 * 60 * 60 * 1000
  const accessToken = connection.expiresAt.getTime() <= refreshBefore
    ? await refreshConnection(connection)
    : decrypt({
        encrypted: connection.accessTokenEncrypted,
        iv: connection.accessTokenIv,
        tag: connection.accessTokenTag,
      })
  return { accessToken, locationId: connection.locationId, merchantId: connection.merchantId }
}

export async function getSquareConnectionStatus(teamId: string) {
  const [connection] = await db.select({
    merchantName: mdSquareConnections.merchantName,
    status: mdSquareConnections.status,
    connectedAt: mdSquareConnections.connectedAt,
  }).from(mdSquareConnections).where(eq(mdSquareConnections.teamId, teamId)).limit(1)
  return connection ?? null
}

export async function disconnectSquare(teamId: string): Promise<void> {
  await db.update(mdSquareConnections).set({ status: 'revoked', updatedAt: new Date() })
    .where(eq(mdSquareConnections.teamId, teamId))
}

export { squareFetch }
