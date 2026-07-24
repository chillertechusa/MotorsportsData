/**
 * Demo Lens Engine
 *
 * Drives the landing-page E2E demo. Proves "one platform, several lenses":
 * the SAME operating loop (Capture -> Analyze -> Coach -> Race Day -> Business)
 * re-skins its vocabulary, metrics, and guidance based on
 *   (1) the selected motorsport DISCIPLINE (all 10 canonical lenses), and
 *   (2) the selected ROLE lens (Rider / Team / Coach).
 *
 * Everything here is static/derived — no backend, safe for a client component.
 */

import { DISCIPLINES, type DisciplineId } from '@/lib/md-discipline'

export type RoleId = 'rider' | 'team' | 'coach'

export interface RoleLens {
  id: RoleId
  label: string
  /** One-line framing shown under the role selector */
  tagline: string
}

export const ROLE_LENSES: RoleLens[] = [
  { id: 'rider', label: 'Rider', tagline: 'Your career, your data, your readiness — in one cockpit.' },
  { id: 'team', label: 'Team', tagline: 'Every rider, mechanic, and dollar coordinated from one board.' },
  { id: 'coach', label: 'Coach', tagline: 'Run a coaching business: roster, plans, and billing in one place.' },
]

/** The five stages of the operating loop, in order. */
export type StageId = 'capture' | 'analyze' | 'coach' | 'raceday' | 'business'

export interface StageMeta {
  id: StageId
  label: string
  /** Short verb-phrase describing what happens in this stage */
  blurb: string
}

export const STAGES: StageMeta[] = [
  { id: 'capture', label: 'Capture', blurb: 'Log the session' },
  { id: 'analyze', label: 'Analyze', blurb: 'Find the time' },
  { id: 'coach', label: 'Coach', blurb: 'Turn data into a plan' },
  { id: 'raceday', label: 'Race Day', blurb: 'Execute at the event' },
  { id: 'business', label: 'Business', blurb: 'Run it like a company' },
]

/** A single metric tile inside a stage panel. */
export interface MetricTile {
  label: string
  value: string
  delta?: string
  positive?: boolean
}

/** Discipline-specific vocabulary + numbers used to build stage panels. */
interface DisciplineDemo {
  /** Primary performance metric label + a believable value */
  primaryMetric: { label: string; value: string; delta: string }
  /** Representative session/run name */
  sessionName: string
  /** Representative event name */
  eventName: string
  /** Telemetry channels shown in the capture stage */
  channels: string[]
  /** The single highest-leverage coaching insight for this discipline */
  insight: string
  /** The race-day operational focus */
  racedayFocus: string
}

