/**
 * POST /api/device/oauth-callback
 * 
 * OAuth callback handler for device linking
 * Receives auth code from provider, exchanges for token, stores securely
 */

import { NextRequest, NextResponse } from 'next/server'
import { exchangeAuthCode, encryptCredential, type DeviceProvider } from '@/lib/device/credential-store'

interface CallbackRequest {
  provider: DeviceProvider
  code: string
  state: string
  riderId: string
  teamId: string
  deviceName: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CallbackRequest = await request.json()

    const { provider, code, state, riderId, teamId, deviceName } = body

    // Validate state token (prevent CSRF)
    const storedState = request.cookies.get(`oauth_state_${provider}`)?.value
    if (!storedState || storedState !== state) {
      return NextResponse.json({ error: 'Invalid state token' }, { status: 400 })
    }

    // Exchange auth code for token
    const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`]
    const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`]
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/device/oauth-callback`

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: `Missing OAuth credentials for ${provider}` },
        { status: 500 }
      )
    }

    const tokenData = await exchangeAuthCode(
      provider,
      code,
      clientId,
      clientSecret,
      redirectUri
    )

    // Encrypt token for storage
    const encryptionKey = process.env.DEVICE_ENCRYPTION_KEY
    if (!encryptionKey) {
      return NextResponse.json(
        { error: 'Encryption key not configured' },
        { status: 500 }
      )
    }

    const encrypted = encryptCredential(tokenData.accessToken, encryptionKey)

    // TODO: Store encrypted credential in database
    // INSERT INTO device_credentials (
    //   team_id, rider_id, provider, device_name, 
    //   access_token_encrypted, access_token_iv, access_token_tag,
    //   refresh_token, expires_at, auto_sync
    // ) VALUES (...)

    console.log('[OAuth] Device linked successfully', {
      provider,
      teamId,
      riderId,
      deviceName,
    })

    // Return success with redirect
    const response = NextResponse.json(
      {
        success: true,
        message: `${deviceName} linked successfully`,
        provider,
        deviceName,
      },
      { status: 200 }
    )

    // Clear state cookie
    response.cookies.delete(`oauth_state_${provider}`)

    return response
  } catch (error) {
    console.error('[OAuth] Callback error:', error)
    return NextResponse.json(
      { error: 'Failed to link device' },
      { status: 500 }
    )
  }
}

/**
 * Example request:
 * 
 * POST /api/device/oauth-callback
 * Content-Type: application/json
 * 
 * {
 *   "provider": "garmin",
 *   "code": "auth_code_from_garmin",
 *   "state": "random_state_token",
 *   "riderId": "rider-123",
 *   "teamId": "team-456",
 *   "deviceName": "Garmin Edge 1540"
 * }
 */
