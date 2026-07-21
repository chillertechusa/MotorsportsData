import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'

export async function POST(request: NextRequest) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const workOrderId = formData.get('workOrderId') as string | null

  if (!file || !workOrderId) {
    return NextResponse.json({ error: 'file and workOrderId required' }, { status: 400 })
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
  }

  // Limit to 10MB
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const pathname = `work-orders/${auth.teamId}/${workOrderId}/${Date.now()}.${ext}`

  const blob = await put(pathname, file, { access: 'private' })

  return NextResponse.json({ pathname: blob.pathname })
}
