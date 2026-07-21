'use server'

const INDEXNOW_API_KEY = '6ef3c7339f654a96b52269b874127173'
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorsportsdata.io'

/**
 * Submit URLs to IndexNow to notify search engines of new/updated content
 * Bing, Yandex, and other engines monitor this endpoint
 */
export async function submitUrlsToIndexNow(urls: string[]) {
  if (!urls || urls.length === 0) {
    return { success: false, message: 'No URLs provided' }
  }

  try {
    const payload = {
      host: new URL(BASE_URL).hostname, // e.g., 'motorsportsdata.io'
      key: INDEXNOW_API_KEY,
      urlList: urls,
    }

    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      return { success: true, message: `Submitted ${urls.length} URLs to IndexNow` }
    } else {
      const error = await response.text()
      return { success: false, message: `IndexNow error: ${response.status}` }
    }
  } catch (err) {
    return { success: false, message: 'Failed to submit to IndexNow' }
  }
}

/**
 * Submit your sitemap to IndexNow (bulk submit all public URLs at once)
 */
export async function submitSitemapToIndexNow() {
  const sitemapUrl = `${BASE_URL}/sitemap.xml`
  return submitUrlsToIndexNow([sitemapUrl])
}

/**
 * Submit a single URL (e.g., a newly published blog post, updated pricing page)
 */
export async function submitUrlToIndexNow(url: string) {
  // Ensure URL is absolute
  const absoluteUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`
  return submitUrlsToIndexNow([absoluteUrl])
}