const DISCIPLINE_DEMO: Record<DisciplineId, DisciplineDemo> = {
  mx_sx: {
    primaryMetric: { label: 'Best Lap', value: '1:58.4', delta: '-0.9s' },
    sessionName: 'Timed Qualifying',
    eventName: 'Round 6 — Outdoor National',
    channels: ['Lap splits', 'Corner speed', 'Suspension travel', 'Throttle %'],
    insight: 'Rider loses 0.6s in the sand rollers. Roll the whoops instead of jumping — data shows scrubbing kills exit drive.',
    racedayFocus: 'Gate pick #4, first-turn line, 2-moto points strategy',
  },
  enduro: {
    primaryMetric: { label: 'Test Avg', value: '4:12.7', delta: '-6s' },
    sessionName: 'Special Test 3',
    eventName: 'GNCC Round 8 — 3-Hour',
    channels: ['Test times', 'Cross-country pace', 'Fuel burn', 'HR / hydration'],
    insight: 'Pace fades 18% in the final hour. Shift fueling to 75g carbs/hr and pre-load Zone 2 base — this is a bonk, not a skill gap.',
    racedayFocus: 'Pit-stop fuel windows, tire (mousse) call, energy management',
  },
  fmx: {
    primaryMetric: { label: 'Run Score', value: '92.5', delta: '+4.0' },
    sessionName: 'Foam Pit Session',
    eventName: 'FMX Best-Trick Final',
    channels: ['Trick tier', 'Amplitude', 'Ramp speed', 'Landing load'],
    insight: 'Body-varial combo is landing clean 8/10 on foam. Progress to dirt with a spotter — do NOT rush the flip variant yet.',
    racedayFocus: 'Run order, trick sequencing, injury-status gating',
  },
  flat_track: {
    primaryMetric: { label: 'Heat Time', value: '0:22.1', delta: '-0.4s' },
    sessionName: 'Heat Race',
    eventName: 'AFT Half-Mile',
    channels: ['Slide angle', 'Entry speed', 'Throttle timing', 'Tire pressure'],
    insight: 'Entry speed into turn 3 is 4mph low. Later brake release + wider slide holds momentum through the cushion.',
    racedayFocus: 'Rolling-start hole shot, tire pressure per session, main-event gearing',
  },
  trail: {
    primaryMetric: { label: 'Skills Cleared', value: '7 / 9', delta: '+2' },
    sessionName: 'Technical Section Practice',
    eventName: 'Club Adventure Ride',
    channels: ['Body position', 'Clutch control', 'Route / GPS', 'Ride duration'],
    insight: 'Log hops are the sticking point. Cover the clutch and shift weight back earlier — confidence builds fastest on low-consequence reps.',
    racedayFocus: 'Route plan, fuel range, group riding etiquette',
  },
  pit_bike: {
    primaryMetric: { label: 'Best Lap', value: '0:41.8', delta: '-1.2s' },
    sessionName: 'Practice',
    eventName: 'Youth Mini-Moto Race',
    channels: ['Lap times', 'Throttle smoothness', 'Sag / spring', 'Fun score'],
    insight: 'Smooth no-brake turns are unlocking corner speed. Celebrate the win loudly — confidence is the whole game at this level.',
    racedayFocus: 'Gear check, parent briefing, keep it fun and low-pressure',
  },
  nascar: {
    primaryMetric: { label: 'Avg Lap', value: '29.84', delta: '-0.12s' },
    sessionName: 'Qualifying',
    eventName: '1.5-Mile Intermediate Feature',
    channels: ['Lap times', 'Aero balance', 'Tire falloff', 'Fuel window'],
    insight: 'Car goes loose off turn 2 after lap 12 — tire falloff, not setup. Add a round of wedge and manage entry to save the right-rear.',
    racedayFocus: 'Stage strategy, green-flag pit cycle, restart lane choice',
  },
  drag: {
    primaryMetric: { label: 'Quarter ET', value: '6.842', delta: '-0.031s' },
    sessionName: 'Qualifying Pass',
    eventName: 'NHRA National — Eliminations',
    channels: ['Reaction time', '60-foot', '330 / eighth', 'Driveshaft RPM'],
    insight: '60-foot is 0.04 off — chassis is spinning on the hit. Soften the launch and add preload; the ET is in the first 60 feet.',
    racedayFocus: 'Tree timing, dial-in strategy, tire prep by track temp',
  },
  rally: {
    primaryMetric: { label: 'Stage Time', value: '8:47.3', delta: '-11s' },
    sessionName: 'Shakedown',
    eventName: 'ARA National — Gravel',
    channels: ['Stage pace', 'Pacenote accuracy', 'Surface / grip', 'Service time'],
    insight: 'Two late note calls cost 7s on the fast section. Tighten driver–co-driver call timing — a clean run beats max attack all day.',
    racedayFocus: 'Tire choice per stage, service-park schedule, no-mistake pace',
  },
  karting: {
    primaryMetric: { label: 'Best Lap', value: '0:48.62', delta: '-0.18s' },
    sessionName: 'Qualifying',
    eventName: 'ROK Cup Regional Final',
    channels: ['Lap times', 'Corner speed', 'Chassis (width/caster)', 'Tire temps'],
    insight: 'Narrowing rear width 5mm freed the kart mid-corner without hurting drive. Log the delta — repeatability is the whole discipline.',
    racedayFocus: 'Pre-final heat, tire management, chassis tune per session',
  },
}

/** Role-specific framing for each stage. */
interface RoleStageCopy {
  /** Heading verb for the stage in this role */
  title: string
  /** One-paragraph description of what the role does at this stage */
  body: string
  /** 2–4 metric tiles for the stage panel */
  tiles: MetricTile[]
}

export interface LensView {
  disciplineId: DisciplineId
  disciplineLabel: string
  accentColor: string
  role: RoleId
  roleLabel: string
  roleTagline: string
  stages: Record<StageId, RoleStageCopy>
  /** AI guidance line shown in the demo footer, discipline + role aware */
  aiLine: string
}

/**
 * Build the full demo view for a discipline + role.
 * This is the heart of the "several lenses" story.
 */
