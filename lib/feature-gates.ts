import { db } from './db'
import { mdFeatureGates, mdFeatureGateLogs, mdTeams } from './db/schema'
import { eq } from 'drizzle-orm'
import { tierRank } from './md-tiers'

/** Rank for a feature-gate minTier. 'owner' is a platform-admin gate handled by
 *  role checks, so it sits above every subscription tier (unreachable by rank). */
function gateRank(tier: string | null | undefined): number {
  if (tier === 'owner') return 99
  return tierRank(tier)
}

export interface FeatureGateConfig {
  key: string
  name: string
  description?: string
  minTier: string
  upsellTier: string
}

// Default feature gates - Complete feature matrix
export const DEFAULT_FEATURE_GATES: FeatureGateConfig[] = [
  // Free Rider (Rookie) - Core features
  { key: 'session-logging', name: 'Session Logging', minTier: 'rookie', upsellTier: 'privateer' },
  { key: 'setup-sheets', name: 'Setup Sheets', minTier: 'rookie', upsellTier: 'privateer' },
  { key: 'basic-analytics', name: 'Basic Analytics', minTier: 'rookie', upsellTier: 'privateer' },
  
  // Privateer - Telemetry & AI
  { key: 'telemetry-upload', name: 'Telemetry Upload', minTier: 'privateer', upsellTier: 'race_team' },
  { key: 'readiness-score', name: 'Readiness Score', minTier: 'privateer', upsellTier: 'race_team' },
  { key: 'ai-coaching', name: 'AI Coaching', minTier: 'privateer', upsellTier: 'race_team' },
  
  // Race Team - Multi-rider & advanced analytics
  { key: 'multi-rider-overlay', name: 'Multi-Rider Overlay', minTier: 'race_team', upsellTier: 'factory_rig' },
  { key: 'team-analytics', name: 'Team Analytics', minTier: 'race_team', upsellTier: 'factory_rig' },
  { key: 'roster-management', name: 'Roster Management', minTier: 'race_team', upsellTier: 'factory_rig' },
  { key: 'schedule-tracking', name: 'Schedule Tracking', minTier: 'race_team', upsellTier: 'factory_rig' },
  
  // Factory Rig - Enterprise
  { key: 'factory-dashboard', name: 'Factory Dashboard', minTier: 'factory_rig', upsellTier: 'owner' },
  { key: 'custom-integrations', name: 'Custom Integrations', minTier: 'factory_rig', upsellTier: 'owner' },
  { key: 'api-access', name: 'API Access', minTier: 'factory_rig', upsellTier: 'owner' },
  { key: 'pit-crew-coordinator', name: 'Pit Crew Coordinator', minTier: 'factory_rig', upsellTier: 'owner' },
  
  // Mechanic (Wrench) - Work orders & portfolio
  { key: 'work-orders', name: 'Work Orders', minTier: 'wrench', upsellTier: 'agent' },
  { key: 'parts-vault', name: 'Parts Vault', minTier: 'wrench', upsellTier: 'agent' },
  { key: 'mechanic-portfolio', name: 'Career Portfolio', minTier: 'wrench', upsellTier: 'agent' },
  
  // Agent - Scouting & rankings
  { key: 'percentile-ranking', name: 'Percentile Ranking', minTier: 'agent', upsellTier: 'owner' },
  { key: 'scouting-tools', name: 'Scouting Tools', minTier: 'agent', upsellTier: 'owner' },
  
  // Coach - Coaching templates & video
  { key: 'coaching-templates', name: 'Coaching Templates', minTier: 'coach', upsellTier: 'owner' },
  { key: 'video-analysis', name: 'Video Analysis', minTier: 'coach', upsellTier: 'owner' },
  { key: 'cross-team-coaching', name: 'Cross-Team Coaching', minTier: 'coach', upsellTier: 'owner' },
  
  // Owner - Platform admin
  { key: 'platform-admin', name: 'Platform Administration', minTier: 'owner', upsellTier: 'owner' },
  { key: 'user-management', name: 'User Management', minTier: 'owner', upsellTier: 'owner' },
  { key: 'billing-management', name: 'Billing Management', minTier: 'owner', upsellTier: 'owner' },
  
  // Additional features across tiers
  { key: 'fitness-tracking', name: 'Fitness Tracking', minTier: 'privateer', upsellTier: 'race_team' },
  { key: 'mental-logging', name: 'Mental Log', minTier: 'privateer', upsellTier: 'race_team' },
  { key: 'injury-tracking', name: 'Injury Log', minTier: 'privateer', upsellTier: 'race_team' },
  { key: 'progression-timeline', name: 'Progression Timeline', minTier: 'rookie', upsellTier: 'privateer' },
]

/**
 * Check if a team has access to a feature
 */
export async function hasFeatureAccess(
  teamId: string,
  featureKey: string
): Promise<{ granted: boolean; upsellTier?: string }> {
  try {
    // Get feature gate config
    const gate = await db
      .select()
      .from(mdFeatureGates)
      .where(eq(mdFeatureGates.featureKey, featureKey))
      .limit(1)
      .then(rows => rows[0])

    if (!gate || !gate.enabled) {
      return { granted: true } // Feature disabled/not configured, allow access
    }

    // Get team tier
    const team = await db
      .select()
      .from(mdTeams)
      .where(eq(mdTeams.id, teamId as any))
      .limit(1)
      .then(rows => rows[0])

    if (!team) {
      return { granted: false }
    }

    // Compare tiers using the canonical rank map (all 8 tiers).
    const teamRank = gateRank(team.subscriptionTier || 'rookie')
    const minRank = gateRank(gate.minTier)

    const granted = teamRank >= minRank
    return {
      granted,
      upsellTier: granted ? undefined : gate.upsellTier,
    }
  } catch (error) {
    console.error('[Feature Gates] Error checking access:', error)
    return { granted: false }
  }
}

/**
 * Log a feature gate access attempt (for analytics)
 */
export async function logFeatureGateAccess(
  teamId: string,
  featureKey: string,
  accessGranted: boolean,
  triggeredModal?: boolean,
  clickedUpgrade?: boolean
) {
  try {
    await db.insert(mdFeatureGateLogs).values({
      teamId: teamId as any,
      featureKey,
      accessGranted,
      triggeredModal: triggeredModal || false,
      clickedUpgrade: clickedUpgrade || false,
    })
  } catch (error) {
    console.error('[Feature Gates] Error logging access:', error)
  }
}

/**
 * Initialize default feature gates (run once on startup)
 */
export async function initializeDefaultGates() {
  try {
    for (const gate of DEFAULT_FEATURE_GATES) {
      const existing = await db
        .select()
        .from(mdFeatureGates)
        .where(eq(mdFeatureGates.featureKey, gate.key))
        .limit(1)
        .then(rows => rows[0])

      if (!existing) {
        await db.insert(mdFeatureGates).values({
          featureKey: gate.key,
          featureName: gate.name,
          description: gate.description,
          minTier: gate.minTier,
          upsellTier: gate.upsellTier,
          enabled: true,
        })
      }
    }
  } catch (error) {
    console.error('[Feature Gates] Error initializing gates:', error)
  }
}
