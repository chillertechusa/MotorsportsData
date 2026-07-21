import type { Metadata } from 'next'

// Noindex — internal QA tool only, never surface in search engines
export const metadata: Metadata = {
  title: 'Test Accounts | Motorsport Data',
  robots: { index: false, follow: false },
}

export default function TestAccountsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
