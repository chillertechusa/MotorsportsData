import { checkBotId } from 'botid/server'
import { NextResponse } from 'next/server'

/**
 * BotID-protected signup endpoint.
 *
 * Verifies the request is from a real human (not an AI copilot, script, or automated signup farm)
 * before allowing account creation. Prevents:
 * - Credential stuffing attacks
 * - Account farming for contingency claim abuse
 * - Spam rider accounts
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
        { error: 'Request appears to be automated. Please try again from a real device.' },
        { status: 401 },
      )
    }

    // Parse the request body
    const body = await request.json()
    const { email, password, name } = body

    // Validate inputs
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // TODO: Create the user account here
    // This is where you'd call your auth system (Better Auth, Supabase, etc.)
    console.log('[BotID] Signup attempt from human:', { email, name })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      botIdVerified: true,
    })
  } catch (error) {
    console.error('[BotID] Signup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
