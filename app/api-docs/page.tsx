import Link from 'next/link'

export const metadata = {
  title: 'API Documentation | Motorsports Data',
  description: 'Complete API reference for Motorsports Data platform',
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Motorsports Data API</h1>
          <p className="text-zinc-400 text-lg">
            Complete REST API reference for the Motorsports Data platform. All endpoints require authentication.
          </p>
        </div>

        {/* Authentication */}
        <section className="mb-12 border border-zinc-800 rounded-lg p-8 bg-zinc-900">
          <h2 className="text-2xl font-bold mb-4">Authentication</h2>
          <p className="text-zinc-400 mb-4">
            All API endpoints require a valid session token from Better Auth. Include the session cookie in requests.
          </p>
          <pre className="bg-zinc-800 p-4 rounded text-sm overflow-x-auto">
{`curl https://motorsportsdata.io/api/md-sessions \\
  -H "Cookie: auth_token=YOUR_TOKEN"`}
          </pre>
        </section>

        {/* Core APIs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Core APIs</h2>
          
          <ApiEndpoint
            method="GET"
            path="/api/health"
            title="Health Check"
            description="Server status and environment info"
          />

          <ApiEndpoint
            method="GET"
            path="/api/md-sessions"
            title="List Sessions"
            description="Get all sessions for the authenticated team"
          />

          <ApiEndpoint
            method="POST"
            path="/api/md-sessions"
            title="Create Session"
            description="Log a new training or race session"
          />

          <ApiEndpoint
            method="POST"
            path="/api/md-sessions/export-pdf"
            title="Export Session PDF"
            description="Generate PDF report for a session"
          />
        </section>

        {/* Telemetry APIs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Telemetry APIs</h2>
          
          <ApiEndpoint
            method="POST"
            path="/api/md-telemetry/ingest"
            title="Ingest Telemetry"
            description="Stream live telemetry data (GPS, throttle, brake, lean angle, etc.)"
            notes="Rate limited: 10 updates/sec per device"
          />

          <ApiEndpoint
            method="GET"
            path="/api/md-telemetry/live"
            title="Get Live Telemetry"
            description="Retrieve current telemetry stream for a session"
          />

          <ApiEndpoint
            method="POST"
            path="/api/md-telemetry/coach-live-ai"
            title="Coach Live AI"
            description="Get real-time AI coaching recommendations based on live telemetry"
          />

          <ApiEndpoint
            method="POST"
            path="/api/md-devices/sync-biometrics"
            title="Sync Biometrics"
            description="Synchronize HR, HRV, and recovery data from wearables via Terra"
          />
        </section>

        {/* Analytics APIs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Analytics APIs (Race Team+)</h2>
          
          <ApiEndpoint
            method="GET"
            path="/api/md-analytics/team-trends"
            title="Team Performance Trends"
            description="Weekly team metrics: best lap times, session count, readiness"
            tier="Race Team, Factory Rig"
          />

          <ApiEndpoint
            method="GET"
            path="/api/md-analytics/rider-comparisons"
            title="Rider Comparisons"
            description="Per-rider performance metrics and improvement trends"
            tier="Race Team, Factory Rig"
          />

          <ApiEndpoint
            method="GET"
            path="/api/md-analytics/setup-impact"
            title="Setup Impact Analysis"
            description="Correlate setup changes with lap time improvements"
            tier="Race Team, Factory Rig"
          />

          <ApiEndpoint
            method="GET"
            path="/api/md-analytics/coach-effectiveness"
            title="Coach Effectiveness Metrics"
            description="Coaching ROI: readiness accuracy, rider improvements, setup success rate"
            tier="Factory Rig"
          />

          <ApiEndpoint
            method="POST"
            path="/api/md-analytics/export-pdf"
            title="Export Analytics PDF"
            description="Generate professional team performance report for sponsors/owners"
            tier="Race Team, Factory Rig"
          />
        </section>

        {/* Coaching APIs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Coaching APIs</h2>
          
          <ApiEndpoint
            method="GET"
            path="/api/md-ip-vault"
            title="IP Vault Templates"
            description="Access encrypted proprietary coaching templates (setup sheets, periodization)"
          />

          <ApiEndpoint
            method="POST"
            path="/api/md-coach"
            title="Coach AI"
            description="Get AI-powered coaching recommendations (readiness, setup, technique)"
          />

          <ApiEndpoint
            method="GET"
            path="/api/md-readiness"
            title="Readiness Score"
            description="Get predicted readiness for upcoming race (0-100, based on sleep/HRV/training volume)"
          />

          <ApiEndpoint
            method="GET"
            path="/api/md-accountability"
            title="Assignment Audit Trail"
            description="Immutable log of all coaching assignments and acknowledgments"
          />
        </section>

        {/* Team Management APIs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Team Management APIs</h2>
          
          <ApiEndpoint
            method="GET"
            path="/api/md-team"
            title="Get Team Info"
            description="Team name, subscription tier, members, settings"
          />

          <ApiEndpoint
            method="GET"
            path="/api/md-fleet"
            title="List Vehicles"
            description="All motorcycles registered to the team"
          />

          <ApiEndpoint
            method="POST"
            path="/api/md-fleet"
            title="Create Vehicle"
            description="Add a new motorcycle to the team fleet"
          />

          <ApiEndpoint
            method="GET"
            path="/api/md-parts/[partId]"
            title="Get Part Details"
            description="Component specs, maintenance history, wear tracking"
          />
        </section>

        {/* Device Integration APIs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Device Integration APIs</h2>
          
          <ApiEndpoint
            method="POST"
            path="/api/md-devices/widget-session"
            title="Terra Widget Session"
            description="Generate OAuth session for rider to connect wearable (Garmin, Polar, Apple Watch, etc.)"
          />

          <ApiEndpoint
            method="POST"
            path="/api/md-devices/terra-callback"
            title="Terra Webhook Callback"
            description="Receive real-time biometric data from Terra API (HR, HRV, sleep)"
          />

          <ApiEndpoint
            method="POST"
            path="/api/md-devices/sync-biometrics"
            title="Sync Biometrics"
            description="Manually trigger biometric sync from all connected wearables"
          />

          <ApiEndpoint
            method="POST"
            path="/api/md-telemetry/import"
            title="Import Telemetry"
            description="Upload telemetry files (CSV, GPX, FIT, TCX) from devices like RaceBox, AiM, etc."
          />
        </section>

        {/* Additional Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Additional Features</h2>
          
          <ApiEndpoint
            method="GET"
            path="/api/md-weather"
            title="Track Weather"
            description="Live track conditions (temperature, humidity, wind) from Open-Meteo"
          />

          <ApiEndpoint
            method="POST"
            path="/api/md-setup-ai"
            title="Setup Recommendations"
            description="AI suggests suspension/tire changes based on track conditions and rider data"
          />

          <ApiEndpoint
            method="GET"
            path="/api/md-progression"
            title="Rider Progression"
            description="Career stats: races, best laptimes, improvement trajectory, wins"
          />

          <ApiEndpoint
            method="POST"
            path="/api/md-mental"
            title="Mental Training Log"
            description="Track mental state, confidence, pressure management before races"
          />

          <ApiEndpoint
            method="POST"
            path="/api/md-nutrition"
            title="Nutrition Tracking"
            description="Log meals, hydration, supplements, and correlate with performance"
          />
        </section>

        {/* Rate Limits */}
        <section className="mb-12 border border-zinc-800 rounded-lg p-8 bg-zinc-900">
          <h2 className="text-2xl font-bold mb-4">Rate Limits</h2>
          <ul className="text-zinc-400 space-y-2">
            <li>Auth endpoints: 10 requests / 5 minutes</li>
            <li>Telemetry ingest: 10 updates / second per device</li>
            <li>Analytics queries: 30 requests / minute</li>
            <li>Standard endpoints: 100 requests / minute</li>
          </ul>
        </section>

        {/* Status Codes */}
        <section className="mb-12 border border-zinc-800 rounded-lg p-8 bg-zinc-900">
          <h2 className="text-2xl font-bold mb-4">HTTP Status Codes</h2>
          <div className="space-y-3 text-zinc-400">
            <div><span className="font-mono text-lime-400">200</span> — Success</div>
            <div><span className="font-mono text-zinc-300">400</span> — Bad request (validation error)</div>
            <div><span className="font-mono text-zinc-300">401</span> — Unauthorized (missing/invalid session)</div>
            <div><span className="font-mono text-zinc-300">403</span> — Forbidden (insufficient tier/permissions)</div>
            <div><span className="font-mono text-zinc-300">429</span> — Rate limited</div>
            <div><span className="font-mono text-red-400">500</span> — Server error (check Sentry)</div>
          </div>
        </section>

        {/* Support */}
        <section className="mb-12 border border-zinc-800 rounded-lg p-8 bg-zinc-900">
          <h2 className="text-2xl font-bold mb-4">Support</h2>
          <p className="text-zinc-400">
            For API issues, check the{' '}
            <a href="https://sentry.io" target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:text-lime-300">
              Sentry error logs
            </a>
            {' '}or contact support at support@motorsportsdata.io
          </p>
        </section>
      </div>
    </div>
  )
}

function ApiEndpoint({
  method,
  path,
  title,
  description,
  tier,
  notes,
}: {
  method: string
  path: string
  title: string
  description: string
  tier?: string
  notes?: string
}) {
  const methodColor =
    method === 'GET'
      ? 'text-blue-400'
      : method === 'POST'
        ? 'text-green-400'
        : method === 'PUT'
          ? 'text-amber-400'
          : 'text-red-400'

  return (
    <div className="mb-6 border border-zinc-800 rounded-lg p-6 bg-zinc-800/50 hover:bg-zinc-800 transition">
      <div className="flex items-start gap-4 mb-3">
        <span className={`font-mono font-bold ${methodColor} text-sm px-3 py-1 bg-zinc-900 rounded`}>
          {method}
        </span>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">{title}</h3>
          <p className="font-mono text-zinc-400 text-sm">{path}</p>
        </div>
      </div>
      <p className="text-zinc-300 mb-3">{description}</p>
      {tier && <p className="text-xs text-amber-400 mb-2">Tier: {tier}</p>}
      {notes && <p className="text-xs text-zinc-500">Note: {notes}</p>}
    </div>
  )
}
