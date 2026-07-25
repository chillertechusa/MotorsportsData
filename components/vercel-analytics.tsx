'use client'

import { Analytics, type BeforeSendEvent } from '@vercel/analytics/next'

const EXCLUSION_COOKIE = 'vercel_analytics_excluded'

export function VercelAnalytics() {
  return (
    <Analytics
      beforeSend={(event: BeforeSendEvent) =>
        document.cookie.split('; ').includes(`${EXCLUSION_COOKIE}=1`) ? null : event
      }
    />
  )
}
