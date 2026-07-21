import { get } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'

/**
 * GET /api/md-work-order-photo?pathname=work-orders/…
 * Serves private blob photos only to authenticated team members.
 * Enforces that the pathname starts with the caller's teamId so cross-team
 * access is structurally impossible even with a guessed pathname.
 */
export async function GET(request: NextRequest) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return new NextResponse('Unauthorized', { status: 401 })

  const pathname = request.nextUrl.searchParams.get('pathname')
  if (!pathname) return new NextResponse('Missing pathname', { status: 400 })

  // Scope check — path must be under this team's folder
  if (!pathname.startsWith(`work-orders/${auth.teamId}/`)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const result = await get(pathname, {
      access: 'private',
      ifNoneMatch: request.headers.get('if-none-match') ?? undefined,
    })

    if (!result) return new NextResponse('Not found', { status: 404 })

    if (result.statusCode === 304) {
      return new NextResponse(null, {
        status: 304,
        headers: { ETag: result.blob.etag, 'Cache-Control': 'private, no-cache' },
      })
    }

    return new NextResponse(result.stream, {
      headers: {
        'Content-Type': result.blob.contentType,
        ETag: result.blob.etag,
        'Cache-Control': 'private, no-cache',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
