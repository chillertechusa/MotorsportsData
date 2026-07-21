/**
 * Readiness Score Algorithm
 * Calculates race-day peak prediction based on sleep, HRV, and training volume
 */

export interface ReadinessInputs {
  sleepHours: number // Last night's sleep (6-10 hours ideal)
  sleepQuality: number // 0-100 scale
  hrv: number // Heart rate variability in ms (40-100+ is healthy)
  trackVolumeMinutes: number // This week's cumulative hard minutes
  lastHardSessionMinutes?: number // Minutes from yesterday's hardest session
  temperature: number // Core body temp (37.2°C ideal, 37.5°C elevated)
  humidity?: number // Environmental humidity (affects thermal load)
  daysUntilRace: number // 0 = race day, 1 = tomorrow, 7 = next week
}

export interface ReadinessScore {
  overall: number // 0-100 percentage
  sleepComponent: number // 0-100
  hrvComponent: number // 0-100
  volumeComponent: number // 0-100
  tapperRecommendation: string
  peakProbability: number // 0-100% chance of peak performance race day
  confidence: number // 0-100% confidence in prediction
  warnings: string[]
}

/**
 * Calculate rider readiness score
 * Elite coaches use this to dial in peak performance
 */
export function calculateReadinessScore(inputs: ReadinessInputs): ReadinessScore {
  const warnings: string[] = []

  // ─────────────────────────────────────────────────────────────
  // SLEEP COMPONENT (0-100)
  // ─────────────────────────────────────────────────────────────
  let sleepScore = 0
  if (inputs.sleepHours < 6) {
    sleepScore = inputs.sleepHours * 10 // 60 for 6 hours
    warnings.push('Severe sleep debt. Readiness will not peak until night recovery.')
  } else if (inputs.sleepHours >= 6 && inputs.sleepHours <= 9) {
    // Sweet spot: 7-9 hours peaks at 95
    sleepScore = 50 + (inputs.sleepHours - 6) * 15
  } else if (inputs.sleepHours > 9) {
    // Over-sleeping can harm (diminishing returns)
    sleepScore = Math.max(85, 95 - (inputs.sleepHours - 9) * 5)
  }

  sleepScore = Math.min(100, sleepScore * (inputs.sleepQuality / 100))

  // ─────────────────────────────────────────────────────────────
  // HRV COMPONENT (0-100)
  // Elite riders: HRV > 60ms is excellent
  // ─────────────────────────────────────────────────────────────
  let hrvScore = 0
  if (inputs.hrv < 30) {
    hrvScore = 20 // Stressed, sympathetic nervous system dominates
    warnings.push('HRV critically low. Rider is highly stressed or overreached.')
  } else if (inputs.hrv >= 30 && inputs.hrv < 50) {
    hrvScore = 40 + (inputs.hrv - 30) * 1.5 // 40-70
  } else if (inputs.hrv >= 50) {
    hrvScore = 70 + Math.min(30, (inputs.hrv - 50) * 1.5) // 70-100
  }

  // Temperature adjustment: elevated core temp suppresses HRV
  if (inputs.temperature > 37.5) {
    hrvScore *= 0.9
    warnings.push(`Elevated core temp (${inputs.temperature}°C). Reduce intensity to cool down.`)
  }

  // ─────────────────────────────────────────────────────────────
  // VOLUME COMPONENT (0-100)
  // Tracks cumulative hard minutes this week
  // Elite coaches balance fatigue vs. freshness
  // ─────────────────────────────────────────────────────────────
  let volumeScore = 0
  if (inputs.trackVolumeMinutes < 60) {
    // Under-trained
    volumeScore = inputs.trackVolumeMinutes * 0.8
    warnings.push('Volume is low. Rider may not have sufficient neuromuscular readiness.')
  } else if (inputs.trackVolumeMinutes >= 60 && inputs.trackVolumeMinutes <= 240) {
    // Sweet spot: 1-4 hours hard work in a week peaks at 95
    volumeScore = 50 + (inputs.trackVolumeMinutes - 60) * 0.25
  } else {
    // Over-trained
    volumeScore = Math.max(50, 95 - (inputs.trackVolumeMinutes - 240) * 0.15)
    warnings.push('Volume is high. Rider may be entering overreach zone. Taper now.')
  }

  // Last session recency: if hard session was yesterday, rider still recovering
  if (inputs.lastHardSessionMinutes && inputs.lastHardSessionMinutes > 30) {
    volumeScore *= 0.85 // Knock 15% off for acute fatigue
  }

  // ─────────────────────────────────────────────────────────────
  // OVERALL READINESS
  // ─────────────────────────────────────────────────────────────
  const overallScore = (sleepScore * 0.35 + hrvScore * 0.35 + volumeScore * 0.3) as number

  // ─────────────────────────────────────────────────────────────
  // PEAK PROBABILITY (0-100%)
  // Predicts likelihood of peak performance on race day
  // ─────────────────────────────────────────────────────────────
  let peakProbability = 0
  const daysToRace = inputs.daysUntilRace

  if (overallScore >= 85) {
    peakProbability = Math.min(98, 85 + (overallScore - 85) * 1.3)
  } else if (overallScore >= 70) {
    peakProbability = 65 + (overallScore - 70) * 0.4
  } else {
    peakProbability = overallScore * 0.7
  }

  // Taper effect: if 2-3 days to race, current readiness becomes peak prediction
  if (daysToRace <= 3 && daysToRace >= 1) {
    // Taper window: maintain volume, maximize recovery
    peakProbability += 8
  } else if (daysToRace <= 0) {
    // Race day: use today's readiness as final score
    peakProbability = overallScore
  }

  // ─────────────────────────────────────────────────────────────
  // TAPPER RECOMMENDATION
  // ─────────────────────────────────────────────────────────────
  let tapperRecommendation = ''

  if (daysToRace > 7) {
    // Build phase
    if (overallScore < 60) {
      tapperRecommendation = `${inputs.trackVolumeMinutes < 120 ? 'INCREASE' : 'OPTIMIZE'} volume. Add 20-30 min track work today. Target 200+ min for week. Sleep quality is key.`
    } else {
      tapperRecommendation = 'MAINTAIN volume. Continue current training load. Monitor sleep closely.'
    }
  } else if (daysToRace <= 7 && daysToRace > 3) {
    // Taper begins
    if (overallScore < 75) {
      tapperRecommendation = `REDUCE volume by 30%. 2 short, easy sessions this week. Sleep 8-9 hours nightly. Peak readiness targets day of race.`
    } else {
      tapperRecommendation = 'MAINTENANCE taper. 1 short session midweek (15 min easy). Rest remainder of week. Hydrate, sleep 8+ hours.'
    }
  } else if (daysToRace <= 3) {
    // Hard taper
    if (overallScore >= 90) {
      tapperRecommendation = 'RACE DAY PROTOCOL: 15 min easy spin this morning only. Rest all afternoon. Sleep 8+ hours tonight. You are peaked.'
    } else if (overallScore >= 75) {
      tapperRecommendation = 'SHORT taper. 20 min easy pace today. ZERO intensity tomorrow. Sleep 8+ hours both nights.'
    } else {
      tapperRecommendation = 'ABORT race if possible. Readiness is low. If must race, easy spin today, full rest tomorrow, sleep 9+ hours.'
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CONFIDENCE IN PREDICTION
  // ─────────────────────────────────────────────────────────────
  let confidence = 75 // Base confidence

  // More confidence if we have historical data
  if (inputs.hrv > 0 && inputs.sleepHours > 0 && inputs.trackVolumeMinutes > 0) {
    confidence = 85
  }

  // Less confidence close to race if data is incomplete
  if (daysToRace <= 1 && inputs.lastHardSessionMinutes === undefined) {
    confidence = 70
  }

  return {
    overall: Math.round(overallScore),
    sleepComponent: Math.round(sleepScore),
    hrvComponent: Math.round(hrvScore),
    volumeComponent: Math.round(volumeScore),
    tapperRecommendation,
    peakProbability: Math.round(peakProbability),
    confidence,
    warnings,
  }
}

/**
 * Example usage:
 * 
 * const readiness = calculateReadinessScore({
 *   sleepHours: 8.5,
 *   sleepQuality: 85,
 *   hrv: 65,
 *   trackVolumeMinutes: 180,
 *   lastHardSessionMinutes: 45,
 *   temperature: 37.0,
 *   daysUntilRace: 2,
 * })
 * 
 * console.log(`Race readiness: ${readiness.overall}/100`)
 * console.log(`Peak probability: ${readiness.peakProbability}%`)
 * console.log(`Protocol: ${readiness.tapperRecommendation}`)
 */
