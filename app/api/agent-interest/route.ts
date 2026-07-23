import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VALID_ROLES = ['agent', 'rider', 'parent', 'sponsor', 'other', 'unspecified']

/**
 * GET /api/agent-interest
 * Public signup counter for the 2028 Agent Marketplace waitlist.
 * Returns the total number of interested signups (no PII).
 */
export async function GET() {
  try {
    const supabase = createServiceClient()
    const { count, error } = await supabase
      .from('md_agent_interest')
      .select('*', { count: 'exact', head: true })

    if (error) throw error

    return NextResponse.json({ ok: true, count: count ?? 0 })
  } catch (error) {
    console.error('[agent-interest] GET error:', error)
    // Never break the page over a counter — return 0 gracefully.
    return NextResponse.json({ ok: true, count: 0 })
  }
}

/**
 * POST /api/agent-interest
 * Capture an email for the 2028 Agent Marketplace waitlist.
 * Public, no auth. Deduplicates on email.
 * Body: { email: string, role?: string, sourceTier?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body.email !== 'string') {
      return NextResponse.json({ ok: false, error: 'Email is required.' }, { status: 400 })
    }

    const email = body.email.trim().toLowerCase()
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ ok: false, error: 'Enter a valid email address.' }, { status: 400 })
    }

    const role = typeof body.role === 'string' && VALID_ROLES.includes(body.role)
      ? body.role
      : 'unspecified'
    const sourceTier =
      typeof body.sourceTier === 'string' ? body.sourceTier.slice(0, 40) : null

    const supabase = createServiceClient()

    // Dedupe: if this email is already on the list, treat as success (idempotent).
    const { data: existing } = await supabase
      .from('md_agent_interest')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (!existing) {
      const { error: insertError } = await supabase.from('md_agent_interest').insert({
        email,
        role,
        source_tier: sourceTier,
        ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
        user_agent: req.headers.get('user-agent')?.slice(0, 300) ?? null,
      })
      if (insertError) throw insertError
    }

    const { count } = await supabase
      .from('md_agent_interest')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({ ok: true, count: count ?? 0, alreadyOnList: !!existing })
  } catch (error) {
    console.error('[agent-interest] POST error:', error)
    return NextResponse.json({ ok: false, error: 'Something went wrong. Try again.' }, { status: 500 })
  }
}
