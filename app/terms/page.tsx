import { redirect } from 'next/navigation'

// Canonical Terms of Service now live at /legal/terms (single source of truth,
// records versioned consent in Neon). This legacy route redirects to preserve
// any inbound links and bookmarks.
export default function TermsRedirect() {
  redirect('/legal/terms')
}
