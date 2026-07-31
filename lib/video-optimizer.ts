/**
 * Video optimization utilities for production deployment.
 * Detects browser format support and lazy-loads video assets.
 */

export interface VideoSource {
  src: string
  type: 'video/mp4' | 'video/webm'
}

export interface OptimizedVideoConfig {
  poster: string
  sources: VideoSource[]
  width: number
  height: number
  preload: 'none' | 'metadata' | 'auto'
}

/**
 * Detects if browser supports WebM format.
 * WebM is smaller/more efficient but has lower browser support.
 */
export function supportsWebM(): boolean {
  if (typeof window === 'undefined') return false
  const video = document.createElement('video')
  return video.canPlayType('video/webm') !== ''
}

/**
 * Detects if browser supports H.264 MP4 format.
 * MP4 has broader support but is larger.
 */
export function supportsMp4(): boolean {
  if (typeof window === 'undefined') return false
  const video = document.createElement('video')
  return video.canPlayType('video/mp4') !== ''
}

/**
 * Returns optimized video sources based on browser support.
 * Prefers WebM (smaller) if supported, falls back to MP4.
 */
export function getOptimizedVideoSources(
  baseUrl: string,
  format: 'webm' | 'mp4' | 'both' = 'both'
): VideoSource[] {
  const sources: VideoSource[] = []

  if ((format === 'webm' || format === 'both') && supportsWebM()) {
    sources.push({
      src: `${baseUrl}.webm`,
      type: 'video/webm',
    })
  }

  if ((format === 'mp4' || format === 'both') && supportsMp4()) {
    sources.push({
      src: `${baseUrl}.mp4`,
      type: 'video/mp4',
    })
  }

  // Fallback: if no format is detected, include both
  if (sources.length === 0) {
    sources.push(
      { src: `${baseUrl}.webm`, type: 'video/webm' },
      { src: `${baseUrl}.mp4`, type: 'video/mp4' }
    )
  }

  return sources
}

/**
 * Configuration for production hero video optimization.
 */
export function getHeroVideoConfig(): OptimizedVideoConfig {
  return {
    poster: '/assets/hero-background.png',
    sources: getOptimizedVideoSources('/assets/hero-background', 'both'),
    width: 1920,
    height: 1080,
    preload: 'metadata', // Load metadata only on initial page load, defer video until user interacts
  }
}