export function buildLensView(disciplineId: DisciplineId, role: RoleId): LensView {
  const discipline = DISCIPLINES.find((d) => d.id === disciplineId) ?? DISCIPLINES[0]
  const demo = DISCIPLINE_DEMO[discipline.id]
  const roleLens = ROLE_LENSES.find((r) => r.id === role) ?? ROLE_LENSES[0]
  const pm = demo.primaryMetric

  const stages: Record<StageId, RoleStageCopy> = {
    capture: {
      title: role === 'coach' ? 'Athlete logs the session' : 'Log the session',
      body:
        role === 'rider'
          ? `Your ${demo.sessionName.toLowerCase()} uploads in seconds — import from a data logger or tap it in. Every channel is timestamped to the run.`
          : role === 'team'
            ? `Every rider's ${demo.sessionName.toLowerCase()} lands on one board. The crew sees channels the moment the bike rolls off track.`
            : `Each athlete's ${demo.sessionName.toLowerCase()} syncs to their profile automatically — no chasing spreadsheets across your roster.`,
      tiles: [
        { label: 'Session', value: demo.sessionName },
        { label: 'Event', value: demo.eventName },
        { label: 'Channels', value: `${demo.channels.length} live` },
      ],
    },
    analyze: {
      title: 'Find the time',
      body:
        role === 'coach'
          ? `Overlay any athlete's runs side by side. The platform surfaces where each one is losing time so you spend your session on what matters.`
          : `Overlay runs and channels to see exactly where time is won and lost. ${discipline.label} metrics are pre-mapped — no manual charting.`,
      tiles: [
        { label: pm.label, value: pm.value, delta: pm.delta, positive: true },
        { label: 'vs. last run', value: pm.delta, positive: true },
        { label: 'Consistency', value: '+12%', delta: 'tighter', positive: true },
      ],
    },
    coach: {
      title: role === 'coach' ? 'Prescribe the plan' : 'Turn data into a plan',
      body: demo.insight,
      tiles: [
        { label: 'AI insight', value: 'Ready' },
        { label: 'Assigned drills', value: role === 'coach' ? '3 per athlete' : '3' },
        { label: 'Focus', value: discipline.sessionTypes[0] ?? 'Practice' },
      ],
    },
    raceday: {
      title: 'Execute on race day',
      body:
        role === 'team'
          ? `The whole rig runs off one live board on event day: ${demo.racedayFocus}. Assignments, timing, and readiness in one glance.`
          : role === 'coach'
            ? `Follow every athlete across events from one dashboard: ${demo.racedayFocus}. Be in ten places without leaving the truck.`
            : `Your race-day checklist is built for ${discipline.label}: ${demo.racedayFocus}.`,
      tiles: [
        { label: 'Event', value: demo.eventName },
        { label: 'Readiness', value: '94', delta: 'green', positive: true },
        { label: 'Focus', value: demo.racedayFocus.split(',')[0] },
      ],
    },
    business: {
      title: 'Run it like a business',
      body:
        role === 'rider'
          ? `Track every dollar — entry fees, travel, parts, fuel. Know your true cost-per-race and bill sponsors from the same login.`
          : role === 'team'
            ? `Invoicing, sponsor ROI, expenses, and payroll for your crew — one P&L by event and season. Racing is a business; run it like one.`
            : `Your coaching business runs here: athlete roster, session packages, invoicing, expenses, and payments — all in one place.`,
      tiles:
        role === 'coach'
          ? [
              { label: 'Active athletes', value: '14' },
              { label: 'MRR', value: '$18,400', delta: '+$2,100', positive: true },
              { label: 'Invoices due', value: '3' },
            ]
          : role === 'team'
            ? [
                { label: 'Season P&L', value: '+$42.6k', positive: true },
                { label: 'Sponsor ROI', value: '3.8x', positive: true },
                { label: 'Payroll', value: 'Synced' },
              ]
            : [
                { label: 'Cost / race', value: '$1,240' },
                { label: 'Sponsor billed', value: '$6,500', positive: true },
                { label: 'Budget left', value: '68%' },
              ],
    },
  }

  const aiLine =
    role === 'coach'
      ? `Rig Doctor AI, tuned for ${discipline.label}: "${demo.insight}"`
      : `Rig Doctor AI reads your ${discipline.label} data and coaches in plain language: "${demo.insight}"`

  return {
    disciplineId: discipline.id,
    disciplineLabel: discipline.label,
    accentColor: discipline.accentColor,
    role: roleLens.id,
    roleLabel: roleLens.label,
    roleTagline: roleLens.tagline,
    stages,
    aiLine,
  }
}
