import { redirect } from 'next/navigation'
import { getMdOwner } from '@/lib/md-owner-auth'
import { getOwnerFinancials } from '@/app/actions/md-owner'
import InvestorDashboardClient from './investor-dashboard-client'

export const metadata = {
  title: 'Investor Dashboard — Motorsport Data',
  description: 'Real-time platform metrics for investors and stakeholders.',
  robots: { index: false, follow: false },
}

export default async function InvestorPage() {
  const owner = await getMdOwner()
  if (!owner) redirect('/data/sign-in')

  const financials = await getOwnerFinancials()

  return <InvestorDashboardClient financials={financials} ownerEmail={owner.email} />
}
