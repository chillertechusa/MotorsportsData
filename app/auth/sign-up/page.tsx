import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return {
    title: 'Create Account — Motorsport Data',
    robots: { index: false, follow: false },
  }
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect: redirectTo } = await searchParams

  // Already signed in — send to dashboard
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) {
    redirect(redirectTo ?? '/data/rider')
  }

  // Redirect to the unified sign-in page in sign-up mode
  redirect(`/data/sign-in?mode=sign-up${redirectTo ? `&redirect=${encodeURIComponent(redirectTo)}` : ''}`)
}
