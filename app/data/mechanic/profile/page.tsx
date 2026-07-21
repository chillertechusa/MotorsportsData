import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { db } from '@/lib/db'
import { mdMechanicPortfolio, mdMechanicOptimizations } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getSessionTeamId } from '@/lib/md-auth'
import { MechanicPortfolioCard } from '@/components/mechanic-portfolio-card'
import { MechanicOptimizationTimeline } from '@/components/mechanic-optimization-timeline'

export const metadata = {
  title: 'Mechanic Portfolio | Motorsports Data',
  description: 'Your mechanic career portfolio and optimization history',
}

async function getPortfolioData() {
  const auth = await getSessionTeamId()
  if (!auth.ok) return null

  const portfolio = await db
    .select()
    .from(mdMechanicPortfolio)
    .where(eq(mdMechanicPortfolio.userId, auth.userId))
    .limit(1)
    .then(rows => rows[0])

  if (!portfolio) return null

  const rows = await db
    .select()
    .from(mdMechanicOptimizations)
    .where(eq(mdMechanicOptimizations.mechanicUserId, auth.userId))
    .orderBy(desc(mdMechanicOptimizations.createdAt))
    .limit(50)

  // Map DB rows to the timeline component's shape: nullable columns become
  // undefined, status is narrowed to the component union, and createdAt is
  // serialized to an ISO string.
  const optimizations = rows.map((o) => ({
    id: o.id,
    title: o.title,
    parameter: o.parameter,
    valueBefore: o.valueBefore,
    valueAfter: o.valueAfter,
    estimatedLapTimeDelta: o.estimatedLapTimeDelta ?? undefined,
    actualLapTimeDelta: o.actualLapTimeDelta ?? undefined,
    status: (o.status ?? 'suggested') as 'suggested' | 'applied' | 'evaluated',
    createdAt: (o.createdAt ?? new Date()).toISOString(),
  }))

  return { portfolio, optimizations }
}

export default async function MechanicPortfolioPage() {
  const data = await getPortfolioData()

  if (!data) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-3xl font-bold mb-4">No Portfolio Yet</h1>
          <p className="text-muted-foreground mb-8">
            Create your mechanic profile to start tracking your optimization history.
          </p>
          <a
            href="/data/mechanic/setup"
            className="inline-block px-6 py-2 bg-lime-500 text-black rounded-lg font-semibold hover:bg-lime-400 transition"
          >
            Get Started
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Mechanic Portfolio</h1>
          <p className="text-muted-foreground">Your performance history and optimization record</p>
        </div>

        {/* Portfolio Card */}
        <div className="mb-8">
          <MechanicPortfolioCard
            displayName={data.portfolio.displayName || 'Unnamed Mechanic'}
            bio={data.portfolio.bio || undefined}
            totalRidersServed={data.portfolio.totalRidersServed || 0}
            totalLapTimeSavings={data.portfolio.totalLapTimeSavings || 0}
            averageEfficiencyScore={data.portfolio.averageEfficiencyScore || 0}
            totalWorkOrders={data.portfolio.totalWorkOrders || 0}
            verificationStatus={
              (data.portfolio.verificationStatus as 'unverified' | 'verified' | 'elite') || 'unverified'
            }
          />
        </div>

        {/* Optimization Timeline */}
        <div>
          <MechanicOptimizationTimeline optimizations={data.optimizations} />
        </div>

        {/* Settings Link */}
        <div className="mt-8 text-center">
          <a
            href="/data/mechanic/settings"
            className="text-sm text-lime-400 hover:text-lime-300 transition"
          >
            Edit Profile →
          </a>
        </div>
      </div>
    </div>
  )
}
