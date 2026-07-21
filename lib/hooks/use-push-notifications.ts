'use client'

import { useEffect, useState } from 'react'

interface PushSubscriptionJSON {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export function usePushNotifications() {
  const [subscription, setSubscription] = useState<PushSubscriptionJSON | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if Push Notifications are supported
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
    setIsSupported(supported)

    if (supported) {
      // Request notification permission
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }

      // Get existing subscription
      navigator.serviceWorker.ready.then(async (registration) => {
        const sub = await registration.pushManager.getSubscription()
        if (sub) {
          setSubscription(sub.toJSON() as PushSubscriptionJSON)
          // Register subscription on backend
          await registerSubscription(sub.toJSON() as PushSubscriptionJSON)
        }
      })
    }
  }, [])

  const subscribe = async () => {
    if (!isSupported) return

    try {
      const registration = await navigator.serviceWorker.ready

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''),
      })

      const subJSON = subscription.toJSON() as PushSubscriptionJSON
      setSubscription(subJSON)

      // Send to backend
      await registerSubscription(subJSON)
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
    }
  }

  const unsubscribe = async () => {
    if (!subscription) return

    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.getSubscription()

      if (sub) {
        await sub.unsubscribe()
        setSubscription(null)

        // Notify backend
        await fetch('/api/push-subscriptions', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        })
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
    }
  }

  return {
    isSupported,
    subscription,
    subscribe,
    unsubscribe,
  }
}

async function registerSubscription(subscription: PushSubscriptionJSON) {
  try {
    await fetch('/api/push-subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    })
  } catch (error) {
    console.error('Failed to register push subscription:', error)
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
