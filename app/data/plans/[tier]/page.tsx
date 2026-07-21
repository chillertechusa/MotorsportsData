import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Phone } from 'lucide-react'
import { MD_PLAN_IDS, MD_PLAN_LABELS, MD_PLAN_CENTS, isMdPlanId, MECHANIC_PLAN_ID, formatPricingDisplay } from '@/lib/md-plans'
import type { MdPlanId } from '@/lib/md-plans'
import { RookieDemo, PrivateerDemo, RaceTeamDemo, FactoryDemo, AgentContractNegotiationDemo, AgentProspectScoutDemo, FanComparisonDemo, FanLiveDemo, FanLeaderboardDemo, CoachDemo } from '@/components/tier-feature-demos'
import { TierCTAButton } from '@/components/data/tier-cta-button'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

type Props = {
  params: Promise<{ tier: string }>
}

// Redirect to dedicated tier landing pages
// Fan has no dedicated page, so it doesn't redirect
const TIER_REDIRECTS: Record<string, string> = {
  rookie: '/rookie',
  privateer: '/privateer',
  race_team: '/race_team',
  factory_rig: '/factory_rig',
  agent: '/agent',
  coach: '/coach',
  wrench: '/wrench',
  // fan: stays on /data/plans/fan (no dedicated page)
}

// Tier-specific messaging and positioning
const TIER_COPY: Record<MdPlanId, { headline: string; subheading: string; cta: string; description: string }> = {
  rookie: {
    headline: 'Start Free. Log Your Data.',
    subheading: 'Every rider deserves lap data. No credit card. No strings.',
    cta: 'Activate Free Account',
    description: 'Perfect for youth riders, amateurs, and anyone who wants to track their first lap times. See your performance instantly.',
  },
  privateer: {
    headline: 'Track Every Lap. Own Your Data.',
    subheading: 'Solo riders who take their performance seriously.',
    cta: 'Get The Privateer',
    description: 'Upload your telemetry, analyze your suspension setup, get coaching insights. Build your racing resume.',
  },
  wrench: {
    headline: 'Your Career Portfolio.',
    subheading: 'Mechanics build legacies through their setup deltas.',
    cta: 'Become a Wrench',
    description: 'Track every optimization. Build your professional reputation. Carry it team to team. That\'s your moat.',
  },
  race_team: {
    headline: 'Manage Your Fleet. Develop Your Riders.',
    subheading: 'Regional and semi-pro teams competing to win.',
    cta: 'Scale Your Program',
    description: 'Multi-rider comparison, team analytics, coach assignments. Compare your lineup. Find your advantage.',
  },
  factory_rig: {
    headline: 'Factory Operations. Factory Insights.',
    subheading: 'Professional teams with factory-level ambitions.',
    cta: 'Contact Sales',
    description: 'Enterprise features, custom integrations, dedicated support. Build your competitive edge at scale.',
  },
  agent: {
    headline: 'Contract Negotiation Powered by Data.',
    subheading: 'Prove rider value. Win bigger deals.',
    cta: 'Unlock Agent Access',
    description: 'Real analytics for contract negotiations and prospect scouting. Nationwide benchmarking. 5-year performance trends. Export-ready reports.',
  },
  fan: {
    headline: 'Follow Your Favorite Riders.',
    subheading: 'Real stats. Real competition. Real riders.',
    cta: 'Join the Community',
    description: 'Compare riders, get live session updates, join prediction games, and connect with the community. Celebrate every win.',
  },
  coach: {
    headline: 'Coach More Riders. Win More Championships.',
    subheading: 'Built for coaches managing multiple riders across multiple teams.',
    cta: 'Start Coaching',
    description: 'Cross-team coaching access, session video analysis with telemetry overlay, AI-powered rider recommendations, and a complete coaching portfolio. Built for Aldon Baker-level coaches.',
  },
}

function getTierDemo(tier: MdPlanId) {
  switch (tier) {
    case 'rookie':
      return <RookieDemo />
    case 'privateer':
      return <PrivateerDemo />
    case 'race_team':
      return <RaceTeamDemo />
    case 'factory_rig':
      return <FactoryDemo />
    case 'wrench':
      return <FactoryDemo />
    case 'agent':
      return (
        <div className="space-y-8">
          <AgentContractNegotiationDemo />
          <div className="border-t border-zinc-800 pt-8">
            <AgentProspectScoutDemo />
          </div>
        </div>
      )
    case 'fan':
      return (
        <div className="space-y-8">
          <FanComparisonDemo />
          <div className="border-t border-zinc-800 pt-8">
            <FanLiveDemo />
          </div>
          <div className="border-t border-zinc-800 pt-8">
            <FanLeaderboardDemo />
          </div>
        </div>
      )
    case 'coach':
      return <CoachDemo />
    default:
      return null
  }
}

