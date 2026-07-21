'use client'

import { useState } from 'react'
import { X, Save, Loader } from 'lucide-react'

interface RolePermissionEditorProps {
  memberId: string
  memberEmail: string
  currentRole: string
  isOpen: boolean
  onClose: () => void
  onSave: (newRole: string) => void
}

type RoleDef = {
  label: string
  group: string
  description: string
  permissions: string[]
}

const ROLE_PERMISSIONS: Record<string, RoleDef> = {
  owner: {
    label: 'Owner',
    group: 'Leadership',
    description: 'Team principal with full authority over everything.',
    permissions: [
      'Full team access',
      'Manage team members',
      'Update team settings',
      'View billing',
      'Manage subscriptions',
      'Access all reports',
      'Invite new members',
    ],
  },
  team_manager: {
    label: 'Team Manager',
    group: 'Leadership',
    description: 'Runs day-to-day operations, personnel, logistics and billing.',
    permissions: [
      'View all team sessions',
      'Manage team members',
      'Invite new members',
      'View billing',
      'Manage subscription',
      'Edit race schedule',
      'Manage sponsors',
      'View team analytics',
    ],
  },
  crew_chief: {
    label: 'Crew Chief',
    group: 'Technical',
    description: 'Head wrench — leads all mechanics and owns setup decisions.',
    permissions: [
      'View all team sessions',
      'Create & manage sessions',
      'View telemetry',
      'View & edit setup sheets',
      'Manage vehicles',
      'Manage work orders',
      'Rig Doctor AI',
      'Pit bay assignments',
    ],
  },
  mechanic: {
    label: 'Mechanic',
    group: 'Technical',
    description: 'Maintains the bike, logs setups and work orders.',
    permissions: [
      'View team sessions',
      'Create & end sessions',
      'View & edit setup sheets',
      'Upload telemetry',
      'Create work orders',
      'View & order parts',
      'Rig Doctor AI',
    ],
  },
  mechanic_coach: {
    label: 'Mechanic Coach',
    group: 'Technical',
    description: 'Dual role — bike maintenance plus trackside coaching.',
    permissions: [
      'View team sessions',
      'Create & end sessions',
      'View & edit setup sheets',
      'Upload telemetry',
      'View telemetry',
      'Manage work orders',
      'Coach riders',
      'Create training plans',
    ],
  },
  data_analyst: {
    label: 'Data Analyst',
    group: 'Technical',
    description: 'Reads all performance data and exports it. Factory Rig only.',
    permissions: [
      'View all sessions',
      'View telemetry',
      'Multi-rider overlay',
      'View setup sheets',
      'Export all data (raw)',
      'Team & fleet analytics',
      'Rig Doctor AI',
    ],
  },
  coach: {
    label: 'Coach',
    group: 'Coaching & Health',
    description: 'Develops the rider — technique, strategy, feedback.',
    permissions: [
      'View team sessions',
      'View telemetry',
      'Coach riders',
      'Create training plans',
      'Video analysis',
      'View analytics',
      'AI Coaching',
    ],
  },
  trainer: {
    label: 'Trainer',
    group: 'Coaching & Health',
    description: 'Physical conditioning. Health data is rider-consent gated.',
    permissions: [
      'View team sessions',
      'Fitness tracking',
      'Training plans',
      'Readiness score',
      'Nutrition log',
      'Rider health (with consent)',
    ],
  },
  physio: {
    label: 'Physio',
    group: 'Coaching & Health',
    description: 'Injury care & prevention. Health data is rider-consent gated.',
    permissions: [
      'View team sessions',
      'Injury log (view & edit)',
      'Readiness score',
      'Recovery analytics',
      'Terra biometrics',
      'Rider health (with consent)',
    ],
  },
  truck_driver: {
    label: 'Truck Driver',
    group: 'Operations',
    description: 'Hauls the rig. Logistics only — no rider or setup data.',
    permissions: [
      'View race schedule',
      'Pit bay assignments',
      'Vehicle/equipment manifest',
      'Weather data',
    ],
  },
  media_manager: {
    label: 'Media Manager',
    group: 'Operations',
    description: 'Content, social and sponsor visibility. No setup/health data.',
    permissions: [
      'View race schedule',
      'View team info',
      'Manage media library',
      'Upload media',
      'Sponsor press reports',
    ],
  },
}

const ROLE_GROUP_ORDER = ['Leadership', 'Technical', 'Coaching & Health', 'Operations']

export function RolePermissionEditor({
  memberId,
  memberEmail,
  currentRole,
  isOpen,
  onClose,
  onSave,
}: RolePermissionEditorProps) {
  const [selectedRole, setSelectedRole] = useState(currentRole)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (selectedRole === currentRole) {
      onClose()
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/team-members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      })

      if (!response.ok) throw new Error('Failed to update role')
      onSave(selectedRole)
      onClose()
    } catch (error) {
      console.error('[v0] Failed to save role:', error)
      alert('Failed to update role')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground border border-border rounded-lg shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-balance">Edit Member Role</h2>
            <p className="text-muted-foreground mt-1">{memberEmail}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {/* Role Selection, grouped by category */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">Select Role</h3>
            <div className="flex flex-col gap-5">
              {ROLE_GROUP_ORDER.map((group) => {
                const rolesInGroup = Object.entries(ROLE_PERMISSIONS).filter(
                  ([, data]) => data.group === group,
                )
                if (rolesInGroup.length === 0) return null
                return (
                  <div key={group}>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                      {group}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {rolesInGroup.map(([roleKey, roleData]) => (
                        <button
                          key={roleKey}
                          onClick={() => setSelectedRole(roleKey)}
                          className={`p-4 border-2 rounded-lg text-left transition ${
                            selectedRole === roleKey
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-muted-foreground/40'
                          }`}
                        >
                          <p className="font-semibold text-foreground">{roleData.label}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {roleData.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Permissions Display */}
          {ROLE_PERMISSIONS[selectedRole] && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Permissions — {ROLE_PERMISSIONS[selectedRole].label}
              </h3>
              <div className="bg-muted rounded-lg p-4">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ROLE_PERMISSIONS[selectedRole].permissions.map((permission, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-foreground">
                      <span className="w-2 h-2 bg-primary rounded-full shrink-0" aria-hidden="true" />
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-border">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || selectedRole === currentRole}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Role
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
