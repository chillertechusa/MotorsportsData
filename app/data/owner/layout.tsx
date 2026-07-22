import { redirect } from 'next/navigation'
import { getMdOwner } from '@/lib/md-owner-auth'
import OwnerSidebar from '@/components/owner/OwnerSidebar'

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const owner = await getMdOwner()
  if (!owner) redirect('/data/owner/login')

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <OwnerSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
