/**
 * Comprehensive demo data seed for the platform walkthrough animation.
 * Provides realistic team, session, telemetry, and coaching data for the demo player.
 * Deterministic + stateless: returns complete data structure for demo rendering.
 */

export interface DemoTeamData {
  teamId: string
  teamName: string
  rider: {
    id: string
    name: string
    number: number
    bio: string
  }
  sessions: DemoSession[]
  readinessLog: DemoReadiness[]
  trainingLog: DemoTraining[]
  telemetry: DemoTelemetry
  coaching: DemoCoaching[]
  competitiveData: DemoCompetitive[]
  businessMetrics: DemoMetrics
}

export interface DemoSession {
  id: string
  name: string
  date: string
  type: 'practice' | 'qualifying' | 'race'
  duration: number
  laps: number
  avgSpeed: number
  maxSpeed: number
  avgLeanAngle: number
  maxLeanAngle: number
  status: 'completed'
}

export interface DemoReadiness {
  date: string
  score: number
  hrv: number
  rhr: number
  sleepHours: number
  trend: 'up' | 'down' | 'stable'
}

export interface DemoTraining {
  date: string
  type: string
  duration: number
  intensity: number
  notes: string
}

export interface DemoTelemetry {
  sessions: Array<{
    sessionId: string
    frames: Array<{
      timestamp: number
      speed: number
      rpm: number
      lean: number
      throttle: number
      brake: number
      heartRate: number
      power: number
    }>
  }>
}

export interface DemoCoaching {
  timestamp: number
  message: string
  type: 'radio' | 'ai' | 'pit'
  lapNum: number
}

export interface DemoCompetitive {
  lap: number
  position: number
  riderName: string
  lapTime: number
  gapToLeader: number
}

export interface DemoMetrics {
  mediaValue: number
  broadcastMinutes: number
  socialReach: number
  sponsorValue: number
  championship: {
    position: number
    points: number
    wins: number
  }
}

/**
 * Generate complete realistic demo data deterministically.
 * Call this to populate the demo player with a full walkthrough experience.
 */
