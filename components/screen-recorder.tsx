'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Monitor, Circle, Square as StopIcon, Pause, Play,
  Download, Trash2, Mic, MicOff, Volume2, VolumeX,
  AlertTriangle, Video,
} from 'lucide-react'

type Phase = 'idle' | 'recording' | 'paused' | 'preview'

/** Pick the best supported container/codec for MediaRecorder. */
function pickMimeType(): string {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=h264,opus',
    'video/webm',
    'video/mp4',
  ]
  for (const type of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type
    }
  }
  return ''
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = Math.floor(totalSeconds % 60)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export default function ScreenRecorder() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [supported, setSupported] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [includeMic, setIncludeMic] = useState(false)
  const [includeSystemAudio, setIncludeSystemAudio] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultSize, setResultSize] = useState(0)
  const [fileExt, setFileExt] = useState('webm')

  // Live refs (not state) for stream/recorder machinery
  const displayStreamRef = useRef<MediaStream | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const previewVideoRef = useRef<HTMLVideoElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getDisplayMedia !== 'function' ||
      typeof MediaRecorder === 'undefined'
    ) {
      setSupported(false)
    }
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
  }, [stopTimer])

  /** Tear down every track / context we opened. */
  const cleanupStreams = useCallback(() => {
    displayStreamRef.current?.getTracks().forEach((t) => t.stop())
    micStreamRef.current?.getTracks().forEach((t) => t.stop())
    displayStreamRef.current = null
    micStreamRef.current = null
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {})
    }
    audioCtxRef.current = null
    if (previewVideoRef.current) previewVideoRef.current.srcObject = null
  }, [])

  const handleStop = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    stopTimer()
  }, [stopTimer])

  const startRecording = useCallback(async () => {
    setError(null)
    setResultUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    chunksRef.current = []
    setElapsed(0)

    const mimeType = pickMimeType()
    if (!mimeType) {
      setError('Your browser does not support any compatible recording format.')
      return
    }

    try {
      // 1. Capture the screen / window / tab (with system audio if allowed).
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: includeSystemAudio,
      })
      displayStreamRef.current = displayStream

      // If the user stops sharing via the browser's native bar, end cleanly.
      displayStream.getVideoTracks()[0]?.addEventListener('ended', () => handleStop())

      // 2. Optionally capture the microphone and mix audio tracks together.
      let combinedAudioTracks: MediaStreamTrack[] = displayStream.getAudioTracks()

      if (includeMic) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          micStreamRef.current = micStream

          const systemAudioTracks = displayStream.getAudioTracks()
          if (systemAudioTracks.length > 0) {
            // Mix system audio + mic into one track via Web Audio.
            const audioCtx = new AudioContext()
            audioCtxRef.current = audioCtx
            const destination = audioCtx.createMediaStreamDestination()
            audioCtx.createMediaStreamSource(new MediaStream(systemAudioTracks)).connect(destination)
            audioCtx.createMediaStreamSource(micStream).connect(destination)
            combinedAudioTracks = destination.stream.getAudioTracks()
          } else {
            combinedAudioTracks = micStream.getAudioTracks()
          }
        } catch {
          setError('Microphone access was denied — recording screen audio only.')
        }
      }

      // 3. Build the final recording stream (video + mixed audio).
      const recordStream = new MediaStream([
        ...displayStream.getVideoTracks(),
        ...combinedAudioTracks,
      ])

      // 4. Live preview (muted to avoid feedback loops).
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = displayStream
        previewVideoRef.current.muted = true
        previewVideoRef.current.play().catch(() => {})
      }

      // 5. Kick off the recorder.
      const recorder = new MediaRecorder(recordStream, { mimeType })
      recorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const url = URL.createObjectURL(blob)
        setResultUrl(url)
        setResultSize(blob.size)
        setFileExt(mimeType.includes('mp4') ? 'mp4' : 'webm')
        setPhase('preview')
        cleanupStreams()
      }

      recorder.start(1000) // gather data every second
      setPhase('recording')
      startTimer()
    } catch (err) {
      cleanupStreams()
      const name = err instanceof Error ? err.name : ''
      if (name === 'NotAllowedError') {
        setError('Screen sharing permission was denied. Click "Start Recording" and choose a screen to share.')
      } else {
        setError(err instanceof Error ? err.message : 'Could not start screen recording.')
      }
      setPhase('idle')
    }
  }, [includeMic, includeSystemAudio, handleStop, startTimer, cleanupStreams])

  const pauseRecording = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.pause()
      stopTimer()
      setPhase('paused')
    }
  }, [stopTimer])

  const resumeRecording = useCallback(() => {
    if (recorderRef.current?.state === 'paused') {
      recorderRef.current.resume()
      startTimer()
      setPhase('recording')
    }
  }, [startTimer])

  const discardResult = useCallback(() => {
    setResultUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setResultSize(0)
    setElapsed(0)
    setPhase('idle')
  }, [])

  // Global cleanup on unmount.
  useEffect(() => {
    return () => {
      stopTimer()
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop()
      }
      cleanupStreams()
    }
  }, [stopTimer, cleanupStreams])

  const downloadName = `recording-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.${fileExt}`
  const isLive = phase === 'recording' || phase === 'paused'

  if (!supported) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-destructive" />
        <h2 className="mb-2 text-2xl font-black uppercase tracking-tight text-card-foreground">
          Browser Not Supported
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Your browser doesn&apos;t support the Screen Capture API. Please use a recent version of
          Chrome, Edge, or Firefox on a desktop computer.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      {/* Preview / stage */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black">
        {/* Live capture preview */}
        <video
          ref={previewVideoRef}
          className={`h-full w-full object-contain ${isLive ? 'block' : 'hidden'}`}
          playsInline
        />

        {/* Result playback */}
        {phase === 'preview' && resultUrl && (
          <video src={resultUrl} controls className="h-full w-full object-contain" />
        )}

        {/* Idle placeholder */}
        {phase === 'idle' && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center">
            <Monitor className="h-14 w-14 text-muted-foreground" strokeWidth={1.5} />
            <p className="max-w-sm text-muted-foreground leading-relaxed">
              Record your screen, a window, or a browser tab. Everything stays on your device —
              nothing is uploaded.
            </p>
          </div>
        )}

        {/* Recording indicator */}
        {isLive && (
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 backdrop-blur">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                phase === 'recording' ? 'animate-pulse bg-destructive' : 'bg-muted-foreground'
              }`}
            />
            <span className="font-mono text-sm tabular-nums text-white">{formatTime(elapsed)}</span>
            {phase === 'paused' && (
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Paused
              </span>
            )}
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <p className="text-sm leading-relaxed text-card-foreground">{error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="rounded-2xl border border-border bg-card p-5">
        {phase === 'idle' && (
          <div className="flex flex-col gap-5">
            {/* Audio options */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIncludeSystemAudio((v) => !v)}
                aria-pressed={includeSystemAudio}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                  includeSystemAudio
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-muted-foreground/60'
                }`}
              >
                {includeSystemAudio ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                System Audio
              </button>
              <button
                type="button"
                onClick={() => setIncludeMic((v) => !v)}
                aria-pressed={includeMic}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                  includeMic
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-muted-foreground/60'
                }`}
              >
                {includeMic ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                Microphone
              </button>
            </div>

            <button
              type="button"
              onClick={startRecording}
              className="flex items-center justify-center gap-2.5 rounded-xl bg-primary px-6 py-3.5 text-base font-bold uppercase tracking-wide text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Circle className="h-5 w-5 fill-current" />
              Start Recording
            </button>
          </div>
        )}

        {isLive && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {phase === 'recording' ? (
              <button
                type="button"
                onClick={pauseRecording}
                className="flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-bold uppercase tracking-wide text-card-foreground transition-colors hover:bg-muted"
              >
                <Pause className="h-4 w-4" />
                Pause
              </button>
            ) : (
              <button
                type="button"
                onClick={resumeRecording}
                className="flex items-center gap-2 rounded-xl border border-primary bg-primary/10 px-5 py-3 text-sm font-bold uppercase tracking-wide text-primary transition-colors hover:bg-primary/20"
              >
                <Play className="h-4 w-4" />
                Resume
              </button>
            )}
            <button
              type="button"
              onClick={handleStop}
              className="flex items-center gap-2 rounded-xl bg-destructive px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
            >
              <StopIcon className="h-4 w-4 fill-current" />
              Stop
            </button>
          </div>
        )}

        {phase === 'preview' && resultUrl && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Video className="h-4 w-4" />
              <span className="font-mono tabular-nums">
                {formatTime(elapsed)} · {(resultSize / (1024 * 1024)).toFixed(1)} MB · .{fileExt}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={resultUrl}
                download={downloadName}
                className="flex items-center gap-2.5 rounded-xl bg-primary px-6 py-3.5 text-base font-bold uppercase tracking-wide text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Download className="h-5 w-5" />
                Download
              </a>
              <button
                type="button"
                onClick={discardResult}
                className="flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:bg-muted hover:text-card-foreground"
              >
                <Trash2 className="h-4 w-4" />
                Discard
              </button>
              <button
                type="button"
                onClick={startRecording}
                className="flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-bold uppercase tracking-wide text-card-foreground transition-colors hover:bg-muted"
              >
                <Circle className="h-4 w-4" />
                Record Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
