import { Suspense } from 'react'
import MdNav from '@/components/md-nav'
import Footer from '@/components/footer'
import MdResetPasswordClient from '@/components/data/md-reset-password-client'

export const metadata = {
  title: 'Reset Password | Motorsport Data',
  description: 'Create a new password for your Motorsport Data account',
}

export default function ResetPasswordPage() {
  return (
    <>
      <MdNav />
      <main className="pt-14 min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <Suspense fallback={<div className="text-zinc-400">Loading...</div>}>
          <MdResetPasswordClient />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
