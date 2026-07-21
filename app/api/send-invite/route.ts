import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, team_id, role } = body

    if (!email || !team_id || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get Resend API key from environment
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      console.error('[v0] RESEND_API_KEY not configured')
      // Still return success - email sending is optional
      return NextResponse.json({ success: true, warning: 'Email service not configured' })
    }

    // Prepare email content
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://motorsportsdata.io'}/data/sign-in?mode=sign-up&team_id=${team_id}`
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #000; margin-bottom: 20px;">You're invited to join a team</h2>
        
        <p style="color: #666; line-height: 1.6;">
          You've been invited to join a team on Motorsports Dirt Platform with the role of <strong>${role.replace('_', ' ')}</strong>.
        </p>
        
        <p style="color: #666; line-height: 1.6; margin-top: 20px;">
          Click the button below to accept the invitation:
        </p>
        
        <a href="${inviteUrl}" style="
          display: inline-block;
          padding: 12px 24px;
          background-color: #84cc16;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin-top: 20px;
          font-weight: bold;
        ">
          Accept Invitation
        </a>
        
        <p style="color: #999; font-size: 12px; margin-top: 40px;">
          If you didn't expect this invitation, you can ignore this email.
        </p>
      </div>
    `

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@motorsportsdata.io',
        to: email,
        subject: 'Team Invitation - Motorsports Dirt Platform',
        html: emailHtml,
      }),
    })

    if (!resendResponse.ok) {
      const error = await resendResponse.json()
      console.error('[v0] Resend API error:', error)
      // Don't throw - email is optional
      return NextResponse.json({ success: true, warning: 'Member added but email delivery failed' })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Send invite error:', error)
    return NextResponse.json(
      { success: true, warning: 'Member added but email delivery failed' },
      { status: 200 }
    )
  }
}
