import { redirect } from 'next/navigation'

// Safety-net redirect: the real auth lives at /data/sign-in. This guarantees any
// legacy or shared /account/sign-up link forwards to the working signup form
// instead of 404ing.
export default async function AccountSignUpRedirect({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect: redirectTo } = await searchParams
  const suffix = redirectTo ? `&redirect=${encodeURIComponent(redirectTo)}` : ''
  redirect(`/data/sign-in?mode=sign-up${suffix}`)
}
