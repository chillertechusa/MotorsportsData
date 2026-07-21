/**
 * DemoSequence.ts
 * 6 keyframe sequences for the 120-second banger demo.
 * Each sequence drives the overlay render in DemoBangerPlayer.tsx.
 * All data is realistic but simulated — no real DB queries.
 */

export type OverlayType =
  | 'telemetry-hud'
  | 'setup-recommendation'
  | 'readiness-score'
  | 'competitive-leaderboard'
  | 'coaching-radio'
  | 'payoff-stats'

export interface TelemetryState {
  speed: number        // mph
  rpm: number          // 0–13000
  throttle: number     // 0–100%
  brake: number        // 0–100%
  lean: number         // degrees
  heartRate: number    // bpm
  lapTime: string      // mm:ss.ms
  sector: number       // 1–3
}

export interface SetupRec {
  change: string
  delta: string
  confidence: number   // 0–100
  corner: string
}

export interface ReadinessState {
  score: number        // 0–100
  hrv: number          // ms
  sleep: number        // hours
  fatigue: number      // 0–10
  label: 'NOT READY' | 'BUILDING' | 'RACE READY' | 'PEAK'
  trend: number[]      // 7 values for sparkline
}

export interface LeaderboardRow {
  pos: number
  name: string
  gap: string          // '+0.000' or 'LEADER'
  lastLap: string
  delta: number        // negative = gaining, positive = losing
}

export interface CoachMessage {
  from: 'COACH' | 'PIT' | 'AI'
  text: string
  timestamp: string
  highlight?: boolean
}

export interface PayoffStat {
  label: string
  value: string
  sub: string
}

export interface DemoSequence {
  index: number
  start: number        // seconds into 120s total
  end: number
  name: string
  caption: string
  overlayType: OverlayType
  telemetry?: TelemetryState
  setupRecs?: SetupRec[]
  readiness?: ReadinessState
  leaderboard?: LeaderboardRow[]
  coachMessages?: CoachMessage[]
  payoffStats?: PayoffStat[]
  accentColor: string  // tailwind color token
}

// ─── Sequence 1: 0–20s — THE RIDER ON TRACK ──────────────────────────────────
const SEQ_1: DemoSequence = {
  index: 0,
  start: 0,
  end: 20,
  name: 'Rider On Track',
  caption: 'See what your rider is doing. In real-time.',
  overlayType: 'telemetry-hud',
  accentColor: 'lime',
  telemetry: {
    speed: 67,
    rpm: 10800,
    throttle: 84,
    brake: 0,
    lean: 41,
    heartRate: 172,
    lapTime: '1:58.347',
    sector: 2,
  },
}

// ─── Sequence 2: 20–40s — AI KNOWS YOUR SETUP ────────────────────────────────
const SEQ_2: DemoSequence = {
  index: 1,
  start: 20,
  end: 40,
  name: 'AI Setup Engine',
  caption: 'AI recommends setup changes your mechanic can implement in 5 minutes.',
  overlayType: 'setup-recommendation',
  accentColor: 'cyan',
  telemetry: {
    speed: 52,
    rpm: 9200,
    throttle: 61,
    brake: 18,
    lean: 54,
    heartRate: 168,
    lapTime: '1:57.812',
    sector: 3,
  },
  setupRecs: [
    { change: '+2mm front compression', delta: '+0.18s', confidence: 94, corner: 'Turn 7' },
    { change: '-1 click rebound (rear)', delta: '+0.09s', confidence: 88, corner: 'Whoops' },
    { change: 'Raise forks 3mm', delta: '+0.12s', confidence: 91, corner: 'Turns 4–5' },
    { change: 'Front tire pressure -0.5 psi', delta: '+0.06s', confidence: 82, corner: 'All corners' },
  ],
}

// ─── Sequence 3: 40–60s — READINESS PREDICTS RACE DAY ───────────────────────
const SEQ_3: DemoSequence = {
  index: 2,
  start: 40,
  end: 60,
  name: 'Readiness & Health',
  caption: 'Your coach knows if your rider can podium 48 hours before the gate drops.',
  overlayType: 'readiness-score',
  accentColor: 'lime',
  telemetry: {
    speed: 0,
    rpm: 0,
    throttle: 0,
    brake: 0,
    lean: 0,
    heartRate: 48,
    lapTime: '--:--',
    sector: 0,
  },
  readiness: {
    score: 91,
    hrv: 68,
    sleep: 8.2,
    fatigue: 2,
    label: 'RACE READY',
    trend: [62, 58, 71, 78, 74, 85, 91],
  },
}

