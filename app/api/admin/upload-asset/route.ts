import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'
import { requireMdOwner } from '@/lib/md-owner-auth'

export async function POST(request: NextRequest) {
  try {
    const owner = await requireMdOwner()
    if (!owner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'assets'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Enforce 150 MB limit server-side
    const MAX_BYTES = 150 * 1024 * 1024
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File exceeds 150 MB limit' }, { status: 413 })
    }

    const pathname = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    const blob = await put(pathname, file, { access: 'public' })

    return NextResponse.json({ url: blob.url, pathname: blob.pathname, size: file.size })
  } catch (error) {
    console.error('[upload-asset]', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

// Allow large request bodies (Next.js default body limit is 4 MB)
export const config = {
  api: { bodyParser: false },
}
