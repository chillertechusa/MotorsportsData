'use server'

import { Resend } from 'resend'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import crypto from 'crypto'

export async function sendPasswordResetEmail(email: string) {
  try {
    // Verify API key is set
    if (!process.env.RESEND_API_KEY) {
      console.error('[v0] RESEND_API_KEY is not set in environment')
      return {
        success: false,
        error: 'Email service not configured. Please contact support.',
      }
    }

    // Instantiate Resend per request to always use the current env var
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Check if user exists
    const result = await db.execute(
      sql`SELECT id FROM "user" WHERE email = ${email} LIMIT 1`
    )

    if (!result.rows || result.rows.length === 0) {
      // Don't reveal if email exists for security
      return { success: true }
    }

    const userId = (result.rows[0] as any).id

    // Generate reset token (32 bytes = 64 hex chars)
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store reset token in database
    await db.execute(
      sql`UPDATE "user" SET "passwordResetToken" = ${token}, "passwordResetTokenExpiresAt" = ${expiresAt} WHERE id = ${userId}`
    )
    // Build reset link — always use the production custom domain so the email
    // link works regardless of which environment generated it (preview, local, prod)
    const baseUrl = 'https://motorsportsdata.io'
    const resetLink = `${baseUrl}/data/reset-password?token=${token}`

    // Send email with Resend
    const emailResponse = await resend.emails.send({
      from: 'Motorsport Data <noreply@motorsportsdata.io>',
      to: email,
      subject: 'Reset your Motorsport Data password',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; max-width: 600px;">
          <div style="background: #000; padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: #bfff00; font-size: 28px; margin: 0; font-weight: 900;">MOTORSPORT DATA</h1>
          </div>
          <div style="background: #f5f5f5; padding: 40px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #000; margin-top: 0; margin-bottom: 20px; font-size: 20px;">Reset Your Password</h2>
            <p style="color: #333; margin-bottom: 24px; line-height: 1.5;">
              We received a request to reset your Motorsport Data password. Click the button below to create a new password. This link expires in 1 hour.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetLink}" style="display: inline-block; padding: 12px 32px; background-color: #bfff00; color: #000; text-decoration: none; border-radius: 8px; font-weight: 900; font-size: 14px; letter-spacing: 0.05em;">
                RESET PASSWORD
              </a>
            </div>
            <p style="color: #666; font-size: 13px; margin-bottom: 12px; line-height: 1.5;">
              Or copy and paste this link in your browser:
            </p>
            <p style="color: #666; font-size: 12px; word-break: break-all; background: #fff; padding: 12px; border-radius: 6px; border-left: 3px solid #bfff00; margin-bottom: 24px;">
              ${resetLink}
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px; margin: 0;">
              If you didn't request this password reset, you can safely ignore this email or contact support if you have concerns.
            </p>
          </div>
        </div>
      `,
    })

    if (emailResponse.error) {
      console.error('Resend API error:', emailResponse.error)
      return {
        success: false,
        error: 'Failed to send reset email. Please try again.',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Password reset email error:', error)
    return {
      success: false,
      error: 'Failed to send reset email. Please try again.',
    }
  }
}
