import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { md_users, md_access_log } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Crown, ShieldAlert, BarChart3, Clock, Eye } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'King Console — Motorsport Data',
  robots: { index: false, follow: false },
}

export default async function KingConsolePage() {
  // Auth check — only admin/owner roles access this
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    redirect('/auth/sign-in?redirect=/admin')
  }

  const user = await db.query.md_users.findFirst({
    where: eq(md_users.id, session.user.id),
  })

  if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
    return (
      <div className="min-h-screen bg-zinc-950 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-8 text-center">
            <ShieldAlert className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h1>
            <p className="text-zinc-400">Only MD admin and owner accounts can access the King Console.</p>
          </div>
        </div>
      </div>
    )
  }

  // Fetch rider statistics
  const allUsers = await db.query.md_users.findMany()
  const roleBreakdown = {
    user: allUsers.filter((u) => u.role === 'user').length,
    pro_rider: allUsers.filter((u) => u.role === 'pro_rider').length,
    coach: allUsers.filter((u) => u.role === 'coach').length,
    shop: allUsers.filter((u) => u.role === 'shop').length,
    team: allUsers.filter((u) => u.role === 'team').length,
    brand: allUsers.filter((u) => u.role === 'brand').length,
  }

  const pendingApprovals = allUsers.filter((u) => u.role === 'team' || u.role === 'brand')

  // Fetch recent access log
  const recentAccess = await db.query.md_access_log.findMany({
    orderBy: (t) => [desc(t.created_at)],
    limit: 10,
  })

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="h-8 w-8 text-lime-500" />
            <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-50">King Console</h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">Gatekeeper Control Center. MD owns the gate.</p>
        </div>
      </header>

      {/* Main content */}
      <main className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono text-zinc-400 flex items-center gap-2">
                  <Users className="h-4 w-4 text-lime-500" />
                  Total Riders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-lime-500">{allUsers.length}</div>
                <p className="text-xs text-zinc-500 mt-1">{roleBreakdown.user} free, {roleBreakdown.pro_rider} pro</p>
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono text-zinc-400 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-lime-500" />
                  Coaches Connected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-lime-500">{roleBreakdown.coach}</div>
                <p className="text-xs text-zinc-500 mt-1">Paid tier: $49–99/mo</p>
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono text-zinc-400 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-lime-500" />
                  Pending Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-lime-500">{pendingApprovals.length}</div>
                <p className="text-xs text-zinc-500 mt-1">Teams & brands (manual gate)</p>
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono text-zinc-400 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-lime-500" />
                  Access Log Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-lime-500">{recentAccess.length}</div>
                <p className="text-xs text-zinc-500 mt-1">Audit trail (watermarked)</p>
              </CardContent>
            </Card>
          </div>

          {/* Role Breakdown */}
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-lg">Role Hierarchy Breakdown</CardTitle>
              <CardDescription>Distribution across all paid and free tiers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(roleBreakdown).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="border-zinc-700 text-zinc-300 capitalize">
                        {role.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-zinc-400">{count} account{count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="h-2 w-32 bg-zinc-800 rounded">
                      <div
                        className="h-full bg-lime-500 rounded"
                        style={{ width: `${count > 0 ? (count / Math.max(...Object.values(roleBreakdown))) * 100 : 5}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-lg">Pending Tier-5/6 Approvals</CardTitle>
              <CardDescription>Manual gate check required before access to search/analytics</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-8">No pending approvals. MD is in control.</p>
              ) : (
                <div className="space-y-3">
                  {pendingApprovals.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-3 border border-zinc-700 rounded-lg bg-zinc-950">
                      <div>
                        <p className="font-mono text-sm text-zinc-200">{u.name}</p>
                        <p className="text-xs text-zinc-500">{u.email}</p>
                      </div>
                      <Badge variant="secondary" className="bg-lime-500/20 text-lime-400 capitalize">
                        {u.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Access Log */}
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-lime-500" />
                Recent Access Log (Watermarked)
              </CardTitle>
              <CardDescription>Audit trail for paid-tier account views (GDPR-compliant, immutable)</CardDescription>
            </CardHeader>
            <CardContent>
              {recentAccess.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-8">No access log entries yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-700">
                        <th className="text-left py-2 px-2 text-zinc-400 font-mono">User</th>
                        <th className="text-left py-2 px-2 text-zinc-400 font-mono">Action</th>
                        <th className="text-left py-2 px-2 text-zinc-400 font-mono">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAccess.map((log, idx) => (
                        <tr key={idx} className="border-b border-zinc-800">
                          <td className="py-2 px-2 text-zinc-300">{log.user_email}</td>
                          <td className="py-2 px-2 text-zinc-400">{log.action}</td>
                          <td className="py-2 px-2 text-zinc-500">
                            {log.created_at
                              ? new Date(log.created_at).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
