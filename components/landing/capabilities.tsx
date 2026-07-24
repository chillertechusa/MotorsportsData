import {
  Timer, Wrench, HeartPulse, DollarSign, Users,
  Brain, BarChart3, FileText, Truck, Link2,
} from 'lucide-react'

const CAPABILITIES = [
  {
    icon: Timer,
    title: 'Lap & Telemetry',
    body: 'Session data, lap splits, speed, G-force, suspension travel. Import from data-loggers or enter manually. Trend every metric across events.',
  },
  {
    icon: Wrench,
    title: 'Bike & Setup Log',
    body: 'Part lifecycle tracking, suspension settings, engine hours, rebuild records. Every change tied to a session result.',
  },
  {
    icon: Brain,
    title: 'AI Race Engineer',
    body: 'Rig Doctor AI reads your data and recommends setup changes, flags fatigue, and coaches your rider between motos.',
  },
  {
    icon: HeartPulse,
    title: 'Rider Health & Readiness',
    body: 'Sleep, HRV, injury log, and readiness score before every gate drop. Correlate rider condition with lap-time variance.',
  },
  {
    icon: DollarSign,
    title: 'Race Budget & Expenses',
    body: 'Log every dollar: entry fees, travel, parts, fuel, lodging. P&L by event or season. Know your true cost-per-moto.',
  },
  {
    icon: FileText,
    title: 'Invoicing',
    body: 'Bill sponsors, clients, and customers directly from the platform. Branded invoices, payment tracking, and reminders.',
  },
  {
    icon: Users,
    title: 'Team Operations',
    body: 'Multiple riders, mechanics, coaches, and crew. Role-based access. Assign work orders. Track hours and accountability.',
  },
  {
    icon: BarChart3,
    title: 'Sponsor ROI Reports',
    body: 'Auto-generate exposure reports with social reach, gate results, and media coverage. Give sponsors something to bring back.',
  },
  {
    icon: Truck,
    title: 'Payroll & Staff',
    body: 'Pay your mechanics and staff. Export directly to QuickBooks or your payroll processor. Because racing is a business.',
  },
  {
    icon: Link2,
    title: 'Integrations',
    body: 'QuickBooks, ADP payroll, GPS telematics, and an open API for factory operations. Connect your existing tools.',
  },
]

export default function Capabilities() {
  return (
    <section id="capabilities" className="bg-zinc-900 border-t border-zinc-800 py-24 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
          <p className="font-mono text-xs text-lime-400 uppercase tracking-[0.3em] mb-4">
            // one platform
          </p>
          <h2
            className="text-zinc-100 uppercase leading-none tracking-tight text-balance mb-5"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            Everything Your Race Business Runs On
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            From lap times to payroll, telemetry to invoices&mdash;one login, zero spreadsheets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-800">
          {CAPABILITIES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col gap-4 bg-zinc-900 p-7 hover:bg-zinc-800/60 transition-colors">
              <div className="flex items-center justify-center h-10 w-10 border border-zinc-700 bg-zinc-950">
                <Icon className="h-5 w-5 text-lime-400" aria-hidden="true" />
              </div>
              <h3
                className="text-zinc-100 text-lg uppercase leading-tight"
                style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 800 }}
              >
                {title}
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
