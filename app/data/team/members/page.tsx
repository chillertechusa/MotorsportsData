'use client'

import { useState, useEffect } from 'react'
import { Trash2, Edit2, Plus, Search } from 'lucide-react'
import { InviteMemberModal } from '@/components/invite-member-modal'
import { RolePermissionEditor } from '@/components/role-permission-editor'

interface TeamMember {
  id: string
  user_id: string
  email: string
  name: string
  role: string
  created_at: string
}

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-red-100 text-red-800',
  coach: 'bg-blue-100 text-blue-800',
  mechanic: 'bg-orange-100 text-orange-800',
  mechanic_coach: 'bg-purple-100 text-purple-800',
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  coach: 'Coach',
  mechanic: 'Mechanic',
  mechanic_coach: 'Mechanic Coach',
}

export default function TeamMembersPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showAddMember, setShowAddMember] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [editingRole, setEditingRole] = useState<string>('')

  // Load team members
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const teamId = new URLSearchParams(window.location.search).get('team_id')
        if (!teamId) {
          console.error('[v0] No team_id in URL')
          return
        }

        const response = await fetch(`/api/team-members?team_id=${teamId}`)
        if (!response.ok) throw new Error('Failed to load members')
        const data = await response.json()
        setMembers(data.members || [])
      } catch (error) {
        console.error('[v0] Failed to load members:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMembers()
  }, [])

  // Filter members
  useEffect(() => {
    let filtered = members

    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(m => m.role === roleFilter)
    }

    setFilteredMembers(filtered)
  }, [members, searchQuery, roleFilter])



  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      const response = await fetch(`/api/team-members/${memberId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to remove member')
      setMembers(members.filter(m => m.id !== memberId))
    } catch (error) {
      console.error('[v0] Failed to remove member:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto mb-4"></div>
          <p>Loading team members...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black">Team Members</h1>
            <p className="text-gray-600 mt-2">Manage your team and member roles</p>
          </div>
          <button
            onClick={() => setShowAddMember(true)}
            className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-black font-bold rounded hover:bg-lime-400 transition"
          >
            <Plus className="h-5 w-5" />
            Add Member
          </button>
        </div>

        {/* Invite Modal */}
        {(() => {
          const teamId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('team_id') : ''
          return (
            <InviteMemberModal
              teamId={teamId || ''}
              isOpen={showAddMember}
              onClose={() => setShowAddMember(false)}
              onInviteSent={() => {
                const loadMembers = async () => {
                  try {
                    const response = await fetch(`/api/team-members?team_id=${teamId}`)
                    if (response.ok) {
                      const data = await response.json()
                      setMembers(data.members || [])
                    }
                  } catch (error) {
                    console.error('[v0] Failed to reload members:', error)
                  }
                }
                loadMembers()
              }}
            />
          )
        })()}

        {/* Role Permission Editor */}
        {editingMemberId && (
          <RolePermissionEditor
            memberId={editingMemberId}
            memberEmail={members.find(m => m.id === editingMemberId)?.email || ''}
            currentRole={members.find(m => m.id === editingMemberId)?.role || 'mechanic'}
            isOpen={!!editingMemberId}
            onClose={() => setEditingMemberId(null)}
            onSave={(newRole) => {
              setMembers(
                members.map(m => (m.id === editingMemberId ? { ...m, role: newRole } : m))
              )
              setEditingMemberId(null)
            }}
          />
        )}

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owner</option>
            <option value="coach">Coach</option>
            <option value="mechanic">Mechanic</option>
            <option value="mechanic_coach">Mechanic Coach</option>
          </select>
        </div>

        {/* Members Table */}
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {members.length === 0
                ? 'No team members yet. Add your first member!'
                : 'No members match your filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-300 rounded">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Name</th>
                  <th className="px-6 py-4 text-left font-semibold">Email</th>
                  <th className="px-6 py-4 text-left font-semibold">Role</th>
                  <th className="px-6 py-4 text-left font-semibold">Joined</th>
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map(member => (
                  <tr key={member.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{member.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-gray-600">{member.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                          ROLE_COLORS[member.role] || 'bg-gray-100'
                        }`}
                      >
                        {ROLE_LABELS[member.role] || member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingMemberId(member.id)
                            setEditingRole(member.role)
                          }}
                          className="p-2 text-gray-600 hover:text-lime-500 transition"
                          title="Edit role"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-2 text-gray-600 hover:text-red-500 transition"
                          title="Remove member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-8">
          <div className="p-4 bg-gray-100 rounded">
            <p className="text-gray-600 text-sm">Total Members</p>
            <p className="text-2xl font-bold">{members.length}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded">
            <p className="text-gray-600 text-sm">Owners</p>
            <p className="text-2xl font-bold">{members.filter(m => m.role === 'owner').length}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded">
            <p className="text-gray-600 text-sm">Mechanics</p>
            <p className="text-2xl font-bold">{members.filter(m => m.role?.includes('mechanic')).length}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded">
            <p className="text-gray-600 text-sm">Coaches</p>
            <p className="text-2xl font-bold">{members.filter(m => m.role?.includes('coach')).length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