export default async function TierLandingPage({ params }: Props) {
  const { tier: tierParam } = await params
  const tier = tierParam.replace('-', '_') // Convert URL slug to enum (race-team → race_team)

  if (!isMdPlanId(tier)) {
    redirect('/data/pricing')
  }

  // Redirect to dedicated tier landing pages
  if (TIER_REDIRECTS[tier]) {
    redirect(TIER_REDIRECTS[tier])
  }

  const session = await auth.api.getSession({ headers: await headers() })
  const isSignedIn = !!session?.user

  const copy = TIER_COPY[tier]
  const price = MD_PLAN_CENTS[tier]
  const priceDisplay = formatPricingDisplay(tier as MdPlanId)
  const isCheckoutReady = tier !== 'factory_rig' && tier !== 'fan' // Factory rig and fan need sales/phone

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-lime-400 font-mono font-black mb-4">
          {MD_PLAN_LABELS[tier]}
        </p>
        <h1 className="text-4xl sm:text-5xl font-black text-zinc-50 mb-4 text-balance">
          {copy.headline}
        </h1>
        <p className="text-lg text-zinc-300 mb-8 text-balance">
          {copy.subheading}
        </p>
        <p className="text-sm text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          {copy.description}
        </p>

        {/* Price + CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
          <div className="text-3xl font-black text-lime-400 font-mono">
            {priceDisplay}
          </div>
          {isCheckoutReady ? (
            <TierCTAButton
              tier={tier}
              label={copy.cta}
              price={MD_PLAN_CENTS[tier as MdPlanId] ?? 0}
              isSignedIn={isSignedIn}
              className="inline-flex items-center gap-2 px-8 py-4 bg-lime-400 text-zinc-950 text-sm font-black uppercase tracking-widest hover:bg-lime-300 transition-colors font-mono"
            />
          ) : (
            <a
              href="tel:+18884698475"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-lime-400 text-lime-400 text-sm font-black uppercase tracking-widest hover:bg-lime-400/10 transition-colors font-mono"
            >
              <Phone className="h-5 w-5" />
              (888) 469-8475
            </a>
          )}
        </div>

        {/* Phone CTA for All Tiers */}
        <div className="text-sm text-zinc-400">
          Questions? <a href="tel:+18884698475" className="text-lime-400 hover:text-lime-300 font-semibold">Call us</a>
        </div>
      </section>

      {/* Feature Demo Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500 font-mono mb-2">LIVE FEATURE PREVIEW</p>
          <h2 className="text-2xl font-black text-zinc-50 mb-2">See it in action</h2>
          <p className="text-zinc-400">This is what you get on day one</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
          {getTierDemo(tier)}
        </div>
      </section>

      {/* Feature List Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-black text-zinc-50 mb-12 text-center">What&apos;s included</h2>
        
        {/* Tier-specific features */}
        <div className="grid gap-6">
          {tier === 'rookie' && (
            <>
              <FeatureRow icon="📱" title="Session Logging" description="Log lap times, bike setup, and conditions from your phone" />
              <FeatureRow icon="📊" title="Performance Trends" description="Track your progress over weeks and months" />
              <FeatureRow icon="🆓" title="Free Forever" description="No credit card required, no limits" />
              <FeatureRow icon="📈" title="Mobile First" description="Designed for the pits. Works offline." />
            </>
          )}
          {tier === 'privateer' && (
            <>
              <FeatureRow icon="📤" title="Telemetry Upload" description="Import data from MYLAPSTR2, RaceBox, Garmin, Apple Watch, and more" />
              <FeatureRow icon="🔧" title="Setup Analysis" description="See suspension tuning impact on lap times" />
              <FeatureRow icon="🧠" title="AI Coaching" description="Real-time recommendations on efficiency and setup" />
              <FeatureRow icon="👤" title="Rider Profile" description="Build your racing resume with lap data" />
            </>
          )}
          {tier === 'race_team' && (
            <>
              <FeatureRow icon="👥" title="Multi-Rider Comparison" description="Compare your entire roster lap-by-lap, head-to-head" />
              <FeatureRow icon="📋" title="Roster Management" description="Add riders, organize by bike, track assignments" />
              <FeatureRow icon="🎯" title="Team Analytics" description="See which riders are trending up, who needs coaching" />
              <FeatureRow icon="👨‍🏫" title="Coach Assignments" description="Assign templates and protocols to riders" />
            </>
          )}
          {tier === 'factory_rig' && (
            <>
              <FeatureRow icon="🏭" title="Factory Dashboard" description="Real-time oversight of entire program" />
              <FeatureRow icon="📡" title="Custom Integrations" description="Connect your own telemetry systems" />
              <FeatureRow icon="🎯" title="Enterprise Features" description="Custom workflows, bulk imports, API access" />
              <FeatureRow icon="🤝" title="Dedicated Support" description="Direct access to our team" />
            </>
          )}
          {tier === 'wrench' && (
            <>
              <FeatureRow icon="💼" title="Career Portfolio" description="Track every setup change and outcome" />
              <FeatureRow icon="⭐" title="Performance Attribution" description="Show clients exactly what you did" />
              <FeatureRow icon="📊" title="Optimization Tracking" description="Log setup deltas, improvements, test results" />
              <FeatureRow icon="🏆" title="Professional Brand" description="Carry your work history team to team" />
            </>
          )}
          {tier === 'agent' && (
            <>
              <FeatureRow icon="📊" title="Percentile Ranking" description="See exactly where riders rank nationally" />
              <FeatureRow icon="📈" title="5-Year Trends" description="Historical performance data and trajectory" />
              <FeatureRow icon="💰" title="Salary Benchmarking" description="Know what riders at this level should earn" />
              <FeatureRow icon="🎯" title="Prospect Scouting" description="Find rising talent across the nation" />
              <FeatureRow icon="📄" title="Export Reports" description="Professional PDF reports for negotiations" />
              <FeatureRow icon="🔔" title="Real-Time Alerts" description="Get notified of performance breakthroughs" />
            </>
          )}
          {tier === 'coach' && (
            <>
              <FeatureRow icon="👥" title="Cross-Team Coaching" description="Manage riders across multiple teams from one dashboard" />
              <FeatureRow icon="🎥" title="Video Analysis" description="Telemetry overlay on session footage for precise coaching feedback" />
              <FeatureRow icon="🧠" title="AI Recommendations" description="AI-powered insights on each rider's performance and improvement areas" />
              <FeatureRow icon="📊" title="Session Comparison" description="Compare lap-by-lap across sessions, bikes, and conditions" />
              <FeatureRow icon="📋" title="Coaching Portfolio" description="Build and carry your coaching record team to team" />
              <FeatureRow icon="🏆" title="Championship Tracking" description="Monitor rider readiness and progress toward competition goals" />
            </>
          )}
          {tier === 'fan' && (
            <>
              <FeatureRow icon="👥" title="Follow Riders" description="Get updates when your favorite riders race" />
              <FeatureRow icon="🏁" title="Head-to-Head Comparison" description="Compare riders side-by-side" />
              <FeatureRow icon="📻" title="Live Feed" description="Real-time session updates and milestones" />
              <FeatureRow icon="🏆" title="Leaderboards" description="Top riders nationally and by discipline" />
              <FeatureRow icon="🎮" title="Prediction Games" description="Guess lap times and vote on matchups" />
              <FeatureRow icon="💬" title="Community" description="Connect with other fans and riders" />
            </>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900/50 border-t border-zinc-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-black text-zinc-50 mb-4">Ready to level up?</h2>
          <p className="text-zinc-400 mb-8">
            {tier === 'factory_rig' ? 'Talk to our team to customize a solution for your program.' : 'Your data is waiting.'}
          </p>
          {isCheckoutReady ? (
            <TierCTAButton
              tier={tier}
              label={copy.cta}
              price={MD_PLAN_CENTS[tier as MdPlanId] ?? 0}
              isSignedIn={isSignedIn}
              className="inline-flex items-center gap-2 px-8 py-4 bg-lime-400 text-zinc-950 text-sm font-black uppercase tracking-widest hover:bg-lime-300 transition-colors font-mono"
            />
          ) : (
            <a
              href="tel:+18884698475"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-lime-400 text-lime-400 text-sm font-black uppercase tracking-widest hover:bg-lime-400/10 transition-colors font-mono"
            >
              <Phone className="h-5 w-5" />
              (888) 469-8475
            </a>
          )}
        </div>
      </section>
    </main>
  )
}

function FeatureRow({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex gap-4 p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 transition-colors">
      <span className="text-2xl shrink-0">{icon}</span>
      <div>
        <h3 className="font-black text-zinc-50 mb-1">{title}</h3>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>
    </div>
  )
}
