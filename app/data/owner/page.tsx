import { redirect } from 'next/navigation'
import { getMdOwner } from '@/lib/md-owner-auth'
import { getOwnerFinancials } from '@/app/actions/md-owner'
import OwnerConsoleClient from './owner-console-client'

export const metadata = {
  title: 'Owner Console — Motorsport Data',
  robots: { index: false, follow: false },
}

export default async function OwnerConsolePage() {
  const owner = await getMdOwner()
  if (!owner) redirect('/data/sign-in')

  const financials = await getOwnerFinancials()

  return <OwnerConsoleClient owner={owner} financials={financials} />
}
