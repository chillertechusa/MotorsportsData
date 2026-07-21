'use client'

import { useCallback, useEffect, useState } from 'react'
import { LayoutDashboard, ClipboardList, Boxes, Sparkles, Menu, X, Signal, Lock, ShieldAlert, ArrowRight, BookOpen, CalendarDays, DollarSign, Dumbbell, Brain, Mic, HeartPulse, Video, Compass, TrendingUp, Truck, Home, User, LogOut, ShieldCheck, GitCompare, Wand2, GraduationCap, BarChart3, Bell, FileText, Wrench, MapPin, Trophy, Settings2, Upload, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MdLogo from '@/components/md-logo'
import ViewDashboard from './view-dashboard'
import ViewSessionLogs from './view-session-logs'
import ViewPartVault from './view-part-vault'
import ViewMdIntel from './view-md-intel'
import ViewRigDoctor from './view-rig-doctor'
import ViewSpecBook from './view-spec-book'
import ViewSchedule from './view-schedule'
import ViewFinances from './view-finances'
import ViewFitness from './view-fitness'
import ViewMental from './view-mental'
import ViewInterview from './view-interview'
import ViewInjury from './view-injury'
import ViewVideo from './view-video'
import ViewCoach from './view-coach'
import ViewProgression from './view-progression'
import { SessionCompareClient } from './session-compare-client'
import { SetupAIRecommender } from './setup-ai-recommender'
import { CoachingDashboard } from './coaching-dashboard'
import { FleetAnalytics } from './fleet-analytics'
import { ViewAlerts } from './view-alerts'
import { SetupSheetForm } from './setup-sheet-form'
import { WorkOrdersList } from './work-orders-list'
import { ViewIPVault } from './view-ip-vault'
import { ViewAccountability } from './view-accountability'
import { ViewReadiness } from './view-readiness'
import { ViewMultiRiderTelemetry } from './view-multi-rider-telemetry'
import { SessionComparison } from './session-comparison'
import { TrackMapOverlay } from './track-map-overlay'
import FeatureChatbot from './feature-chatbot'
import { ViewStandings } from './view-standings'
import { ViewLiveHR } from './view-live-hr'
import { ViewDiscipline } from './view-discipline'
import { ViewHistoricalAnalytics } from './view-historical-analytics'
import { ViewTelemetryImport } from './view-telemetry-import'
import AddVehicleModal from './add-vehicle-modal'
import { authClient } from '@/lib/auth-client'
import { FACTORY_TIER, RACE_TEAM_TIER, meetsMinTier, tierLabel, isRookieTier } from '@/lib/md-tiers'

type ViewKey = 'dashboard' | 'progression' | 'session' | 'vault' | 'intel' | 'rigdoctor' | 'specs' | 'schedule' | 'finances' | 'fitness' | 'mental' | 'interview' | 'injury' | 'video' | 'coach' | 'compare' | 'setupai' | 'coaching' | 'analytics' | 'notifications' | 'setupsheet' | 'workorders' | 'ipvault' | 'accountability' | 'readiness' | 'multirider' | 'sessioncomp' | 'trackmap' | 'standings' | 'livehr' | 'discipline' | 'history' | 'telimport'

const chatbotFeatureMap: Record<ViewKey, { feature: 'fitness' | 'mental' | 'coach' | 'session' | 'setup' | 'parts' | 'spec' | 'schedule' | 'finances'; title: string }> = {
  dashboard: { feature: 'fitness', title: 'Dashboard' },
  progression: { feature: 'coach', title: 'Your Progress' },
  session: { feature: 'session', title: 'Session Logs' },
  vault: { feature: 'parts', title: 'Part Vault' },
  ipvault: { feature: 'coach', title: 'IP Vault' },
  accountability: { feature: 'coach', title: 'Accountability Trails' },
  readiness: { feature: 'coach', title: 'Readiness Score' },
  multirider: { feature: 'session', title: 'Multi-Rider Telemetry' },
  sessioncomp: { feature: 'session', title: 'Session Comparison' },
  trackmap: { feature: 'session', title: 'Track Map' },
  standings: { feature: 'coach', title: 'Championship Standings' },
  livehr: { feature: 'fitness', title: 'Live HR Monitor' },
  discipline: { feature: 'coach', title: 'Discipline Settings' },
  history: { feature: 'session', title: 'Historical Analytics' },
  telimport: { feature: 'session', title: 'Telemetry Import' },
  intel: { feature: 'coach', title: 'MD Intel' },
  rigdoctor: { feature: 'coach', title: 'Rig Doctor' },
  specs: { feature: 'spec', title: 'Spec Book' },
  schedule: { feature: 'schedule', title: 'Schedule' },
  finances: { feature: 'finances', title: 'Finances' },
  fitness: { feature: 'fitness', title: 'Fitness' },
  mental: { feature: 'mental', title: 'Mental' },
  interview: { feature: 'coach', title: 'Interview' },
  injury: { feature: 'fitness', title: 'Injury' },
  video: { feature: 'coach', title: 'Video' },
  coach: { feature: 'coach', title: 'Coach' },
  compare: { feature: 'session', title: 'Compare Sessions' },
  setupai: { feature: 'setup', title: 'Setup AI' },
  coaching: { feature: 'coach', title: 'Coaching' },
  analytics: { feature: 'fitness', title: 'Analytics' },
  notifications: { feature: 'fitness', title: 'Alerts' },
  setupsheet: { feature: 'setup', title: 'Setup Sheet' },
  workorders: { feature: 'parts', title: 'Work Orders' },
}

export type Vehicle = { id: string; name: string; type: string; engineHours: number; specKey?: string | null }

// Derive up-to-2-letter initials from a display name for the profile avatar fallback.
function initials(name?: string | null): string {
  if (!name) return 'MD'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'MD'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const nav: { key: ViewKey; label: string; sub: string; icon: typeof LayoutDashboard; needsVehicle: boolean; minTier?: string }[] = [
  { key: 'dashboard', label: 'The Rig', sub: 'Dashboard', icon: LayoutDashboard, needsVehicle: false },
  { key: 'progression', label: 'Progression', sub: 'Rider Story', icon: TrendingUp, needsVehicle: false },
  { key: 'session', label: 'Session Log', sub: 'Quick Log', icon: ClipboardList, needsVehicle: true },
  { key: 'setupsheet', label: 'Setup Sheet', sub: 'Full Setup + AI', icon: FileText, needsVehicle: true },
  { key: 'vault', label: 'Part Vault', sub: 'Inventory', icon: Boxes, needsVehicle: true },
  { key: 'specs', label: 'Spec Book', sub: 'OEM Data', icon: BookOpen, needsVehicle: true },
  { key: 'schedule', label: 'Schedule', sub: 'Race Calendar', icon: CalendarDays, needsVehicle: false, minTier: RACE_TEAM_TIER },
  { key: 'standings', label: 'Championship', sub: 'Points Leader', icon: Trophy, needsVehicle: false, minTier: RACE_TEAM_TIER },
  { key: 'livehr', label: 'Live HR', sub: 'Real-Time Monitor', icon: HeartPulse, needsVehicle: false, minTier: RACE_TEAM_TIER },
  { key: 'finances', label: 'Finances', sub: 'Budget & Sponsors', icon: DollarSign, needsVehicle: false, minTier: RACE_TEAM_TIER },
  { key: 'fitness', label: 'Fitness', sub: 'Body + Nutrition', icon: Dumbbell, needsVehicle: false },
  { key: 'mental', label: 'Mental', sub: 'Focus & Confidence', icon: Brain, needsVehicle: false },
  { key: 'interview', label: 'Interview', sub: 'Media Training', icon: Mic, needsVehicle: false },
  { key: 'injury', label: 'Injury', sub: 'RTR Protocol', icon: HeartPulse, needsVehicle: false },
  { key: 'video', label: 'Video', sub: 'AI Coaching', icon: Video, needsVehicle: false },
  { key: 'coach', label: 'Race Coach', sub: 'Your Pocket Coach', icon: Compass, needsVehicle: false },
  { key: 'intel', label: 'MD Intel', sub: 'AI Assistant', icon: Sparkles, needsVehicle: false },
  { key: 'rigdoctor', label: 'Rig Doctor', sub: 'Hauler Diesel AI', icon: Truck, needsVehicle: false, minTier: FACTORY_TIER },
  { key: 'compare', label: 'Compare', sub: 'Session Diff', icon: GitCompare, needsVehicle: true },
  { key: 'setupai', label: 'Setup AI', sub: 'AI Recommendations', icon: Wand2, needsVehicle: false },
  { key: 'coaching', label: 'AI Coach', sub: 'Session Analysis', icon: GraduationCap, needsVehicle: false },
  { key: 'analytics', label: 'Fleet Stats', sub: 'Cost & Health', icon: BarChart3, needsVehicle: false, minTier: RACE_TEAM_TIER },
  { key: 'history', label: 'Performance History', sub: 'Year-over-Year', icon: TrendingUp, needsVehicle: false, minTier: RACE_TEAM_TIER },
  { key: 'notifications', label: 'Alerts', sub: 'Thresholds & Rules', icon: Bell, needsVehicle: false },
  { key: 'workorders', label: 'Work Orders', sub: 'Shop Floor', icon: Wrench, needsVehicle: false },
  { key: 'telimport', label: 'Import Data', sub: 'Upload Telemetry', icon: Upload, needsVehicle: false },
  { key: 'discipline', label: 'Discipline', sub: 'Sport Settings', icon: Settings2, needsVehicle: false },
  { key: 'ipvault', label: 'IP Vault', sub: 'Proprietary Templates', icon: Lock, needsVehicle: false, minTier: RACE_TEAM_TIER },
  { key: 'accountability', label: 'Accountability', sub: 'Audit Trails', icon: ShieldCheck, needsVehicle: false, minTier: RACE_TEAM_TIER },
  { key: 'readiness', label: 'Readiness Score', sub: 'Peak Prediction', icon: TrendingUp, needsVehicle: false, minTier: RACE_TEAM_TIER },
  { key: 'multirider', label: 'Multi-Rider', sub: 'Team Telemetry', icon: GitCompare, needsVehicle: false, minTier: RACE_TEAM_TIER },
  { key: 'sessioncomp', label: 'Comparison', sub: 'Lap Analysis', icon: TrendingUp, needsVehicle: false, minTier: RACE_TEAM_TIER },
  { key: 'trackmap', label: 'Track Map', sub: 'Live Overlay', icon: MapPin, needsVehicle: false, minTier: RACE_TEAM_TIER },
]

// Nav items visible to mechanic-role team members — focused on the shop floor only.
const MECHANIC_NAV: ViewKey[] = ['workorders', 'vault', 'specs', 'dashboard']

// Rookie (youth) is deliberately stripped to a clean parent cockpit — the pro/competition
// surfaces are hidden entirely (not locked) so the tabs stay focused on the little rider.
// Kept for Rookie: the bike, the story, maintenance, specs, body, mind, and safety.
const ROOKIE_HIDDEN: ViewKey[] = ['schedule', 'finances', 'interview', 'video', 'coach', 'intel', 'rigdoctor', 'compare', 'setupai', 'coaching', 'analytics', 'ipvault', 'accountability', 'readiness', 'multirider', 'sessioncomp', 'trackmap', 'standings', 'livehr', 'history']

const titles: Record<ViewKey, string> = {
  dashboard: 'The Rig',
  progression: 'Progression',
  session: 'Setup Sheet',
  vault: 'Part Vault',
  specs: 'Spec Book',
  schedule: 'Schedule',
  finances: 'Finances',
  fitness: 'Fitness',
  mental: 'Mental',
  interview: 'Interview Simulator',
  injury: 'Injury Tracker',
  video: 'Video Analysis',
  coach: 'Race Coach',
  intel: 'MD Intel',
  rigdoctor: 'Rig Doctor',
  compare: 'Session Compare',
  setupai: 'Setup AI',
  coaching: 'AI Coach',
  analytics: 'Fleet Stats',
  notifications: 'Alerts',
  setupsheet: 'Setup Sheet',
  workorders: 'Work Orders',
  ipvault: 'IP Vault',
  accountability: 'Accountability Trails',
  readiness: 'Readiness Score',
  multirider: 'Multi-Rider Telemetry',
  sessioncomp: 'Session Comparison',
  trackmap: 'Track Map',
  standings: 'Championship Standings',
  livehr: 'Live HR Monitor',
  discipline: 'Discipline Settings',
  history: 'Performance History',
  telimport: 'Telemetry Import',
}

// Shown when a Factory Rig user hasn't yet enabled 2FA.
// Blocks the entire shell — their R&D data is too valuable to leave unguarded.
function TwoFactorGate({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-md rounded-2xl border border-amber-500/30 bg-zinc-900 p-8 text-center">
        <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
          <ShieldAlert className="h-8 w-8 text-amber-400" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-50 mb-2">
          2FA Required
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed mb-1">
          Factory Rig accounts guard proprietary R&D data.
        </p>
        <p className="text-zinc-400 text-sm leading-relaxed mb-7">
          Two-factor authentication is mandatory before you can access the platform.
        </p>
        <Link
          href="/data/account/2fa"
          className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-6 py-3 text-sm font-bold uppercase tracking-wider text-zinc-950 hover:bg-lime-300 transition-colors"
        >
          Enable 2FA Now
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-5 text-xs text-zinc-600">
          Takes about 60 seconds. Authenticator app required.
        </p>
        <button
          onClick={onSignOut}
          className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default function RigShell() {
  const [view, setView] = useState<ViewKey>('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  // The shell owns the canonical fleet list so it can gate nav tabs and drive
  // the first-run empty state. Child views receive vehicles as props.
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [fleetLoading, setFleetLoading] = useState(true)

  // Team tier — used to enforce 2FA for Factory Rig accounts.
  const [teamTier, setTeamTier] = useState<string | null>(null)
  // userRole: 'owner' | 'mechanic' | 'rider' | etc. — controls nav filtering.
  const [userRole, setUserRole] = useState<string>('owner')
  const { data: session, isPending: sessionLoading } = authClient.useSession()
  const [isOwner, setIsOwner] = useState(false)
  const router = useRouter()

  // Check owner status once session is known — lightweight API call, no flicker on non-owners
  useEffect(() => {
    if (!session?.user) return
    fetch('/api/md-owner/check')
      .then((r) => r.json())
      .then((d) => setIsOwner(Boolean(d.isOwner)))
      .catch(() => {})
  }, [session?.user?.email])

  async function handleSignOut() {
    await authClient.signOut()
    router.push('/')
    router.refresh()
  }

  const reloadFleet = useCallback(async () => {
    try {
      const [fleetRes, teamRes] = await Promise.all([
        fetch('/api/md-fleet'),
        fetch('/api/md-team'),
      ])
      const [fleetData, teamData] = await Promise.all([fleetRes.json(), teamRes.json()])
      if (fleetData.success) setVehicles(fleetData.vehicles ?? [])
      if (teamData.success) {
        setTeamTier(teamData.tier)
        setUserRole(teamData.role ?? 'owner')
      }
    } catch {
      /* offline — leave last known state */
    } finally {
      setFleetLoading(false)
    }
  }, [])

  useEffect(() => {
    reloadFleet()
  }, [reloadFleet])

  // Rookie accounts should never sit on a hidden (pro/competition) view — snap back to the dashboard.
  useEffect(() => {
    if (isRookieTier(teamTier) && ROOKIE_HIDDEN.includes(view)) setView('dashboard')
  }, [teamTier, view])

  // Mechanic-role members default to work orders and can only see mechanic nav.
  const isMechanic = userRole === 'mechanic'
  useEffect(() => {
    if (isMechanic && !MECHANIC_NAV.includes(view)) setView('workorders')
  }, [isMechanic, view])

  // Factory Rig accounts must have 2FA enabled before accessing the platform.
  const isFactory = teamTier === FACTORY_TIER
  const twoFactorEnabled = session?.user?.twoFactorEnabled ?? false
  const needs2FA = !sessionLoading && !fleetLoading && isFactory && !twoFactorEnabled
  if (needs2FA) return <TwoFactorGate onSignOut={handleSignOut} />

  const hasVehicles = vehicles.length > 0
  const locked = !fleetLoading && !hasVehicles

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky lg:top-0 inset-y-0 left-0 z-40 w-72 h-screen lg:h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col transition-transform lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex flex-col justify-center px-5 h-20 border-b border-zinc-800 gap-1">
          <MdLogo size="sm" showWordmark={true} asLink={true} />
          <p className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-mono pl-0.5">Pit Command</p>
        </div>

        {/* Nav — scrolls internally so the account/sign-out footer stays reachable
            on short tablet/phone viewports (e.g. iPad landscape at 768px height) */}
        <nav className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
          {(isMechanic
            ? nav.filter((item) => MECHANIC_NAV.includes(item.key))
            : isRookieTier(teamTier)
              ? nav.filter((item) => !ROOKIE_HIDDEN.includes(item.key))
              : nav
          ).map((item) => {
            const active = view === item.key
            const tierLocked = item.minTier ? !meetsMinTier(teamTier, item.minTier) : false
            const minTierLabel = item.minTier ? `${tierLabel(item.minTier)}+` : undefined
            const disabled = (locked && item.needsVehicle) || tierLocked
            const lockReason = tierLocked ? minTierLabel : disabled ? 'Add a vehicle to unlock' : undefined
            return (
              <button
                key={item.key}
                disabled={disabled}
                title={lockReason}
                onClick={() => {
                  if (disabled) return
                  setView(item.key)
                  setMobileOpen(false)
                }}
                className={`w-full flex items-center gap-4 rounded-xl px-4 h-16 text-left transition-colors ${
                  active
                    ? 'bg-lime-400 text-zinc-950'
                    : disabled
                      ? 'text-zinc-700 cursor-not-allowed'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 active:bg-zinc-800'
                }`}
              >
                <item.icon className="h-6 w-6 shrink-0" />
                <div className="leading-tight flex-1 min-w-0">
                  <p className="font-bold uppercase tracking-wide text-[15px]">{item.label}</p>
                  <p className={`text-xs uppercase tracking-wider ${active ? 'text-zinc-800' : 'text-zinc-600'}`}>
                    {tierLocked ? minTierLabel : disabled ? 'Locked' : item.sub}
                  </p>
                </div>
                {disabled && <Lock className="h-4 w-4 shrink-0 text-zinc-700" />}
              </button>
            )
          })}
        </nav>

        {/* Connection status */}
        <div className="shrink-0 px-4 pt-4">
          <div className="flex items-center gap-3 rounded-xl bg-zinc-950 px-4 py-3">
            <Signal className="h-5 w-5 text-lime-400" />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-zinc-200">Rig Online</p>
              <p className="text-xs text-zinc-500">
                {fleetLoading ? 'Syncing…' : `Synced · ${vehicles.length} vehicle${vehicles.length === 1 ? '' : 's'}`}
              </p>
            </div>
          </div>
        </div>

        {/* Account + sign out */}
        <div className="shrink-0 border-t border-zinc-800 mt-4 p-4">
          <div className="mb-3 flex items-center gap-3">
            {session?.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image || "/placeholder.svg"}
                alt={session.user.name || 'Profile'}
                className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-lime-400/30"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-400 text-zinc-950 text-sm font-black uppercase tracking-tight"
              >
                {initials(session?.user?.name)}
              </span>
            )}
            <div className="min-w-0 leading-tight">
              <p className="text-sm font-semibold text-zinc-200 truncate">
                {session?.user?.name || 'Rider'}
              </p>
              {session?.user?.email && (
                <p className="text-xs text-zinc-500 truncate">{session.user.email}</p>
              )}
            </div>
          </div>
          <div className="space-y-1">
            {isOwner && (
              <Link
                href="/data/owner"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs uppercase tracking-wider text-lime-400 hover:text-lime-300 hover:bg-lime-400/10 transition-colors font-semibold"
              >
                <ShieldCheck className="h-4 w-4 shrink-0" />
                Owner Console
              </Link>
            )}
            <Link
              href="/account"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs uppercase tracking-wider text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <User className="h-4 w-4 shrink-0" />
              My Account
            </Link>
            {isOwner && (
              <Link
                href="/data/account/billing"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs uppercase tracking-wider text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                <CreditCard className="h-4 w-4 shrink-0" />
                Billing
              </Link>
            )}
            <Link
              href="/shop"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs uppercase tracking-wider text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <Home className="h-4 w-4 shrink-0" />
              Back to Shop
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-xs uppercase tracking-wider text-zinc-400 hover:text-lime-400 hover:bg-zinc-800 transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-4 h-20 px-5 lg:px-8 bg-zinc-950/90 backdrop-blur border-b border-zinc-800">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200"
            aria-label="Open menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <h1 className="text-2xl font-black uppercase tracking-wide text-zinc-50">{titles[view]}</h1>
          <div className="ml-auto flex items-center gap-3">
            {isMechanic && (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-400">
                <Wrench className="h-3 w-3" />
                Mechanic
              </span>
            )}
            <span className="h-2.5 w-2.5 rounded-full bg-lime-400 animate-pulse" />
            <span className="text-sm text-zinc-400 hidden sm:inline">Live Session</span>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-8">
          {view === 'dashboard' && (
            <ViewDashboard
              vehicles={vehicles}
              fleetLoading={fleetLoading}
              onAddVehicle={() => setAddOpen(true)}
              onFleetChanged={reloadFleet}
            />
          )}
          {view === 'progression' && <ViewProgression />}
          {view === 'session' && <ViewSessionLogs vehicles={vehicles} />}
          {view === 'vault' && <ViewPartVault vehicles={vehicles} />}
          {view === 'specs' && <ViewSpecBook vehicles={vehicles} />}
          {view === 'schedule' && <ViewSchedule vehicles={vehicles} />}
          {view === 'finances' && <ViewFinances vehicles={vehicles} tier={teamTier ?? undefined} />}
          {view === 'fitness' && <ViewFitness />}
          {view === 'mental' && <ViewMental tier={teamTier ?? undefined} />}
          {view === 'interview' && <ViewInterview tier={teamTier ?? undefined} />}
          {view === 'injury' && <ViewInjury />}
          {view === 'video' && <ViewVideo vehicles={vehicles} tier={teamTier ?? undefined} />}
          {view === 'coach' && <ViewCoach tier={teamTier ?? undefined} />}
          {view === 'intel' && <ViewMdIntel />}
          {view === 'compare' && <SessionCompareClient vehicles={vehicles} />}
          {view === 'setupai' && <SetupAIRecommender vehicles={vehicles} />}
          {view === 'coaching' && <CoachingDashboard vehicles={vehicles} />}
          {view === 'analytics' && <FleetAnalytics vehicles={vehicles} />}
          {view === 'notifications' && <ViewAlerts />}
          {view === 'setupsheet' && <SetupSheetForm vehicles={vehicles} />}
          {view === 'workorders' && <WorkOrdersList vehicles={vehicles} />}
          {view === 'ipvault' && <ViewIPVault tier={teamTier ?? undefined} />}
          {view === 'accountability' && <ViewAccountability />}
          {view === 'readiness' && <ViewReadiness />}
          {view === 'multirider' && <ViewMultiRiderTelemetry />}
          {view === 'sessioncomp' && <SessionComparison />}
          {view === 'trackmap' && <TrackMapOverlay />}
          {view === 'standings' && <ViewStandings />}
          {view === 'livehr' && <ViewLiveHR />}
          {view === 'discipline' && <ViewDiscipline />}
          {view === 'history' && <ViewHistoricalAnalytics />}
          {view === 'telimport' && <ViewTelemetryImport />}
        </main>
      </div>

      <AddVehicleModal open={addOpen} onClose={() => setAddOpen(false)} onAdded={reloadFleet} />

      {/* Feature-aware chatbot — always available */}
      {chatbotFeatureMap[view] && (
        <FeatureChatbot
          feature={chatbotFeatureMap[view].feature}
          title={chatbotFeatureMap[view].title}
        />
      )}
    </div>
  )
}