// ─── Sequence 4: 60–80s — COMPETITIVE EDGE IN REAL-TIME ─────────────────────
const SEQ_4: DemoSequence = {
  index: 3,
  start: 60,
  end: 80,
  name: 'Competitive Edge',
  caption: 'See exactly where you are faster. And where you are not.',
  overlayType: 'competitive-leaderboard',
  accentColor: 'cyan',
  telemetry: {
    speed: 71,
    rpm: 11400,
    throttle: 92,
    brake: 0,
    lean: 18,
    heartRate: 179,
    lapTime: '1:57.219',
    sector: 1,
  },
  leaderboard: [
    { pos: 1, name: 'MARTINEZ #7', gap: 'LEADER', lastLap: '1:57.219', delta: -0.42 },
    { pos: 2, name: 'HUNTER #23', gap: '+0.421', lastLap: '1:57.640', delta: 0.18 },
    { pos: 3, name: 'COLE #51', gap: '+1.084', lastLap: '1:58.303', delta: 0.31 },
    { pos: 4, name: 'RAMIREZ #4', gap: '+1.892', lastLap: '1:59.111', delta: 0.52 },
    { pos: 5, name: 'WALSH #88', gap: '+2.314', lastLap: '1:59.533', delta: -0.08 },
  ],
}

// ─── Sequence 5: 80–100s — COACHING FROM THE PIT BOX ────────────────────────
const SEQ_5: DemoSequence = {
  index: 4,
  start: 80,
  end: 100,
  name: 'Pit Box Coaching',
  caption: 'Real-time coaching with data-backed calls. No guessing. No egos.',
  overlayType: 'coaching-radio',
  accentColor: 'orange',
  telemetry: {
    speed: 44,
    rpm: 8600,
    throttle: 55,
    brake: 31,
    lean: 58,
    heartRate: 174,
    lapTime: '1:56.881',
    sector: 2,
  },
  coachMessages: [
    { from: 'AI', text: 'Brake 2 meters earlier into Turn 3. Losing 0.18s per lap.', timestamp: '1:22', highlight: false },
    { from: 'COACH', text: 'Copy. Whoops throttle is smooth — keep that up.', timestamp: '1:28', highlight: false },
    { from: 'AI', text: 'Heart rate 179. Fatigue building lap 8+. Manage effort in sector 2.', timestamp: '1:31', highlight: true },
    { from: 'PIT', text: 'P1 gap holding at +0.42. Push turn 7.', timestamp: '1:35', highlight: false },
    { from: 'COACH', text: 'You are 0.3s faster in the whoops than anyone on the track.', timestamp: '1:41', highlight: false },
  ],
}

// ─── Sequence 6: 100–120s — THE PAYOFF ──────────────────────────────────────
const SEQ_6: DemoSequence = {
  index: 5,
  start: 100,
  end: 120,
  name: 'The Payoff',
  caption: 'Turn telemetry into trophies.',
  overlayType: 'payoff-stats',
  accentColor: 'lime',
  payoffStats: [
    { label: 'Season Wins', value: '7', sub: 'from 18 motos' },
    { label: 'Avg Lap Delta', value: '-0.31s', sub: 'vs. pre-platform baseline' },
    { label: 'Injuries Avoided', value: '3', sub: 'via readiness gate' },
    { label: 'Sponsor Media Value', value: '$2.4M', sub: 'tracked & reported' },
    { label: 'Team Members', value: '11', sub: 'roles, all synced live' },
    { label: 'Gate-to-Podium', value: '38%', sub: 'conversion rate' },
  ],
}

export const DEMO_SEQUENCES: DemoSequence[] = [SEQ_1, SEQ_2, SEQ_3, SEQ_4, SEQ_5, SEQ_6]

export const DEMO_TOTAL_SECONDS = 120

export function getSequenceAt(t: number): DemoSequence {
  return DEMO_SEQUENCES.find((s) => t >= s.start && t < s.end) ?? DEMO_SEQUENCES[DEMO_SEQUENCES.length - 1]
}

export function getSequenceProgress(t: number): number {
  const seq = getSequenceAt(t)
  return (t - seq.start) / (seq.end - seq.start)
}

/** Linearly interpolate a number at progress p between a and b */
export function lerp(a: number, b: number, p: number): number {
  return a + (b - a) * Math.min(1, Math.max(0, p))
}

/** Animate a telemetry value with a sine wobble on top of the base value */
export function animateTelemetry(base: number, amplitude: number, t: number, freq = 1.2): number {
  return Math.round(base + Math.sin(t * freq) * amplitude)
}
