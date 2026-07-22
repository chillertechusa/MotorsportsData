import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OwnerSidebar from '@/components/owner/OwnerSidebar'

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/data/owner/login')

  // Check admin_users allowlist
  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('id, role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!adminRow) redirect('/data/owner/login')

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <OwnerSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
