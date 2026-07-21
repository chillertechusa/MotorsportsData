import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireMdOwner } from '@/lib/md-owner-auth'
import { getOwnerBackupCodesStatus } from '@/app/actions/owner-backup-codes'
import { OwnerBackupCodesClient } from '@/components/data/md-owner-backup-codes-client'

export const dynamic = 'force-dynamic'

export default async function OwnerBackupCodesPage() {
  // Hard gate — redirects non-owners to sign-in
  await requireMdOwner()
  const status = await getOwnerBackupCodesStatus()

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link
          href="/data/owner"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Owner Console
        </Link>

        <header className="mb-8">
          <h1 className="text-2xl font-bold text-foreground text-balance">Recovery Backup Codes</h1>
          <p className="mt-2 text-muted-foreground leading-relaxed text-pretty">
            One-time codes that let you reset your owner password if you lose access to email or your
            password. Keep them somewhere safe and private — anyone with a code can reset the account.
          </p>
        </header>

        <OwnerBackupCodesClient initialStatus={status} />
      </div>
    </main>
  )
}
