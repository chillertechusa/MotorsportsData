import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdSponsors } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getSessionTeamId } from '@/lib/md-auth'

export async function GET() {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const sponsors = await db
    .select()
    .from(mdSponsors)
    .where(eq(mdSponsors.teamId, auth.teamId))
    .orderBy(desc(mdSponsors.createdAt))

  return NextResponse.json({ success: true, sponsors })
}

export async function POST(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: {
    sponsorName?: string
    sponsorType?: string
    valueCents?: number
    season?: string
    status?: string
    deliverables?: string[]
    notes?: string
  }
  try { body = await req.json() } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const { sponsorName, sponsorType, valueCents, season, status, deliverables, notes } = body
  if (!sponsorName) return NextResponse.json({ success: false, error: 'sponsorName is required' }, { status: 400 })

  const [sponsor] = await db.insert(mdSponsors).values({
    teamId: auth.teamId,
    sponsorName,
    sponsorType: sponsorType ?? 'cash',
    valueCents: valueCents ?? 0,
    season: season ?? null,
    status: status ?? 'active',
    deliverables: deliverables ?? [],
    notes: notes ?? null,
  }).returning()

  return NextResponse.json({ success: true, sponsor })
}

export async function PATCH(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })

  let body: Partial<{ sponsorName: string; sponsorType: string; valueCents: number; season: string; status: string; deliverables: string[]; notes: string }>
  try { body = await req.json() } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const [updated] = await db.update(mdSponsors)
    .set({ ...body })
    .where(and(eq(mdSponsors.id, id), eq(mdSponsors.teamId, auth.teamId)))
    .returning()

  if (!updated) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true, sponsor: updated })
}

export async function DELETE(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })

  await db.delete(mdSponsors).where(and(eq(mdSponsors.id, id), eq(mdSponsors.teamId, auth.teamId)))
  return NextResponse.json({ success: true })
}
