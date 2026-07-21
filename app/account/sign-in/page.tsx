import { redirect } from 'next/navigation'

// Safety-net redirect: the real auth lives at /data/sign-in. This guarantees any
// legacy or shared /account/sign-in link forwards to the working sign-in form
// instead of 404ing.
export default async function AccountSignInRedirect({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect: redirectTo } = await searchParams
  const suffix = redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''
  redirect(`/data/sign-in${suffix}`)
}
