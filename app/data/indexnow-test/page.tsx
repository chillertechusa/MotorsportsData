'use client'

import { useState } from 'react'
import { submitUrlsToIndexNow, submitSitemapToIndexNow, submitUrlToIndexNow } from '@/app/actions/submit-indexnow'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export default function IndexNowTestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [urlInput, setUrlInput] = useState('')

  const handleSubmitSitemap = async () => {
    setLoading(true)
    setResult(null)
    const res = await submitSitemapToIndexNow()
    setResult(res)
    setLoading(false)
  }

  const handleSubmitSingleUrl = async () => {
    if (!urlInput.trim()) {
      setResult({ success: false, message: 'Enter a URL' })
      return
    }
    setLoading(true)
    setResult(null)
    const res = await submitUrlToIndexNow(urlInput)
    setResult(res)
    setLoading(false)
    setUrlInput('')
  }

  const handleSubmitMultipleUrls = async () => {
    const urls = [
      'https://motorsportsdata.io/',
      'https://motorsportsdata.io/data',
      'https://motorsportsdata.io/data/pricing',
      'https://motorsportsdata.io/shop',
    ]
    setLoading(true)
    setResult(null)
    const res = await submitUrlsToIndexNow(urls)
    setResult(res)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2 text-lime-400">IndexNow Test</h1>
        <p className="text-xs text-zinc-500 mb-8">
          Notify Bing, Yandex, and other search engines of new/updated URLs
        </p>

        <div className="space-y-6 bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          {/* Sitemap Submit */}
          <div>
            <h2 className="font-bold text-sm mb-3 text-zinc-300">1. Submit Sitemap</h2>
            <p className="text-xs text-zinc-500 mb-3">
              Posts your entire sitemap.xml to IndexNow (bulk all URLs at once)
            </p>
            <button
              onClick={handleSubmitSitemap}
              disabled={loading}
              className="px-4 py-2 bg-lime-400 text-zinc-950 font-bold text-xs rounded uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit Sitemap
            </button>
          </div>

          {/* Single URL Submit */}
          <div>
            <h2 className="font-bold text-sm mb-3 text-zinc-300">2. Submit Single URL</h2>
            <p className="text-xs text-zinc-500 mb-3">
              Submit a recently updated URL (e.g., new pricing, updated blog post)
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., /data/pricing"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-100 placeholder-zinc-600"
              />
              <button
                onClick={handleSubmitSingleUrl}
                disabled={loading || !urlInput.trim()}
                className="px-4 py-2 bg-zinc-700 text-zinc-100 font-bold text-xs rounded uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          </div>

          {/* Bulk Test URLs */}
          <div>
            <h2 className="font-bold text-sm mb-3 text-zinc-300">3. Submit Test URLs</h2>
            <p className="text-xs text-zinc-500 mb-3">
              Quick test with common pages
            </p>
            <button
              onClick={handleSubmitMultipleUrls}
              disabled={loading}
              className="px-4 py-2 bg-zinc-700 text-zinc-100 font-bold text-xs rounded uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit Test URLs
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${result.success ? 'bg-lime-950 border border-lime-700' : 'bg-red-950 border border-red-700'}`}>
            {result.success ? (
              <CheckCircle2 className="h-5 w-5 text-lime-400 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className={`text-sm font-bold ${result.success ? 'text-lime-300' : 'text-red-300'}`}>
                {result.success ? 'Success' : 'Error'}
              </p>
              <p className="text-xs text-zinc-300">{result.message}</p>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 text-xs text-zinc-500 space-y-2 bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <p>
            <strong>API Key:</strong> {process.env.NEXT_PUBLIC_SITE_URL ? 'Configured' : 'Not configured'}
          </p>
          <p>
            <strong>Key File:</strong> /.well-known/indexnow/6ef3c7339f654a96b52269b874127173.txt
          </p>
          <p>
            <strong>Supported Engines:</strong> Bing, Yandex (Google not supported, use GSC instead)
          </p>
        </div>
      </div>
    </main>
  )
}
