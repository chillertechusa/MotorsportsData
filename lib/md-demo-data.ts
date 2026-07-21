/**
 * Pre-loaded demo data for sales demos.
 * Realistic 2-week training + race weekend for an elite motocross rider.
 * Ready to show without waiting for file uploads.
 */

export const DEMO_RIDER = {
  id: 'demo-rider-001',
  email: 'demo-rider@motorsportdata.com',
  name: 'Demo Rider',
  team: 'Demo Factory Team',
}

export const DEMO_COACH = {
  id: 'demo-coach-001',
  email: 'demo-coach@motorsportdata.com',
  name: 'Demo Coach',
  team: 'Demo Factory Team',
}

/** Realistic training log: 2 weeks building to race weekend */
export const DEMO_TRAINING_LOG = [
  // Week 1: Build Phase
  {
    date: '2026-07-07',
    day: 'Monday',
    assignment: '45 min cycling @ 155 BPM',
    completed: true,
    heartRateAvg: 152,
    heartRateMax: 168,
    volume: 45,
    notes: 'Good aerobic base work',
  },
  {
    date: '2026-07-08',
    day: 'Tuesday',
    assignment: '30 min track practice, moderate pace',
    completed: true,
    heartRateAvg: 165,
    heartRateMax: 178,
    volume: 32,
    notes: 'Track felt good, suspension settings dialed',
  },
  {
    date: '2026-07-09',
    day: 'Wednesday',
    assignment: '20 min sprint intervals @ 180 BPM',
    completed: true,
    heartRateAvg: 175,
    heartRateMax: 185,
    volume: 22,
    notes: 'Excellent sprint work',
  },
  {
    date: '2026-07-10',
    day: 'Thursday',
    assignment: '60 min endurance ride, easy',
    completed: true,
    heartRateAvg: 148,
    heartRateMax: 162,
    volume: 61,
    notes: 'Building base for week 2',
  },
  {
    date: '2026-07-11',
    day: 'Friday',
    assignment: 'Rest day',
    completed: true,
    heartRateAvg: 0,
    heartRateMax: 0,
    volume: 0,
    notes: 'Recovery day',
  },

  // Week 2: Peak Phase
  {
    date: '2026-07-14',
    day: 'Monday',
    assignment: '50 min mixed intensity',
    completed: true,
    heartRateAvg: 160,
    heartRateMax: 175,
    volume: 50,
    notes: 'Building peak for weekend',
  },
  {
    date: '2026-07-15',
    day: 'Tuesday',
    assignment: '25 min race-pace intervals',
    completed: true,
    heartRateAvg: 172,
    heartRateMax: 188,
    volume: 26,
    notes: 'Sharp and focused',
  },
  {
    date: '2026-07-16',
    day: 'Wednesday',
    assignment: '15 min light shakeout',
    completed: true,
    heartRateAvg: 145,
    heartRateMax: 158,
    volume: 16,
    notes: 'Keeping legs fresh',
  },
  {
    date: '2026-07-17',
    day: 'Thursday',
    assignment: 'REST - Taper begins',
    completed: true,
    heartRateAvg: 0,
    heartRateMax: 0,
    volume: 0,
    notes: 'Day before race, zero training',
  },
  {
    date: '2026-07-18',
    day: 'Friday',
    assignment: 'REST - Race prep',
    completed: true,
    heartRateAvg: 0,
    heartRateMax: 0,
    volume: 0,
    notes: 'Mental prep, sleep, nutrition',
  },
  {
    date: '2026-07-19',
    day: 'Saturday',
    assignment: 'SUPERCROSS RACE — 3x20min motos',
    completed: true,
    heartRateAvg: 182,
    heartRateMax: 198,
    volume: 65,
    notes: '1st: 19:45. 2nd: 19:52. 3rd: 19:48. PODIUM FINISH',
  },
]

/** Realistic sleep + HRV data */
export const DEMO_BIOMETRIC_LOG = [
  { date: '2026-07-07', sleep: 7.2, hrv: 48, rhr: 52 },
  { date: '2026-07-08', sleep: 6.8, hrv: 45, rhr: 54 },
  { date: '2026-07-09', sleep: 7.5, hrv: 50, rhr: 51 },
  { date: '2026-07-10', sleep: 8.1, hrv: 55, rhr: 50 },
  { date: '2026-07-11', sleep: 8.3, hrv: 58, rhr: 48 },
  { date: '2026-07-14', sleep: 7.4, hrv: 52, rhr: 50 },
  { date: '2026-07-15', sleep: 7.1, hrv: 48, rhr: 52 },
  { date: '2026-07-16', sleep: 7.8, hrv: 54, rhr: 50 },
  { date: '2026-07-17', sleep: 8.5, hrv: 62, rhr: 47 },
  { date: '2026-07-18', sleep: 8.2, hrv: 65, rhr: 46 },
  { date: '2026-07-19', sleep: 0, hrv: 0, rhr: 0 }, // Race day
]

