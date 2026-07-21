import { NextResponse } from 'next/server'
import { getMdOwner } from '@/lib/md-owner-auth'

export async function GET() {
  const owner = await getMdOwner()
  return NextResponse.json({ isOwner: Boolean(owner) })
}
