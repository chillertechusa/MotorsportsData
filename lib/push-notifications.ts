import { db } from '@/lib/db'
import { mdNotifications } from '@/lib/db/schema'

export type NotificationType = 'co-pilot-alert' | 'expense-anomaly' | 'contract-expiry' | 'member-invite' | 'upgrade-reminder'

interface PushNotification {
  userId: string
  title: string
  body: string
  type: NotificationType
  link?: string
  metadata?: Record<string, any>
}

/**
 * Send a push notification to a user.
 * Stores in DB for retrieval via in-app notification center.
 * In production, also triggers Web Push API / service worker.
 */
export async function sendPushNotification(notification: PushNotification) {
  try {
    // Store in DB
    await db.insert(mdNotifications).values({
      userId: notification.userId,
      title: notification.title,
      body: notification.body,
      type: notification.type,
      link: notification.link,
      metadata: notification.metadata ? JSON.stringify(notification.metadata) : null,
      read: false,
      createdAt: new Date(),
    })

    // TODO: Integrate with Web Push API for actual push notification
    // const subscription = await getUserPushSubscription(notification.userId)
    // if (subscription) {
    //   await webpush.sendNotification(subscription, {
    //     title: notification.title,
    //     body: notification.body,
    //     icon: '/assets/icon-192x192.png',
    //     badge: '/assets/badge-72x72.png',
    //     tag: notification.type,
    //     data: { link: notification.link },
    //   })
    // }
  } catch (error) {
    console.error('[push-notifications] Failed to send notification:', error)
  }
}

/**
 * Co-pilot signal → push notification mapper.
 * Takes a co-pilot signal and sends the appropriate notification.
 */
export async function sendCoPilotNotification(
  userId: string,
  signal: {
    type: string
    severity: 'critical' | 'warning' | 'info'
    title: string
    description: string
    metadata?: Record<string, any>
  },
) {
  const typeMap: Record<string, NotificationType> = {
    'expense-anomaly': 'expense-anomaly',
    'contract-expiry': 'contract-expiry',
    'rider-readiness': 'co-pilot-alert',
    'schedule-conflict': 'co-pilot-alert',
    default: 'co-pilot-alert',
  }

  const notificationType = typeMap[signal.type] || typeMap.default

  await sendPushNotification({
    userId,
    title: signal.title,
    body: signal.description,
    type: notificationType,
    metadata: {
      severity: signal.severity,
      signalType: signal.type,
      ...signal.metadata,
    },
  })
}

/**
 * Get unread notifications for a user.
 */
export async function getUserNotifications(userId: string, limit = 20) {
  return await db
    .select()
    .from(mdNotifications)
    .where((notifications) => /* userId filter */)
    .orderBy((notifications) => notifications.createdAt)
    .limit(limit)
}

/**
 * Mark a notification as read.
 */
export async function markNotificationAsRead(notificationId: string) {
  await db
    .update(mdNotifications)
    .set({ read: true })
    .where((notifications) => /* id filter */)
}
