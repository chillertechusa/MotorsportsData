/**
 * Demo Orchestrator — defines the complete 8-scene platform walkthrough.
 * Each scene represents a key moment in the user journey, with timing, transitions, and narrative.
 * Deterministic on `t` (master clock) for smooth scrubbing.
 */

export interface DemoScene {
  id: string
  label: string
  title: string
  subtitle: string
  startTime: number
  duration: number
  type: 'auth' | 'dashboard' | 'training' | 'session' | 'telemetry' | 'coaching' | 'results' | 'metrics'
  narrative: string
  dataHighlights: string[]
}

export const DEMO_SCENES: DemoScene[] = [
  {
    id: 'scene-01-welcome',
    label: '1. Welcome',
    title: 'Sign In',
    subtitle: 'Enter the platform',
    startTime: 0,
    duration: 8,
    type: 'auth',
    narrative: 'Authenticate as a professional racing team to access real-time coaching, telemetry, and performance analytics.',
    dataHighlights: ['Team: Factory Team Elite', 'Rider: Casey Martinez #7', 'Verification: 2FA via email'],
  },
  {
    id: 'scene-02-dashboard',
    label: '2. Dashboard',
    title: 'Rider Dashboard',
    subtitle: 'Readiness overview',
    startTime: 8,
    duration: 10,
    type: 'dashboard',
    narrative: "View your rider's current readiness score, recent training trends, and upcoming sessions at a glance.",
    dataHighlights: ['Readiness: 91/100 (Peak)', 'HRV: 68ms | RHR: 36 BPM | Sleep: 6.5h', 'Trend: ↑ Trending up (+13 points)'],
  },
  {
    id: 'scene-03-training-log',
    label: '3. Training',
    title: 'Training Log',
    subtitle: 'Preparation insights',
    startTime: 18,
    duration: 10,
    type: 'training',
    narrative: 'Monitor daily training: fitness, mental preparation, and setup work. See how each session feeds into race readiness.',
    dataHighlights: ['Fitness: 60 min (Intensity 7)', 'Mental: 45 min visualization drill', 'Setup: 90 min brake optimization'],
  },
  {
    id: 'scene-04-session-overview',
    label: '4. Session',
    title: 'Session Overview',
    subtitle: 'Race session detail',
    startTime: 28,
    duration: 12,
    type: 'session',
    narrative: "Dive into Saturday's qualifying session. Review lap count, speeds, lean angles, and physical demand.",
    dataHighlights: ['12 laps completed', 'Avg speed: 168.7 km/h | Max: 193.5', 'Avg lean: 60.3° | Max lean: 65.1°'],
  },
  {
    id: 'scene-05-live-telemetry',
    label: '5. Telemetry',
    title: 'Live Telemetry',
    subtitle: 'Live data feed',
    startTime: 40,
    duration: 15,
    type: 'telemetry',
    narrative: 'Watch real-time telemetry: speed, RPM, throttle, brake, lean angle, heart rate. See how the rider performs corner-to-corner.',
    dataHighlights: ['Speed: 140–193 km/h', 'Heart Rate: 160–185 BPM', 'Lean angle: 0–65° | Throttle/Brake modulation live'],
  },
  {
    id: 'scene-06-ai-coaching',
    label: '6. AI Coaching',
    title: 'AI Setup Coach',
    subtitle: 'Real-time feedback',
    startTime: 55,
    duration: 12,
    type: 'coaching',
    narrative: 'AI co-pilot provides live coaching. Brake markers, throttle advice, and contextual notes appear on screen during the session.',
    dataHighlights: ['Brake 3m earlier into Turn 7', 'Roll more throttle mid-corner', 'Lean angle looks good. Push hard.'],
  },
  {
    id: 'scene-07-competitive-analysis',
    label: '7. Results',
    title: 'Competitive Analysis',
    subtitle: 'Lap-by-lap comparison',
    startTime: 67,
    duration: 12,
    type: 'results',
    narrative: 'Compare your performance to competitors. Track position changes, gap to leader, and sector-by-sector improvements.',
    dataHighlights: ['Lap 1: P2, +0.14s', 'Lap 2: P1, +0.00s', 'Lap 3: P1, +0.24s gap to P2'],
  },
  {
    id: 'scene-08-business-metrics',
    label: '8. Impact',
    title: 'Business Impact',
    subtitle: 'Season metrics',
    startTime: 79,
    duration: 10,
    type: 'metrics',
    narrative: 'See the big picture: media value generated, sponsor ROI, broadcast exposure, and championship standings.',
    dataHighlights: ['Media value: $2.84M', 'Broadcast: 58 min coverage', 'Sponsor reach: 4.2M | Championship: P3 (378 pts)'],
  },
]

export const DEMO_TOTAL_DURATION = 89 // Total demo length in seconds

/**
 * Get the current scene based on master time `t`.
 * Returns the active scene and progress within that scene (0–1).
 */
export function getCurrentScene(t: number): {
  scene: DemoScene
  progress: number
  isLastScene: boolean
} {
  const activeScene = DEMO_SCENES.find(s => t >= s.startTime && t < s.startTime + s.duration)
  if (!activeScene) {
    // If past the last scene, return the last one
    const lastScene = DEMO_SCENES[DEMO_SCENES.length - 1]
    return { scene: lastScene, progress: 1, isLastScene: true }
  }

  const progress = (t - activeScene.startTime) / activeScene.duration
  const isLastScene = activeScene.id === DEMO_SCENES[DEMO_SCENES.length - 1].id
  return { scene: activeScene, progress, isLastScene }
}
