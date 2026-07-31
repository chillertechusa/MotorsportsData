import { initBotId } from 'botid/client/core'

initBotId({
  protect: [
    { path: '/api/auth/sign-up-protected', method: 'POST' },
    { path: '/api/md-feature-chat', method: 'POST' },
    { path: '/api/md-coach', method: 'POST' },
    { path: '/api/md-coaching', method: 'POST' },
    { path: '/api/md-coach-live/chat', method: 'POST' },
    { path: '/api/md-telemetry/coach-live-ai', method: 'POST' },
    { path: '/api/md-mechanic/setup-coach', method: 'POST' },
    { path: '/api/md-owner/ceo-doctor', method: 'POST' },
    { path: '/api/md-insight', method: 'POST' },
    { path: '/api/md-setup-ai', method: 'POST' },
    { path: '/api/md-rig-doctor', method: 'POST' },
    { path: '/api/scan-manual', method: 'POST' },
    { path: '/api/md-video-upload', method: 'POST' },
    { path: '/api/md-video-analyze', method: 'POST' },
    { path: '/api/md-owner/send-work-order-protected', method: 'POST' },
  ],
})
