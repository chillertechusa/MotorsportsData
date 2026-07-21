import { type NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getSessionTeamId, assertFactoryTier } from '@/lib/md-auth'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_SIZE_BYTES = 250 * 1024 * 1024 // 250 MB
const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/mpeg']

export async function POST(req: NextRequest) {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isFactory = await assertFactoryTier(authResult.teamId)
  if (!isFactory) {
    return NextResponse.json({ error: 'Factory Rig required for video analysis.' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type. Upload MP4, MOV, AVI, or WebM.' }, { status: 400 })
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'File too large. Max 250 MB.' }, { status: 400 })
  }

  const teamId = authResult.teamId
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const pathname = `md-video/${teamId}/${Date.now()}-${safeName}`

  const blob = await put(pathname, file, { access: 'public' })

  return NextResponse.json({ url: blob.url, pathname: blob.pathname, filename: file.name })
}
