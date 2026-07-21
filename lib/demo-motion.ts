// Motion-first demo engine.
// EVERY value is a pure function of time `t` (seconds) so the demo animates at
// 60fps AND scrubbing/seeking stays perfectly deterministic.

export const SCENE_LENGTH = 5 // seconds per scene
export const SCENE_COUNT = 32 // distinct sections — each a different feature
export const DEMO_DURATION = SCENE_COUNT * SCENE_LENGTH // 160 seconds

// ── math helpers ───────────────────────────────────────────────
export function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}
export function lerp(a: number, b: number, x: number) {
  return a + (b - a) * clamp(x, 0, 1)
}
export function easeInOut(x: number) {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
}
export function easeOut(x: number) {
  return 1 - Math.pow(1 - x, 3)
}

// Smooth pseudo-random oscillation — layered sines so it never looks periodic.
export function wobble(t: number, seed = 0, speed = 1) {
  return (
    Math.sin(t * speed * 1.7 + seed * 12.9) * 0.5 +
    Math.sin(t * speed * 0.9 + seed * 7.3) * 0.3 +
    Math.sin(t * speed * 2.6 + seed * 3.1) * 0.2
  )
}

// Map wobble (-1..1) into a [min,max] band centered with some liveliness.
export function oscBand(t: number, min: number, max: number, seed = 0, speed = 1) {
  const w = (wobble(t, seed, speed) + 1) / 2 // 0..1
  return min + w * (max - min)
}

// Which scene index is active at time t (0..23).
export function sceneIndexAt(t: number) {
  return clamp(Math.floor(t / SCENE_LENGTH), 0, SCENE_COUNT - 1)
}
// Local progress 0..1 within the current scene.
export function sceneProgress(t: number) {
  return (t % SCENE_LENGTH) / SCENE_LENGTH
}
// Intro reveal ramp for the first ~0.6s of a scene (for entrance animations).
export function sceneReveal(t: number) {
  return easeOut(clamp(sceneProgress(t) / 0.12, 0, 1))
}

// ── live telemetry (continuously moving) ───────────────────────
export type LiveVals = {
  speed: number
  rpm: number
  throttle: number
  brake: number
  lean: number
  gForce: number
  heartRate: number
  suspF: number
  suspR: number
  engineTemp: number
  tirePress: number
  lapMs: number
}

export function liveVals(t: number): LiveVals {
  // Simulate a lap: throttle/speed surge on straights, brake+lean in corners.
  const corner = (Math.sin(t * 0.8) + 1) / 2 // 0 straight .. 1 apex
  const straight = 1 - corner
  return {
    speed: oscBand(t, 42, 78, 1, 1.1) * straight + 28 * corner,
    rpm: oscBand(t, 6.2, 13.4, 2, 1.4),
    throttle: clamp(straight * oscBand(t, 70, 100, 3, 1.6) + corner * 18, 0, 100),
    brake: clamp(corner * oscBand(t, 55, 95, 4, 1.8), 0, 100),
    lean: (corner * oscBand(t, 28, 46, 5, 1.2)) * (Math.sin(t * 0.8) > 0 ? 1 : -1),
    gForce: 0.6 + corner * oscBand(t, 0.8, 2.3, 6, 1.5),
    heartRate: Math.round(oscBand(t, 158, 178, 7, 0.5)),
    suspF: oscBand(t, 28, 92, 8, 2.2),
    suspR: oscBand(t, 34, 104, 9, 2.0),
    engineTemp: Math.round(oscBand(t, 86, 104, 10, 0.3)),
    tirePress: 12 + oscBand(t, -0.4, 0.6, 11, 0.4),
    lapMs: (t % 90) * 1000, // rolling lap clock
  }
}

// ── scrolling waveform points (ECG / telemetry trace) ──────────
// Returns y-values across the width; scrolls left as t advances.
export function wavePoints(t: number, n: number, kind: 'ecg' | 'sine' | 'throttle' = 'sine') {
  const pts: number[] = []
  for (let i = 0; i < n; i++) {
    const x = i / (n - 1)
    const phase = x * Math.PI * (kind === 'ecg' ? 6 : 4) - t * 3.2
    let y: number
    if (kind === 'ecg') {
      const beat = Math.pow(Math.max(0, Math.sin(phase)), 14)
      y = 0.5 - (Math.sin(phase * 0.5) * 0.08 + beat * 0.42)
    } else if (kind === 'throttle') {
      y = 0.5 - Math.sign(Math.sin(phase)) * 0.32 * clamp(Math.abs(Math.sin(phase)) * 3, 0, 1)
    } else {
      y = 0.5 - (Math.sin(phase) * 0.3 + Math.sin(phase * 2.3) * 0.12)
    }
    pts.push(clamp(y, 0.05, 0.95))
  }
  return pts
}