/** Readiness score progression */
export const DEMO_READINESS_PROGRESSION = [
  { date: '2026-07-07', score: 72, confidence: 0.78 },
  { date: '2026-07-08', score: 75, confidence: 0.80 },
  { date: '2026-07-09', score: 78, confidence: 0.82 },
  { date: '2026-07-10', score: 81, confidence: 0.84 },
  { date: '2026-07-11', score: 85, confidence: 0.87 },
  { date: '2026-07-14', score: 82, confidence: 0.85 },
  { date: '2026-07-15', score: 84, confidence: 0.86 },
  { date: '2026-07-16', score: 87, confidence: 0.88 },
  { date: '2026-07-17', score: 92, confidence: 0.93 },
  { date: '2026-07-18', score: 95, confidence: 0.96 },
  { date: '2026-07-19', score: 100, confidence: 1.0 }, // Peak day
]

/** Coach template examples */
export const DEMO_COACH_TEMPLATES = [
  {
    id: 'template-hrz',
    type: 'hrz_zones',
    name: 'Elite Motocross HR Zones',
    zones: {
      z1_recovery: { min: 0, max: 130, description: 'Active recovery' },
      z2_aerobic: { min: 130, max: 155, description: 'Aerobic endurance' },
      z3_tempo: { min: 155, max: 170, description: 'Tempo / sweet spot' },
      z4_threshold: { min: 170, max: 185, description: 'Lactate threshold' },
      z5_VO2max: { min: 185, max: 200, description: 'VO2 max / peak' },
    },
  },
  {
    id: 'template-periodization',
    type: 'periodization',
    name: '16-Week Supercross Periodization',
    phases: [
      'Offseason Build (Weeks 1-4)',
      'Pre-Season Peak (Weeks 5-8)',
      'In-Season Racing (Weeks 9-16)',
    ],
  },
]

/** Multi-rider telemetry example (3 riders, lap data) */
export const DEMO_MULTI_RIDER_TELEMETRY = [
  {
    riderId: 'rider-001',
    riderName: 'Rider A',
    color: '#22c55e',
    laps: [
      { lapNumber: 1, lapTime: 1245, peakHR: 185, avgHR: 172, peakPower: 850, maxSpeed: 62 },
      { lapNumber: 2, lapTime: 1238, peakHR: 187, avgHR: 175, peakPower: 870, maxSpeed: 63 },
      { lapNumber: 3, lapTime: 1242, peakHR: 186, avgHR: 174, peakPower: 865, maxSpeed: 62 },
    ],
  },
  {
    riderId: 'rider-002',
    riderName: 'Rider B',
    color: '#3b82f6',
    laps: [
      { lapNumber: 1, lapTime: 1252, peakHR: 182, avgHR: 168, peakPower: 820, maxSpeed: 60 },
      { lapNumber: 2, lapTime: 1248, peakHR: 184, avgHR: 171, peakPower: 835, maxSpeed: 61 },
      { lapNumber: 3, lapTime: 1250, peakHR: 183, avgHR: 170, peakPower: 830, maxSpeed: 61 },
    ],
  },
  {
    riderId: 'rider-003',
    riderName: 'Rider C',
    color: '#f59e0b',
    laps: [
      { lapNumber: 1, lapTime: 1258, peakHR: 180, avgHR: 165, peakPower: 800, maxSpeed: 59 },
      { lapNumber: 2, lapTime: 1255, peakHR: 181, avgHR: 167, peakPower: 815, maxSpeed: 60 },
      { lapNumber: 3, lapTime: 1256, peakHR: 182, avgHR: 166, peakPower: 810, maxSpeed: 60 },
    ],
  },
]

export function generateDemoAssignments() {
  return DEMO_TRAINING_LOG.map((log, idx) => ({
    id: `assignment-${idx}`,
    spec: log.assignment,
    assignedAt: new Date(log.date),
    dueAt: new Date(new Date(log.date).getTime() + 18 * 60 * 60 * 1000), // Due 6pm same day
    acknowledgedAt: new Date(new Date(log.date).getTime() + 5 * 60 * 1000), // Acknowledged 5 min later
    status: 'completed' as const,
    complianceResult: log.completed ? 'COMPLIANT' : 'FAILED',
  }))
}
