import { useState, useCallback } from 'react'

/**
 * Hook to verify a request with BotID before submission.
 * Returns a function to call before your form action — if it returns false, abort.
 *
 * Usage:
 * ```tsx
 * const checkBot = useBotID('/api/auth/botid-signup')
 * async function handleSubmit(e) {
 *   e.preventDefault()
 *   if (!(await checkBot())) return  // Bot detected
 *   // proceed with form submission
 * }
 * ```
 */
export function useBotID(endpoint: string) {
  const [botError, setBotError] = useState<string | null>(null)

  const check = useCallback(async (): Promise<boolean> => {
    setBotError(null)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (response.status === 401) {
        setBotError(
          'Your request appears to be automated. Please try again from a real device.',
        )
        return false
      }

      if (!response.ok) {
        const data = await response.json()
        setBotError(data.error ?? 'Verification failed. Please try again.')
        return false
      }

      return true
    } catch (error) {
      console.error('[v0] BotID check failed:', error)
      setBotError('Verification failed. Please check your connection and try again.')
      return false
    }
  }, [endpoint])

  return { check, botError }
}
