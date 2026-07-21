export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <h1 className="text-6xl font-bold font-barlow-condensed text-[#c8f135] mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8">Page not found.</p>
      <a href="/" className="text-[#c8f135] underline underline-offset-4 hover:opacity-80 transition-opacity">
        Back to home
      </a>
    </main>
  )
}