export function generateDemoTeamData(): DemoTeamData {
  const teamId = 'demo-team-2026'
  const teamName = 'Factory Team Elite'

  // ─── RIDER PROFILE ───────────────────────────────────────────────────────
  const rider = {
    id: 'rider-001',
    name: 'Casey Martinez',
    number: 7,
    bio: 'Factory-backed elite rider with 5 championship podiums. Known for consistency and brake precision in wet conditions.',
  }

  // ─── SESSIONS ───────────────────────────────────────────────────────────
  const sessions: DemoSession[] = [
    {
      id: 'session-001',
      name: 'Friday Practice 1',
      date: '2026-07-17',
      type: 'practice',
      duration: 1800,
      laps: 23,
      avgSpeed: 162.4,
      maxSpeed: 189.3,
      avgLeanAngle: 58.2,
      maxLeanAngle: 63.7,
      status: 'completed',
    },
    {
      id: 'session-002',
      name: 'Friday Practice 2',
      date: '2026-07-17',
      type: 'practice',
      duration: 1800,
      laps: 26,
      avgSpeed: 165.1,
      maxSpeed: 191.8,
      avgLeanAngle: 59.1,
      maxLeanAngle: 64.2,
      status: 'completed',
    },
    {
      id: 'session-003',
      name: 'Saturday Qualifying',
      date: '2026-07-18',
      type: 'qualifying',
      duration: 900,
      laps: 12,
      avgSpeed: 168.7,
      maxSpeed: 193.5,
      avgLeanAngle: 60.3,
      maxLeanAngle: 65.1,
      status: 'completed',
    },
  ]

  // ─── READINESS PROGRESSION ───────────────────────────────────────────────
  const readinessLog: DemoReadiness[] = [
    { date: '2026-07-15', score: 78, hrv: 52, rhr: 42, sleepHours: 8.2, trend: 'up' },
    { date: '2026-07-16', score: 82, hrv: 58, rhr: 40, sleepHours: 8.5, trend: 'up' },
    { date: '2026-07-17', score: 88, hrv: 64, rhr: 38, sleepHours: 7.8, trend: 'up' },
    { date: '2026-07-18', score: 91, hrv: 68, rhr: 36, sleepHours: 6.5, trend: 'up' },
  ]

  // ─── TRAINING LOG ────────────────────────────────────────────────────────
  const trainingLog: DemoTraining[] = [
    { date: '2026-07-15', type: 'Fitness', duration: 60, intensity: 7, notes: 'Core + leg strength' },
    { date: '2026-07-16', type: 'Mental', duration: 45, intensity: 8, notes: 'Visualization + breathing drills' },
    { date: '2026-07-17', type: 'Setup', duration: 90, intensity: 9, notes: 'Brake point analysis + lean angle optimization' },
  ]

  // ─── LIVE TELEMETRY (Single session playback) ───────────────────────────
  const telemetry: DemoTelemetry = {
    sessions: [
      {
        sessionId: sessions[2].id,
        frames: Array.from({ length: 300 }, (_, i) => {
          const t = i / 300
          return {
            timestamp: i * 60,
            speed: 140 + Math.sin(t * Math.PI * 3) * 50 + Math.random() * 5,
            rpm: 8000 + Math.sin(t * Math.PI * 2.5) * 2000,
            lean: Math.abs(Math.sin(t * Math.PI * 4) * 60),
            throttle: Math.max(0, Math.sin(t * Math.PI * 3.2) * 100),
            brake: Math.max(0, Math.cos(t * Math.PI * 3.2) * 80),
            heartRate: 160 + Math.sin(t * Math.PI * 1.5) * 25,
            power: 22000 + Math.sin(t * Math.PI * 2) * 5000,
          }
        }),
      },
    ],
  }

  // ─── AI COACHING ANNOTATIONS ────────────────────────────────────────────
  const coaching: DemoCoaching[] = [
    { timestamp: 15000, message: 'Brake 3 meters earlier into Turn 7', type: 'ai', lapNum: 1 },
    { timestamp: 25000, message: 'Roll more throttle mid-corner', type: 'radio', lapNum: 2 },
    { timestamp: 45000, message: 'Lean angle looks good. Push hard.', type: 'pit', lapNum: 3 },
    { timestamp: 60000, message: 'Watch your apex entry in Turn 3', type: 'ai', lapNum: 4 },
    { timestamp: 85000, message: 'Traction improving. Nice work.', type: 'pit', lapNum: 5 },
  ]

  // ─── COMPETITIVE LEADERBOARD ──────────────────────────────────────────
  const competitiveData: DemoCompetitive[] = [
    // Lap 1
    { lap: 1, position: 2, riderName: 'Casey (You)', lapTime: 85234, gapToLeader: 142 },
    { lap: 1, position: 1, riderName: 'P1 Leader', lapTime: 85092, gapToLeader: 0 },
    // Lap 2
    { lap: 2, position: 1, riderName: 'Casey (You)', lapTime: 84876, gapToLeader: 0 },
    { lap: 2, position: 2, riderName: 'P1 Leader', lapTime: 85018, gapToLeader: 142 },
    // Lap 3
    { lap: 3, position: 1, riderName: 'Casey (You)', lapTime: 84654, gapToLeader: 0 },
    { lap: 3, position: 2, riderName: 'P2 Rival', lapTime: 84889, gapToLeader: 235 },
  ]

  // ─── BUSINESS METRICS ─────────────────────────────────────────────────
  const businessMetrics: DemoMetrics = {
    mediaValue: 2840000,
    broadcastMinutes: 58,
    socialReach: 4200000,
    sponsorValue: 1850000,
    championship: {
      position: 3,
      points: 378,
      wins: 2,
    },
  }

  return {
    teamId,
    teamName,
    rider,
    sessions,
    readinessLog,
    trainingLog,
    telemetry,
    coaching,
    competitiveData,
    businessMetrics,
  }
}
