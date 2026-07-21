'use client'

import { Bike, Wrench, Users, Activity, TrendingUp, Calendar, BarChart3, Trophy, Zap } from 'lucide-react'

/* ── ROOKIE: Session Logging Demo ── */
export function RookieDemo() {
  return (
    <div className="mt-6 pt-6 border-t border-zinc-800">
      <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-600 mb-4">Live Feature Preview</p>
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bike className="h-4 w-4 text-lime-400" />
            <span className="text-xs font-semibold text-zinc-300">Session Log</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-600">YZ450F</span>
        </div>
        <div className="space-y-2">
          {[
            { label: 'Lap Time', value: '1:42.3' },
            { label: 'Max Speed', value: '67 mph' },
            { label: 'Duration', value: '45 min' },
          ].map((m) => (
            <div key={m.label} className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">{m.label}</span>
              <span className="text-zinc-300 font-mono font-semibold">{m.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── PRIVATEER: Setup Sheet Preview ── */
export function PrivateerDemo() {
  return (
    <div className="mt-6 pt-6 border-t border-zinc-800">
      <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-600 mb-4">Live Feature Preview</p>
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Wrench className="h-4 w-4 text-lime-400" />
          <span className="text-xs font-semibold text-zinc-300">Setup Sheet</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {[
            { label: 'Suspension', value: 'Medium' },
            { label: 'Gearing', value: '14/48' },
            { label: 'Tire Pressure', value: '12 psi' },
            { label: 'Fuel', value: '91 Octane' },
          ].map((item) => (
            <div key={item.label} className="border border-zinc-800 bg-zinc-950/50 p-2 rounded">
              <span className="text-zinc-600 text-[10px]">{item.label}</span>
              <p className="text-zinc-300 font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── RACE TEAM: Rider Roster ── */
export function RaceTeamDemo() {
  return (
    <div className="mt-6 pt-6 border-t border-zinc-800">
      <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-600 mb-4">Live Feature Preview</p>
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-lime-400" />
          <span className="text-xs font-semibold text-zinc-300">Team Roster</span>
        </div>
        <div className="space-y-2">
          {[
            { name: '#22 Casey M.', status: '98% Ready', time: '1:41.2' },
            { name: '#7 Jordan K.', status: '85% Ready', time: '1:43.8' },
            { name: '#14 Alex R.', status: '72% Ready', time: '1:46.1' },
          ].map((rider) => (
            <div key={rider.name} className="flex items-center justify-between text-[11px]">
              <div className="flex-1">
                <p className="text-zinc-300 font-semibold">{rider.name}</p>
                <p className="text-zinc-600 text-[10px]">{rider.status}</p>
              </div>
              <span className="text-lime-400 font-mono font-semibold text-xs">{rider.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── FACTORY: Fleet Dashboard ── */
export function FactoryDemo() {
  return (
    <div className="mt-6 pt-6 border-t border-zinc-800">
      <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-600 mb-4">Live Feature Preview</p>
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-lime-400" />
          <span className="text-xs font-semibold text-zinc-300">Fleet Health</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Vehicles', value: '8', icon: Bike },
            { label: 'Health', value: '98%', icon: Activity },
            { label: 'Events', value: '12', icon: Calendar },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="border border-zinc-800 bg-zinc-950/50 p-2 rounded text-center">
                <Icon className="h-3 w-3 text-lime-400 mx-auto mb-1" />
                <p className="text-zinc-300 font-bold text-xs">{item.value}</p>
                <p className="text-zinc-600 text-[10px]">{item.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── AGENT: Contract Negotiation Dashboard ── */
export function AgentContractNegotiationDemo() {
  return (
    <div className="mt-6 pt-6 border-t border-zinc-800">
      <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-600 mb-4">Contract Negotiation Dashboard</p>
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-300">Rider Percentile Ranking</p>
            <p className="text-2xl font-black text-lime-400 mt-1">97th %ile</p>
            <p className="text-xs text-zinc-500 mt-1">Top 3% nationally</p>
          </div>
          <BarChart3 className="h-8 w-8 text-lime-400 opacity-30" />
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="border border-zinc-800 bg-zinc-950/50 p-2 rounded">
            <span className="text-zinc-600 text-[10px]">5-Yr Trend</span>
            <p className="text-lime-400 font-bold">+18%</p>
          </div>
          <div className="border border-zinc-800 bg-zinc-950/50 p-2 rounded">
            <span className="text-zinc-600 text-[10px]">Consistency</span>
            <p className="text-lime-400 font-bold">94/100</p>
          </div>
          <div className="border border-zinc-800 bg-zinc-950/50 p-2 rounded">
            <span className="text-zinc-600 text-[10px]">Last Deal</span>
            <p className="text-zinc-300 font-bold">$250k</p>
          </div>
          <div className="border border-zinc-800 bg-zinc-950/50 p-2 rounded">
            <span className="text-zinc-600 text-[10px]">Recommended</span>
            <p className="text-lime-400 font-bold">$450k+</p>
          </div>
        </div>
        <button className="w-full bg-lime-400 text-zinc-950 text-xs font-black uppercase px-3 py-2 rounded hover:bg-lime-300 transition-colors">
          Download Report
        </button>
      </div>
    </div>
  )
}

/* ── AGENT: Prospect Scout Dashboard ── */
export function AgentProspectScoutDemo() {
  return (
    <div className="mt-6 pt-6 border-t border-zinc-800">
      <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-600 mb-4">Prospect Scout Search</p>
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-4 w-4 text-lime-400" />
          <span className="text-xs font-semibold text-zinc-300">Top Prospects (Motocross, 18-22)</span>
        </div>
        <div className="space-y-2">
          {[
            { name: 'Prospect A', potential: 92, trend: '+42%', status: 'Breakout' },
            { name: 'Prospect B', potential: 87, trend: '+28%', status: 'Rising' },
            { name: 'Prospect C', potential: 84, trend: '+19%', status: 'Solid' },
          ].map((prospect) => (
            <div key={prospect.name} className="border border-zinc-800 bg-zinc-950/50 p-2 rounded text-[11px]">
              <div className="flex items-center justify-between mb-1">
                <p className="text-zinc-300 font-semibold">{prospect.name}</p>
                <span className="text-[10px] bg-lime-400/20 text-lime-400 px-2 py-0.5 rounded">{prospect.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-600">Dev Potential: <span className="text-lime-400 font-bold">{prospect.potential}</span></span>
                <span className="text-lime-400 font-bold">{prospect.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── FAN: Rider Comparison ── */
export function FanComparisonDemo() {
  return (
    <div className="mt-6 pt-6 border-t border-zinc-800">
      <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-600 mb-4">Head-to-Head Comparison</p>
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'Jett L.', laps: 156, wins: 12, podiums: 24, rating: '9.8' },
            { name: 'Eli T.', laps: 148, wins: 11, podiums: 22, rating: '9.6' },
          ].map((rider) => (
            <div key={rider.name} className="border border-zinc-800 bg-zinc-950/50 p-3 rounded">
              <p className="text-sm font-bold text-lime-400 mb-2">{rider.name}</p>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Laps</span>
                  <span className="text-zinc-300 font-semibold">{rider.laps}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Wins</span>
                  <span className="text-lime-400 font-bold">{rider.wins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Podiums</span>
                  <span className="text-lime-400 font-bold">{rider.podiums}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-zinc-800">
                  <span className="text-zinc-500">Rating</span>
                  <span className="text-lime-400 font-bold">{rider.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── FAN: Live Feed ── */
export function FanLiveDemo() {
  return (
    <div className="mt-6 pt-6 border-t border-zinc-800">
      <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-600 mb-4">Live Session Feed</p>
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-2">
        {[
          { icon: Zap, text: 'Jett set a new personal best: 1:41.2', time: '2m ago', highlight: true },
          { icon: Trophy, text: 'Eli took 1st place in qualifying', time: '5m ago', highlight: false },
          { icon: Activity, text: 'Chase gained 3 positions this lap', time: '8m ago', highlight: false },
        ].map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 p-2 rounded border ${
                item.highlight ? 'border-lime-400/30 bg-lime-400/5' : 'border-zinc-800 bg-zinc-950/50'
              }`}
            >
              <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${item.highlight ? 'text-lime-400' : 'text-zinc-600'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-300">{item.text}</p>
                <p className="text-[10px] text-zinc-600 mt-1">{item.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── FAN: Leaderboard ── */
export function CoachDemo() {
  return (
    <div className="space-y-6">
      <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-600 mb-4">Coach Dashboard · 3 Riders Active</p>

      {/* Rider roster */}
      <div className="space-y-3">
        {[
          { name: 'Tyler Marsh', number: '#17', age: 16, status: 'improving', pb: '1:43.2', session: '-0.84s today' },
          { name: 'Cody Rios', number: '#44', age: 17, status: 'trending', pb: '1:41.8', session: 'New PB' },
          { name: 'Danny Kosel', number: '#7', age: 15, status: 'watch', pb: '1:46.1', session: 'Fatigue flag' },
        ].map((r) => (
          <div key={r.name} className="flex items-center justify-between border border-zinc-800 bg-zinc-900/40 rounded-lg px-4 py-3">
            <div>
              <p className="text-zinc-100 text-sm font-bold">{r.name} {r.number} · {r.age}yo</p>
              <p className="text-zinc-500 text-xs font-mono mt-1">PB: {r.pb} · {r.session}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded ${
              r.status === 'improving' ? 'bg-lime-400/10 text-lime-400' :
              r.status === 'trending' ? 'bg-amber-400/10 text-amber-400' :
              'bg-red-400/10 text-red-400'
            }`}>{r.status}</span>
          </div>
        ))}
      </div>

      {/* AI Coaching insight */}
      <div className="border border-lime-400/20 bg-lime-400/5 rounded-lg p-4">
        <p className="text-xs font-mono uppercase tracking-widest text-lime-400 mb-2">AI Coaching Insight</p>
        <p className="text-sm text-zinc-300">Cody&apos;s line through Turn 3 is reference quality — share with Tyler and Danny for pre-race review. Tyler: watch heel dragging in rutted lefts.</p>
      </div>

      {/* Session stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Sessions This Week', value: '12' },
          { label: 'Avg Improvement', value: '-0.6s' },
          { label: 'Championship Readiness', value: '87%' },
        ].map((s) => (
          <div key={s.label} className="border border-zinc-800 bg-zinc-900/40 rounded-lg p-3 text-center">
            <p className="text-lime-400 text-lg font-black font-mono">{s.value}</p>
            <p className="text-zinc-600 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FanLeaderboardDemo() {
  return (
    <div className="mt-6 pt-6 border-t border-zinc-800">
      <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-600 mb-4">National Leaderboard</p>
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
        <div className="space-y-1">
          {[
            { rank: 1, name: 'Jett Lawrence', time: '1:41.2', region: 'AZ', fans: '98.2k' },
            { rank: 2, name: 'Eli Tomac', time: '1:41.8', region: 'CO', fans: '87.1k' },
            { rank: 3, name: 'Chase Sexton', time: '1:42.1', region: 'TX', fans: '76.5k' },
            { rank: 4, name: 'Dylan Ferrandis', time: '1:42.3', region: 'CA', fans: '65.3k' },
          ].map((rider) => (
            <div key={rider.rank} className="flex items-center justify-between text-[11px] p-2 hover:bg-zinc-800/30 rounded transition-colors">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-lime-400 font-bold w-4">{rider.rank}</span>
                <span className="text-zinc-300 font-semibold flex-1">{rider.name}</span>
              </div>
              <span className="text-zinc-500 text-[10px]">{rider.region}</span>
              <span className="text-lime-400 font-mono font-semibold ml-2">{rider.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
