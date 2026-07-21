import MdNav from '@/components/md-nav'
import Footer from '@/components/footer'
import MdForgotPasswordClient from '@/components/data/md-forgot-password-client'

export const metadata = {
  title: 'Reset Password | Motorsport Data',
  description: 'Reset your Motorsport Data password',
}

export default function ForgotPasswordPage() {
  return (
    <>
      <MdNav />
      <main className="pt-14 min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <MdForgotPasswordClient />
      </main>
      <Footer />
    </>
  )
}
