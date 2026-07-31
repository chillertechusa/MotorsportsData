import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import MdLogo from '@/components/md-logo'
import { Button } from '@/components/ui/button'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    redirect('/auth/sign-in?redirect=/admin')
  }

  return (
    <div className="bg-zinc-950 text-zinc-50 min-h-screen">
      {/* Top navigation */}
      <nav className="border-b border-zinc-800 p-4 flex items-center justify-between">
        <MdLogo size="sm" showWordmark={true} asLink={true} />
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-500">{session.user.email}</span>
          <form action={async () => { 'use server'; await auth.api.signOut({ headers: await headers() }); redirect('/'); }}>
            <Button variant="ghost" size="sm" type="submit" className="text-zinc-400 hover:text-zinc-100">
              Sign Out
            </Button>
          </form>
        </div>
      </nav>
      {children}
    </div>
  )
}
