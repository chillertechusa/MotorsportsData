import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getMdOwner } from '@/lib/md-owner-auth'
import ScreenRecorder from '@/components/screen-recorder'

export const metadata: Metadata = {
  title: 'Screen Recorder — Motorsport Data',
  description:
    'Record your screen, a window, or a browser tab with optional system audio and microphone. Free, no watermark, no upload — everything stays on your device.',
  robots: { index: false, follow: false },
}

export default async function ScreenRecorderPage() {
  const owner = await getMdOwner()
  if (!owner) redirect('/data/sign-in')

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 text-center">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-lime-400">
            Owner Tool
          </p>
          <h1 className="text-balance text-4xl font-black uppercase tracking-tight text-zinc-50 sm:text-5xl">
            Screen Recorder
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-pretty leading-relaxed text-zinc-400">
            Capture your screen for demos, ads, and walkthroughs. Records locally in your
            browser — free, no watermark, nothing ever leaves your device.
          </p>
        </header>

        <ScreenRecorder />

        <section className="mx-auto mt-10 max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono">
            How it works
          </h2>
          <ol className="flex flex-col gap-2 text-sm leading-relaxed text-zinc-300">
            <li>
              <span className="font-bold text-lime-400">1.</span> Toggle System Audio and/or
              Microphone depending on what you want in the recording.
            </li>
            <li>
              <span className="font-bold text-lime-400">2.</span> Click Start Recording, then pick
              the screen, window, or tab to share. To capture tab audio in Chrome/Edge, choose a
              tab and enable &quot;Share tab audio.&quot;
            </li>
            <li>
              <span className="font-bold text-lime-400">3.</span> Pause or stop anytime, then
              preview and download the file. Saves as .webm (or .mp4 where supported).
            </li>
          </ol>
        </section>
      </div>
    </main>
  )
}
