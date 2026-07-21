// Route segment config — force dynamic so Next.js doesn't try to statically
// prerender this page at build time (it imports a server action that needs runtime env vars).
export const dynamic = 'force-dynamic'

import TestAccountsClient from './test-accounts-client'

export default function TestAccountsPage() {
  return <TestAccountsClient />
}
