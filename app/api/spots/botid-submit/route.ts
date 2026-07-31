import { checkBotId } from 'botid/server'
import { NextResponse } from 'next/server'

/**
 * BotID-protected riding spot submission endpoint.
 *
 * Verifies the request is from a real human before adding to the community riding spot map.
 * Prevents:
 * - AI-generated fake riding spots (noise in the map)
 * - Spam, gibberish, or malicious location data
 * - Bot farms polluting the community database with garbage data
 *
 * Returns 401 if the request appears to be from a bot.
 */
export async function POST(request: Request) {
  try {
    // Check if this is a real human request
    const { isBot } = await checkBotId()

    if (isBot) {
      // Bot detected
      return NextResponse.json(
        {
          error:
            'Riding spot submissions must come from verified humans. Automated submissions are blocked to maintain map quality.',
        },
        { status: 401 },
      )
    }

    // Parse the request body
    const body = await request.json()
    const { name, latitude, longitude, description, difficulty, terrain } = body

    // Validate inputs
    if (!name || latitude === undefined || longitude === undefined || !description) {
      return NextResponse.json({ error: 'Missing required spot fields' }, { status: 400 })
    }

    // Sanity checks
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
    }

    if (description.length < 10) {
      return NextResponse.json({ error: 'Description too short (min 10 chars)' }, { status: 400 })
    }

    // TODO: Add the riding spot here
    // This is where you'd:
    // 1. Verify the rider account is in good standing
    // 2. Geocode/validate the location
    // 3. Store in your database with the rider's ID
    // 4. Queue for community moderation review
    console.log('[BotID] Riding spot submitted from human:', { name, difficulty, terrain })

    return NextResponse.json({
      success: true,
      message: 'Riding spot submitted for approval',
      spotId: `SPOT-${Date.now()}`,
      status: 'pending_moderation',
      botIdVerified: true,
    })
  } catch (error) {
    console.error('[BotID] Riding spot submission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
