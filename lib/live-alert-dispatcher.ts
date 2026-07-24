import { db } from '@/lib/db'
import { mdLiveAlerts, mdAlertThresholds, mdLiveSessions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

interface TelemetryPoint {
  timestamp: number
  lapNumber: number
  lapTimeSeconds?: number
  speed: number
  throttle: number
  brakePressure?: number
  tirePressFront?: number
  tirePressRear?: number
  engineTempC?: number
  engineRpmK?: number
  gLateral?: number
  gLongitudinal?: number
}

interface LiveAlert {
  alertType: string
  severity: 'INFO' | 'WARNING' | 'CRITICAL'
  message: string
  triggerData: Record<string, unknown>
  recommendation: string
}

/** Process telemetry points and generate alerts based on thresholds */
export async function processTelemetryAlerts(
  liveSessionId: string,
  teamId: string,
  telemetryPoints: TelemetryPoint[],
  recentLapTimes: number[]
) {
  const thresholds = await db
    .select()
    .from(mdAlertThresholds)
    .where(eq(mdAlertThresholds.teamId, teamId))
    .then((r) => r[0])

  if (!thresholds) {
    return // No thresholds configured
  }

  const alerts: LiveAlert[] = []

  for (const point of telemetryPoints) {
    // Tire temperature alert
    if (point.tirePressFront || point.tirePressRear) {
      const maxTireTemp = Math.max(
        point.tirePressFront || 0,
        point.tirePressRear || 0
      )

      if (maxTireTemp > (thresholds.tireTempHighCritical ?? 0)) {
        alerts.push({
          alertType: 'TIRE_TEMP',
          severity: 'CRITICAL',
          message: `CRITICAL: Tire temperature ${maxTireTemp}°C exceeds maximum (${thresholds.tireTempHighCritical}°C)`,
          triggerData: { tireTemp: maxTireTemp, maxTemp: thresholds.tireTempHighCritical },
          recommendation: 'Reduce pace immediately. Check tire wear and brake balance. Pit for tire change if condition persists.',
        })
      } else if (maxTireTemp > (thresholds.tireTempHighWarn ?? 0)) {
        alerts.push({
          alertType: 'TIRE_TEMP',
          severity: 'WARNING',
          message: `WARNING: Tire temperature ${maxTireTemp}°C is elevated`,
          triggerData: { tireTemp: maxTireTemp, warnTemp: thresholds.tireTempHighWarn },
          recommendation: 'Monitor tire temp. Consider easier inputs. Check suspension setup.',
        })
      }
    }

    // Engine temperature alert
    if (point.engineTempC) {
      if (point.engineTempC > (thresholds.engineTempHighCritical ?? 0)) {
        alerts.push({
          alertType: 'ENGINE_OVERHEAT',
          severity: 'CRITICAL',
          message: `CRITICAL: Engine temperature ${point.engineTempC}°C exceeds max (${thresholds.engineTempHighCritical}°C)`,
          triggerData: { engineTemp: point.engineTempC, maxTemp: thresholds.engineTempHighCritical },
          recommendation: 'Reduce RPM and pace immediately. Check coolant level. Consider pit stop.',
        })
      } else if (point.engineTempC > (thresholds.engineTempHighWarn ?? 0)) {
        alerts.push({
          alertType: 'ENGINE_OVERHEAT',
          severity: 'WARNING',
          message: `WARNING: Engine temperature ${point.engineTempC}°C is elevated`,
          triggerData: { engineTemp: point.engineTempC, warnTemp: thresholds.engineTempHighWarn },
          recommendation: 'Monitor engine temp. Reduce RPM slightly. Check radiator airflow.',
        })
      }
    }

    // Pace drop detection
    if (point.lapTimeSeconds && recentLapTimes.length >= 3) {
      const lastThreeLaps = recentLapTimes.slice(-3)
      const bestLapTime = Math.min(...lastThreeLaps)
      const currentDelta = point.lapTimeSeconds - bestLapTime

      if (currentDelta > (thresholds.paceDropCriticalSeconds ?? 0)) {
        alerts.push({
          alertType: 'PACE_DROP',
          severity: 'CRITICAL',
          message: `CRITICAL: Pace drop ${currentDelta.toFixed(2)}s vs best lap`,
          triggerData: { currentLap: point.lapTimeSeconds, bestLap: bestLapTime, delta: currentDelta },
          recommendation: 'Check tire condition, fuel load, and suspension setup. Review recent inputs.',
        })
      } else if (currentDelta > (thresholds.paceDropWarnSeconds ?? 0)) {
        alerts.push({
          alertType: 'PACE_DROP',
          severity: 'WARNING',
          message: `WARNING: Pace drop ${currentDelta.toFixed(2)}s vs best lap`,
          triggerData: { currentLap: point.lapTimeSeconds, bestLap: bestLapTime, delta: currentDelta },
          recommendation: 'Review inputs and tire feel. Check for mechanical issues.',
        })
      }
    }
  }

  // Store alerts in database
  if (alerts.length > 0) {
    await db.insert(mdLiveAlerts).values(
      alerts.map((alert) => ({
        liveSessionId,
        alertType: alert.alertType,
        severity: alert.severity,
        message: alert.message,
        triggerData: alert.triggerData,
        recommendation: alert.recommendation,
      }))
    )
  }

  return alerts
}

/** Get active alerts for a live session */
export async function getActiveAlerts(liveSessionId: string) {
  return await db
    .select()
    .from(mdLiveAlerts)
    .where(
      and(
        eq(mdLiveAlerts.liveSessionId, liveSessionId),
        eq(mdLiveAlerts.acknowledgedAt, null)
      )
    )
}

/** Acknowledge an alert */
export async function acknowledgeAlert(alertId: string) {
  return await db
    .update(mdLiveAlerts)
    .set({ acknowledgedAt: new Date() })
    .where(eq(mdLiveAlerts.id, alertId))
}
