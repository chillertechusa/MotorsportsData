import { redirect } from 'next/navigation'

// Canonical Privacy Policy now lives at /legal/privacy (single source of truth,
// covers minors/COPPA and rider data ownership). This legacy route redirects to
// preserve any inbound links and bookmarks.
export default function PrivacyRedirect() {
  redirect('/legal/privacy')
}
