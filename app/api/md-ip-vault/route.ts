import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { mdCoachTemplates, mdCoachTemplateAccessLog } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getSessionTeamId } from '@/lib/md-auth'
import { headers } from 'next/headers'

// Lightweight XOR cipher for at-rest obfuscation.
// In production replace with AES-256 using a KMS-managed key.
const VAULT_KEY = process.env.VAULT_ENCRYPTION_KEY ?? 'md-vault-default-key-2026'

function simpleEncrypt(text: string): string {
  const key = VAULT_KEY
  let result = ''
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return Buffer.from(result, 'binary').toString('base64')
}

function simpleDecrypt(encoded: string): string {
  const key = VAULT_KEY
  const text = Buffer.from(encoded, 'base64').toString('binary')
  let result = ''
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return result
}

// GET /api/md-ip-vault — list all templates for the team
export async function GET(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { searchParams } = new URL(req.url)
  const templateId = searchParams.get('id')

  if (templateId) {
    // Fetch single template + decrypt content + log access
    const [template] = await db
      .select()
      .from(mdCoachTemplates)
      .where(and(eq(mdCoachTemplates.id, templateId), eq(mdCoachTemplates.teamId, auth.teamId)))
      .limit(1)

    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 })

    // Log access
    const hdrs = await headers()
    const ip = hdrs.get('x-forwarded-for') ?? hdrs.get('x-real-ip') ?? 'unknown'
    const ua = hdrs.get('user-agent') ?? ''
    await db.insert(mdCoachTemplateAccessLog).values({
      templateId,
      teamMemberId: auth.userId,
      ipAddress: ip,
      userAgent: ua,
      action: 'viewed',
    })

    // Decrypt content for authorized view
    let content: unknown = null
    try {
      content = JSON.parse(simpleDecrypt(template.encryptedContent))
    } catch {
      content = { raw: template.encryptedContent }
    }

    // Fetch access history for this template
    const accessLog = await db
      .select()
      .from(mdCoachTemplateAccessLog)
      .where(eq(mdCoachTemplateAccessLog.templateId, templateId))
      .orderBy(desc(mdCoachTemplateAccessLog.accessedAt))
      .limit(20)

    return NextResponse.json({ success: true, template: { ...template, content }, accessLog })
  }

  // List all templates (no content — just metadata)
  const templates = await db
    .select({
      id: mdCoachTemplates.id,
      name: mdCoachTemplates.name,
      type: mdCoachTemplates.type,
      accessLevel: mdCoachTemplates.accessLevel,
      displayWatermark: mdCoachTemplates.displayWatermark,
      createdAt: mdCoachTemplates.createdAt,
      updatedAt: mdCoachTemplates.updatedAt,
    })
    .from(mdCoachTemplates)
    .where(eq(mdCoachTemplates.teamId, auth.teamId))
    .orderBy(desc(mdCoachTemplates.updatedAt))

  return NextResponse.json({ success: true, templates })
}

// POST /api/md-ip-vault — create a new template
export async function POST(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await req.json()
  const { name, type, content, accessLevel, displayWatermark } = body

  if (!name || !type || !content) {
    return NextResponse.json({ error: 'name, type, and content are required' }, { status: 400 })
  }

  const contentStr = typeof content === 'string' ? content : JSON.stringify(content, null, 2)
  const encrypted = simpleEncrypt(contentStr)

  const [template] = await db
    .insert(mdCoachTemplates)
    .values({
      teamId: auth.teamId,
      name,
      type,
      encryptedContent: encrypted,
      accessLevel: accessLevel ?? 'team_only',
      displayWatermark: displayWatermark ?? true,
    })
    .returning()

  return NextResponse.json({ success: true, template })
}

// PATCH /api/md-ip-vault — update template metadata or content
export async function PATCH(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await req.json()
  const { id, name, type, content, accessLevel, displayWatermark } = body

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  // Verify ownership
  const [existing] = await db
    .select({ id: mdCoachTemplates.id })
    .from(mdCoachTemplates)
    .where(and(eq(mdCoachTemplates.id, id), eq(mdCoachTemplates.teamId, auth.teamId)))
    .limit(1)

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const encryptedContent = content
    ? simpleEncrypt(typeof content === 'string' ? content : JSON.stringify(content, null, 2))
    : undefined

  const [updated] = await db
    .update(mdCoachTemplates)
    .set({
      ...(name !== undefined && { name }),
      ...(type !== undefined && { type }),
      ...(accessLevel !== undefined && { accessLevel }),
      ...(displayWatermark !== undefined && { displayWatermark }),
      ...(encryptedContent !== undefined && { encryptedContent }),
      updatedAt: new Date(),
    })
    .where(eq(mdCoachTemplates.id, id))
    .returning()

  return NextResponse.json({ success: true, template: updated })
}

// DELETE /api/md-ip-vault — archive/delete a template
export async function DELETE(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await db
    .delete(mdCoachTemplates)
    .where(and(eq(mdCoachTemplates.id, id), eq(mdCoachTemplates.teamId, auth.teamId)))

  return NextResponse.json({ success: true })
}
