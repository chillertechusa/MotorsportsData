import { checkBotId } from 'botid/server'
import { NextResponse } from 'next/server'

/**
 * BotID-protected contingency claim submission endpoint.
 *
 * Verifies the request is from a real human before allowing a claim to be filed.
 * Prevents:
 * - Automated false claim submissions
 * - AI copilot farms filing thousands of fake claims
 * - Script kiddies bulk-submitting bogus contingency claims (financial fraud)
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
            'Contingency claims must be submitted from a verified human account. Automated submissions are blocked.',
        },
        { status: 401 },
      )
    }

    // Parse the request body
    const body = await request.json()
    const { riderId, eventId, resultProof, contingencyProgramId } = body

    // Validate inputs
    if (!riderId || !eventId || !resultProof || !contingencyProgramId) {
      return NextResponse.json({ error: 'Missing required claim fields' }, { status: 400 })
    }

    // TODO: Submit the claim here
    // This is where you'd:
    // 1. Verify the rider owns this account
    // 2. Verify the result is legitimate
    // 3. Check the contingency program rules
    // 4. File the claim and trigger payout if applicable
    console.log('[BotID] Claim submission from human:', { riderId, eventId, contingencyProgramId })

    return NextResponse.json({
      success: true,
      message: 'Claim submitted successfully',
      claimId: `CLAIM-${Date.now()}`,
      botIdVerified: true,
    })
  } catch (error) {
    console.error('[BotID] Claim submission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
