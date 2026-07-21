import { requireMdOwner } from '@/lib/md-owner-auth'
import { buildCeoSnapshot } from '@/lib/ceo-doctor'
import { CeoDoctorClient } from './ceo-doctor-client'

export const dynamic = 'force-dynamic'

export default async function CeoDoctorPage() {
  const owner = await requireMdOwner()
  const snapshot = await buildCeoSnapshot()
  return <CeoDoctorClient initialSnapshot={snapshot} ownerName={owner.name ?? 'Chief'} />
}
