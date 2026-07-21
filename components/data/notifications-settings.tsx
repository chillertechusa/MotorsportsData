'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { usePushNotifications } from '@/lib/hooks/use-push-notifications'

export function NotificationsSettings() {
  const { isSupported, subscription, subscribe, unsubscribe } = usePushNotifications()
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      if (subscription) {
        await unsubscribe()
      } else {
        await subscribe()
      }
    } catch (e) {
      console.error('Failed to toggle notifications:', e)
    } finally {
      setLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-lg font-black text-zinc-100 mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5" /> Push Notifications
        </h3>
        <p className="text-zinc-400 text-sm">Push notifications are not supported in your browser.</p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h3 className="text-lg font-black text-zinc-100 mb-4 flex items-center gap-2">
        <Bell className="h-5 w-5" /> Push Notifications
      </h3>

      <p className="text-zinc-400 text-sm mb-6">
        {subscription
          ? 'You&apos;ll receive alerts when teammates log faster laps and other team events.'
          : 'Enable notifications to get alerts about session records, team events, and coaching tips.'}
      </p>

      <button
        onClick={handleToggle}
        disabled={loading}
        className={`px-6 py-3 font-black uppercase tracking-widest rounded text-sm transition-colors ${
          subscription
            ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:opacity-50'
            : 'bg-lime-400 text-zinc-950 hover:bg-lime-300 disabled:opacity-50'
        }`}
      >
        {loading ? 'Updating...' : subscription ? 'Disable Notifications' : 'Enable Notifications'}
      </button>

      {subscription && (
        <p className="text-xs text-green-400 mt-4 font-mono">✓ Notifications enabled</p>
      )}
    </div>
  )
}
