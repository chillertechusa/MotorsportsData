import { generateText } from 'ai'
import { NextResponse } from 'next/server'
import { getSessionTeamId, assertVehicleOwnership } from '@/lib/md-auth'
import { checkRateLimit } from '@/lib/rate-limit'

// Gemini 2.5 Pro is zero-config via Vercel AI Gateway — no GEMINI_API_KEY needed.
const VISION_MODEL = 'google/gemini-2.5-pro'

// Phase 3: max upload size — 10 MB. Reject before sending to the model.
const MAX_FILE_BYTES = 10 * 1024 * 1024

// Accepted upload types. Gemini 2.5 Pro reads both images and PDFs, and the
// upload UI advertises PDF, so we accept it here too.
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']

export async function POST(req: Request) {
  // Phase 1: require auth.
  const authResult = await getSessionTeamId()
  if (!authResult.ok) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  // RATE LIMIT: 5 scans per 60 s per team. Vision inference is the most expensive
  // call on the platform — a tight window prevents abuse even from valid accounts.
  const rl = checkRateLimit(`scan-manual:${authResult.teamId}`, 5, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many scan requests. Please wait before uploading again.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) },
      },
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const vehicleId = formData.get('vehicleId') as string | null

    if (!file || !vehicleId) {
      return NextResponse.json({ success: false, error: 'File and vehicleId are required.' }, { status: 400 })
    }

    // Phase 1: ensure the vehicle belongs to the caller's team.
    const owned = await assertVehicleOwnership(vehicleId, authResult.teamId)
    if (!owned) {
      return NextResponse.json({ success: false, error: 'Vehicle does not belong to your team.' }, { status: 403 })
    }

    // Phase 3: file size guard.
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ success: false, error: 'File too large. Maximum size is 10 MB.' }, { status: 413 })
    }

    // Phase 3: file type guard.
    const mimeType = file.type || 'image/jpeg'
    if (!ACCEPTED_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type. Upload a JPEG, PNG, WebP, HEIC image, or a PDF.' },
        { status: 415 },
      )
    }

    // Convert the uploaded file to base64 for inline vision input.
    const bytes = await file.arrayBuffer()
    const base64Data = Buffer.from(bytes).toString('base64')

    const prompt = `You are an expert factory racing mechanic reading a service manual page.

Extract ONLY the standard/baseline suspension and setup specifications from this image.

Return ONLY a valid JSON object with this exact structure (use null for any value not found):
{
  "fork_compression_clicks_out": number | null,
  "fork_rebound_clicks_out": number | null,
  "shock_sag_mm": number | null,
  "shock_low_speed_comp_clicks_out": number | null,
  "shock_high_speed_comp_turns_out": number | null,
  "tire_pressure_front_psi": number | null,
  "tire_pressure_rear_psi": number | null
}

No markdown. No explanation. No extra text. Raw JSON only.`

    const { text } = await generateText({
      model: VISION_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'file',
              data: base64Data,
              mediaType: mimeType,
            },
          ],
        },
      ],
    })

    // Strip any accidental markdown code fences the model may add.
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim()

    let baselineSetup: Record<string, number | null>
    try {
      baselineSetup = JSON.parse(cleanJson)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Could not read the manual. Try a clearer, well-lit photo with the spec table fully visible.' },
        { status: 422 },
      )
    }

    // Phase 3: if every field is null the image was unreadable — surface a helpful message.
    const hasAnyValue = Object.values(baselineSetup).some((v) => v !== null)
    if (!hasAnyValue) {
      return NextResponse.json(
        {
          success: false,
          error: 'No setup values detected. Ensure the suspension specification table is clearly visible and in focus.',
        },
        { status: 422 },
      )
    }

    return NextResponse.json({ success: true, baselineSetup })
  } catch (error) {
    // Log the real error server-side only — never send internal details to the client.
    console.error('[scan-manual] error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 })
  }
}
