'use client'

import { useState, useEffect } from 'react'
import { Trash2, Ban, Shield, Mail, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { User } from 'better-auth'

export default function OwnerUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showAuditLog, setShowAuditLog] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/owner/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('[v0] User fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuspendUser = async (userId: string) => {
    if (!confirm('Suspend this user? They will not be able to log in.')) return
    try {
      const response = await fetch('/api/owner/users/suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (response.ok) {
        await fetchUsers()
      }
    } catch (error) {
      console.error('[v0] Suspend error:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Delete this user permanently? This action cannot be undone.')) return
    try {
      const response = await fetch('/api/owner/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (response.ok) {
        await fetchUsers()
      }
    } catch (error) {
      console.error('[v0] Delete error:', error)
    }
  }

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/owner/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })
      if (response.ok) {
        await fetchUsers()
      }
    } catch (error) {
      console.error('[v0] Role change error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-6 flex items-center justify-center">
        <p className="text-zinc-400">Loading users...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-100 mb-2">User Management</h1>
          <p className="text-zinc-400">Manage platform users, roles, and account status</p>
        </div>

        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-300">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-300">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-300">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-300">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-300">Joined</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-zinc-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-zinc-100">{user.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-zinc-300">{user.email}</td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role || 'user'}
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100"
                      >
                        <option value="user">User</option>
                        <option value="coach">Coach</option>
                        <option value="admin">Admin</option>
                        <option value="owner">Owner</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          user.banned
                            ? 'bg-red-500/15 text-red-400'
                            : 'bg-lime-500/15 text-lime-400'
                        }`}
                      >
                        {user.banned ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowAuditLog(true)
                          }}
                          className="p-2 hover:bg-zinc-800 rounded transition-colors"
                          title="View audit log"
                        >
                          <Clock className="h-4 w-4 text-zinc-400" />
                        </button>
                        {!user.banned && (
                          <button
                            onClick={() => handleSuspendUser(user.id)}
                            className="p-2 hover:bg-amber-500/10 rounded transition-colors"
                            title="Suspend user"
                          >
                            <Ban className="h-4 w-4 text-amber-500" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 hover:bg-red-500/10 rounded transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedUser && showAuditLog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-2xl w-full max-h-96 overflow-auto p-6">
              <h2 className="text-xl font-bold text-zinc-100 mb-4">
                Audit Log — {selectedUser.name}
              </h2>
              <div className="space-y-3 text-sm">
                <p className="text-zinc-400">
                  <strong>Account Created:</strong> {new Date(selectedUser.createdAt).toLocaleString()}
                </p>
                <p className="text-zinc-400">
                  <strong>Last Login:</strong> {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}
                </p>
                <p className="text-zinc-400">
                  <strong>Role:</strong> {selectedUser.role || 'user'}
                </p>
                <p className="text-zinc-400">
                  <strong>Status:</strong> {selectedUser.banned ? 'Suspended' : 'Active'}
                </p>
              </div>
              <button
                onClick={() => setShowAuditLog(false)}
                className="mt-6 w-full bg-lime-500 hover:bg-lime-600 text-black font-semibold py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
