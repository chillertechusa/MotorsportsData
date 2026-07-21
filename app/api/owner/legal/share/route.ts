import { NextRequest, NextResponse } from 'next/server'
import { requireMdOwner } from '@/lib/md-owner-auth'
import crypto from 'crypto'

// In-memory share links store (in production, use database)
const shareLinks = new Map<string, {
  docId: string
  token: string
  createdAt: Date
  expiresAt: Date
}>()

export async function POST(request: NextRequest) {
  try {
    // Verify owner authorization
    const user = await requireMdOwner()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { docId, expiresInDays = 7 } = await request.json()

    if (!docId || !['terms', 'privacy', 'cookies'].includes(docId)) {
      return NextResponse.json({ error: 'Invalid document' }, { status: 400 })
    }

    // Generate unique token
    const token = crypto.randomBytes(16).toString('hex')
    const createdAt = new Date()
    const expiresAt = new Date(createdAt.getTime() + expiresInDays * 24 * 60 * 60 * 1000)

    // Store share link
    shareLinks.set(token, {
      docId,
      token,
      createdAt,
      expiresAt,
    })

    const shareLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://motorsportsdata.io'}/legal/shared/${token}`

    return NextResponse.json({
      shareLink,
      expiresAt: expiresAt.toISOString(),
      docId,
    })
  } catch (error) {
    console.error('[v0] Share link creation error:', error)
    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Invalid or missing token' }, { status: 400 })
    }

    const link = shareLinks.get(token)

    if (!link) {
      return NextResponse.json({ error: 'Share link not found' }, { status: 404 })
    }

    // Check expiration
    if (new Date() > link.expiresAt) {
      shareLinks.delete(token)
      return NextResponse.json({ error: 'Share link expired' }, { status: 410 })
    }

    return NextResponse.json({
      docId: link.docId,
      createdAt: link.createdAt,
      expiresAt: link.expiresAt,
    })
  } catch (error) {
    console.error('[v0] Share link validation error:', error)
    return NextResponse.json({ error: 'Failed to validate share link' }, { status: 500 })
  }
}
