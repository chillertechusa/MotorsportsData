import type { Metadata } from 'next'
import { RiderDesktopNavigation, RiderMobileHeader } from '@/components/data/rider-navigation'

export const metadata: Metadata = {
  title: 'Family Command Center',
  description: 'The Martinez family racing command center for bikes, bodies, money, and race weekends.',
}

export default function RiderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <RiderMobileHeader />
      <div className="flex">
        <RiderDesktopNavigation />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
