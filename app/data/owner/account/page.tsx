import { requireMdOwner } from '@/lib/md-owner-auth'
import { AccountSettingsClient } from './account-settings-client'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Account Settings | Owner Console',
  robots: { index: false, follow: false },
}

export default async function OwnerAccountPage() {
  const owner = await requireMdOwner()
  return <AccountSettingsClient email={owner.email} name={owner.name} />
}
