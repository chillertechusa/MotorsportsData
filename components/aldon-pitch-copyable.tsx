'use client'

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

const emailContent = `TO: aldon.baker@[domain]
FROM: [Your Team] — Motorsports Data
SUBJECT: Built For Coaches Like You — See How 3 Riders Went Podium Ready

---

Hi Aldon,

Your playbook is legendary. We watched how you took three different riders with three different skill sets and turned them into Regional competitors. The video analysis, the setup sheets, the game film sessions — that's the work that separates champions from the field.

We built something for you.

Motorsports Data Coach gives you one dashboard to manage your entire roster:

• Multi-Rider Tracking — All your athletes' performance data in one place. Setup deltas, lap times, progress trends. Cross-team coaching without losing control.

• Video Analysis with Telemetry — Frame-by-frame breakdowns with live g-force, throttle data, and body position overlays. Build your playbook library. Share reference footage with your team.

• Session Comparison — Side-by-side analysis. See what made the difference between a good run and a great one. AI insights that surface what to focus on next.

• Audit Trail — Every service note, every setup change, every session documented. Your institutional knowledge stays with you.

We built this specifically for professional coaches managing regional and factory riders. The demo shows exactly how it works.

WATCH THE 2-MINUTE DEMO → https://motorsportsdata.io/data/plans/coach

You'll see how to track three riders, compare their setups, analyze a championship-level session, and get AI coaching recommendations — exactly the workflow you already use, but digitized and organized.

If it resonates, we'd love to walk you through it.

---

Best regards,
[Your Name] | [Your Title]
Motorsports Data Coach Platform
[Email] | [Phone]`

export default function AldonPitchCopyable() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(emailContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Aldon Baker Pitch Email</h1>
        <p className="text-zinc-400">Copy and customize for your outreach</p>
      </div>

      <div className="relative">
        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-lime-400 text-zinc-950 font-bold rounded-lg hover:bg-lime-300 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy All
            </>
          )}
        </button>

        {/* Email Box */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 pt-16">
          <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap break-words leading-relaxed">
            {emailContent}
          </pre>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 space-y-4 text-zinc-400 text-sm">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <p className="font-bold text-zinc-300 mb-2">Before sending:</p>
          <ul className="space-y-1 text-xs">
            <li>• Replace [domain] with actual email domain</li>
            <li>• Replace [Your Team], [Your Name], [Your Title], [Email], [Phone]</li>
            <li>• Verify demo link is correct: https://motorsportsdata.io/data/plans/coach</li>
            <li>• Use professional email service (Gmail, Mailchimp, Constant Contact)</li>
            <li>• Send between 9am-12pm on Tuesday-Thursday for best open rates</li>
          </ul>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <p className="font-bold text-zinc-300 mb-2">Follow-up strategy:</p>
          <ul className="space-y-1 text-xs">
            <li>• Wait 3 days if no click, send follow-up email</li>
            <li>• Track demo page time (goal: 2+ minutes watched)</li>
            <li>• If he watches full demo, reach out within 24 hours with 1:1 offer</li>
            <li>• If no response after 7 days, try LinkedIn outreach</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
