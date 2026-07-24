'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trash2, Ban, CheckCircle2, Shield, Clock, RefreshCw, UserCog } from 'lucide-react'

type PlatformUser = {
  id: string
  name: string | null
  email: string
  role: string | null
  banned: boolean | null
  bannedAt: string | null
  banReason: string | null
  createdAt: string
}

export default function OwnerUsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([])
  const [loading, setLoading] = useState(true)
  const [actionPending, setActionPending] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/owner/users')
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data.users ?? [])
    } catch (e) {
      setError('Could not load users.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleSuspend = async (u: PlatformUser) => {
    if (!confirm(`Suspend ${u.email}? Their account will be locked but not deleted.`)) return
    setActionPending(u.id)
    const res = await fetch('/api/owner/users/suspend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: u.id }),
    })
    setActionPending(null)
    if (res.ok) fetchUsers()
    else alert('Failed to suspend user.')
  }

  const handleUnsuspend = async (u: PlatformUser) => {
    setActionPending(u.id)
    const res = await fetch('/api/owner/users/suspend', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: u.id }),
    })
    setActionPending(null)
    if (res.ok) fetchUsers()
    else alert('Failed to unsuspend user.')
  }

  const handleDelete = async (u: PlatformUser) => {
    if (!confirm(`Permanently delete ${u.email}? This cannot be undone.`)) return
    setActionPending(u.id)
    const res = await fetch('/api/owner/users/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: u.id }),
    })
    setActionPending(null)
    if (res.ok) fetchUsers()
    else alert('Failed to delete user.')
  }

  const handleRoleChange = async (userId: string, role: string) => {
    const res = await fetch('/api/owner/users/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    })
    if (res.ok) fetchUsers()
    else alert('Failed to update role.')
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">King Console</p>
            <h1 className="text-3xl font-black uppercase text-zinc-100" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
              User Management
            </h1>
            <p className="text-zinc-500 text-sm mt-1">Suspend, delete, and assign roles. Suspend preserves data. Delete is permanent.</p>
          </div>
          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors font-mono text-xs uppercase tracking-wider disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg border border-red-800 bg-red-950/40 text-red-400 text-sm">{error}</div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Users', value: users.length },
            { label: 'Active', value: users.filter(u => !u.banned).length },
            { label: 'Suspended', value: users.filter(u => u.banned).length },
          ].map(stat => (
            <div key={stat.label} className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{stat.label}</p>
              <p className="text-2xl font-black text-zinc-100 mt-0.5">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60">
                  <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">Name / Email</th>
                  <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">Role</th>
                  <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">Status</th>
                  <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">Joined</th>
                  <th className="px-5 py-3 text-right font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-zinc-500 text-sm">Loading users...</td>
                  </tr>
                )}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-zinc-600 text-sm">No users found.</td>
                  </tr>
                )}
                {!loading && users.map((u) => {
                  const isPending = actionPending === u.id
                  return (
                    <tr key={u.id} className={`transition-colors ${u.banned ? 'bg-red-950/10' : 'hover:bg-zinc-900/30'}`}>
                      <td className="px-5 py-3.5">
                        <p className="text-zinc-100 font-medium">{u.name ?? '—'}</p>
                        <p className="text-zinc-500 text-xs mt-0.5">{u.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          value={u.role ?? 'user'}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-lime-500"
                        >
                          <option value="user">User</option>
                          <option value="coach">Coach</option>
                          <option value="admin">Admin</option>
                          <option value="owner">Owner</option>
                        </select>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold w-fit ${
                            u.banned ? 'bg-red-500/15 text-red-400' : 'bg-lime-500/15 text-lime-400'
                          }`}>
                            {u.banned ? <Ban className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                            {u.banned ? 'Suspended' : 'Active'}
                          </span>
                          {u.banned && u.banReason && (
                            <p className="text-[10px] text-zinc-600 max-w-[160px] truncate" title={u.banReason}>{u.banReason}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-500 text-xs tabular-nums">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            type="button"
                            onClick={() => setSelectedUser(u)}
                            className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
                            title="View audit log"
                          >
                            <Clock className="h-3.5 w-3.5 text-zinc-500" />
                          </button>
                          {u.banned ? (
                            <button
                              type="button"
                              onClick={() => handleUnsuspend(u)}
                              disabled={isPending}
                              className="p-1.5 hover:bg-lime-500/10 rounded transition-colors disabled:opacity-50"
                              title="Lift suspension"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-lime-500" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSuspend(u)}
                              disabled={isPending}
                              className="p-1.5 hover:bg-amber-500/10 rounded transition-colors disabled:opacity-50"
                              title="Suspend user (non-destructive)"
                            >
                              <Ban className="h-3.5 w-3.5 text-amber-500" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(u)}
                            disabled={isPending}
                            className="p-1.5 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                            title="Delete user permanently"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-5">
                <Shield className="h-5 w-5 text-lime-400" />
                <h2 className="text-lg font-bold text-zinc-100">Audit — {selectedUser.name ?? selectedUser.email}</h2>
              </div>
              <div className="space-y-3 text-sm">
                <Row label="Email" value={selectedUser.email} />
                <Row label="Role" value={selectedUser.role ?? 'user'} />
                <Row label="Status" value={selectedUser.banned ? 'Suspended' : 'Active'} />
                {selectedUser.banReason && <Row label="Ban Reason" value={selectedUser.banReason} />}
                {selectedUser.bannedAt && <Row label="Banned At" value={new Date(selectedUser.bannedAt).toLocaleString()} />}
                <Row label="Joined" value={new Date(selectedUser.createdAt).toLocaleString()} />
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="mt-6 w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold py-2 rounded-lg transition-colors text-sm"
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider pt-0.5">{label}</span>
      <span className="text-zinc-200 text-right">{value}</span>
    </div>
  )
}
