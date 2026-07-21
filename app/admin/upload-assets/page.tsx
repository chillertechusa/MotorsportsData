'use client'

import { useRef, useState, useCallback } from 'react'

interface UploadedFile {
  url: string
  pathname: string
  size: number
  name: string
}

function fmtBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadAssetsPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [uploaded, setUploaded] = useState<UploadedFile[]>([])
  const [copied, setCopied] = useState<string | null>(null)

  const uploadFile = useCallback(async (file: File) => {
    setError(null)
    setUploading(true)
    setProgress(0)

    // Use XHR so we get real upload progress on large files
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'hero')

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data: { url: string; pathname: string; size: number } = JSON.parse(xhr.responseText)
          setUploaded((prev) => [
            { url: data.url, pathname: data.pathname, size: data.size, name: file.name },
            ...prev,
          ])
          resolve()
        } else {
          let msg = 'Upload failed'
          try { msg = JSON.parse(xhr.responseText).error ?? msg } catch {}
          reject(new Error(msg))
        }
      })

      xhr.addEventListener('error', () => reject(new Error('Network error')))
      xhr.open('POST', '/api/admin/upload-asset')
      xhr.send(fd)
    }).catch((e: Error) => setError(e.message))

    setUploading(false)
    setProgress(0)
  }, [])

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files?.length) return
    uploadFile(files[0])
  }, [uploadFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const copy = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-zinc-100 uppercase tracking-tight leading-none mb-2"
          style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: '2rem' }}
        >
          Asset Uploader
        </h1>
        <p className="text-zinc-500 text-sm font-mono">
          Upload videos, images, or any media to Vercel Blob CDN. Max 150 MB per file.
        </p>
      </div>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop file here or click to browse"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-none px-8 py-16 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors ${
          dragging
            ? 'border-lime-400 bg-lime-400/5'
            : uploading
            ? 'border-zinc-700 bg-zinc-900/50 pointer-events-none'
            : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/30'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept="video/*,image/*"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {uploading ? (
          <div className="w-full max-w-sm space-y-3 text-center">
            <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
              Uploading... {progress}%
            </p>
            <div className="h-1 bg-zinc-800 w-full">
              <div
                className="h-1 bg-lime-400 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Upload icon */}
            <svg className="h-10 w-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <div className="text-center">
              <p className="text-zinc-300 text-sm font-semibold">
                Drop file here or <span className="text-lime-400">browse</span>
              </p>
              <p className="font-mono text-xs text-zinc-600 mt-1 uppercase tracking-widest">
                MP4, MOV, PNG, JPG — up to 150 MB
              </p>
            </div>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400 font-mono">
          {error}
        </div>
      )}

      {/* Uploaded files */}
      {uploaded.length > 0 && (
        <div className="space-y-3">
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Uploaded this session</p>
          {uploaded.map((f) => (
            <div
              key={f.url}
              className="border border-zinc-800 bg-zinc-900/50 px-4 py-3 flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-zinc-200 text-sm font-semibold truncate">{f.name}</p>
                <p className="font-mono text-xs text-zinc-500 mt-0.5 truncate">{f.url}</p>
                <p className="font-mono text-xs text-zinc-600 mt-0.5">{fmtBytes(f.size)}</p>
              </div>
              <button
                onClick={() => copy(f.url)}
                className="shrink-0 font-mono text-xs uppercase tracking-widest px-3 py-1.5 border border-zinc-700 text-zinc-300 hover:border-lime-400 hover:text-lime-400 transition-colors"
              >
                {copied === f.url ? 'Copied!' : 'Copy URL'}
              </button>
            </div>
          ))}

          <div className="border border-lime-400/20 bg-lime-400/5 px-4 py-3 space-y-1">
            <p className="font-mono text-xs text-lime-400 uppercase tracking-widest">Next step</p>
            <p className="text-sm text-zinc-400">
              Copy the URL above, then add it as{' '}
              <code className="text-zinc-200 bg-zinc-800 px-1 rounded text-xs">HERO_VIDEO_URL</code>{' '}
              in <strong className="text-zinc-300">Project Settings → Vars</strong>.
              The hero video will update on the next deploy — no code change needed.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
