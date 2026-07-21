'use client'

import {
  Gauge,
  RacingBar,
  Waveform,
  BigStat,
  Ring,
  Equalizer,
  COLORS,
} from './motion-primitives'
import {
  liveVals,
  oscBand,
  clamp,
  lerp,
  easeOut,
  sceneProgress,
} from '@/lib/demo-motion'

const { LIME, CYAN, ORANGE } = COLORS

// Baked realistic values harvested from the seeded team's shape.
const RIDER = 'C. VANDAL #47'
const RIVALS = ['LEADER #1', 'P2 #22', 'YOU #47', 'P4 #9', 'P5 #14']

export type SceneMeta = { phase: string; title: string; accent: string }

// Wrapper: phase eyebrow + title, consistent across all scenes.
function SceneFrame({
  phase,
  title,
  accent,
  children,
}: {
  phase: string
  title: string
  accent: string
  children: React.ReactNode
}) {
  return (
    <div className="absolute inset-0 flex flex-col p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: accent }} />
        <span className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: accent }}>
          {phase}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">/ {title}</span>
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  )
}

// ═══════════════ PHASE 1 · LIVE TELEMETRY (0-20s) ═══════════════

function Scene0({ t }: { t: number }) {
  const v = liveVals(t)
  return (
    <SceneFrame phase="Live Telemetry" title="On-Track, Real Time" accent={LIME}>
      <div className="grid grid-cols-3 gap-3 h-full items-center">
        <Gauge value={v.speed} min={0} max={85} label="Speed" unit="mph" color={LIME} />
        <Gauge value={v.rpm} min={0} max={14} label="RPM" unit="x1000" color={CYAN} />
        <Gauge value={Math.abs(v.lean)} min={0} max={50} label="Lean" unit="deg" color={ORANGE} />
      </div>
    </SceneFrame>
  )
}

function Scene1({ t }: { t: number }) {
  const v = liveVals(t)
  return (
    <SceneFrame phase="Live Telemetry" title="Full Cluster" accent={LIME}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 h-full content-center">
        <RacingBar label="Throttle" value={v.throttle} max={100} unit="%" color={LIME} highlight />
        <RacingBar label="Brake" value={v.brake} max={100} unit="%" color={ORANGE} />
        <RacingBar label="G-Force" value={v.gForce} max={3} unit="g" color={CYAN} />
        <RacingBar label="Speed" value={v.speed} max={85} unit="mph" color={LIME} />
        <RacingBar label="Engine" value={v.engineTemp} max={120} unit="°C" color={ORANGE} />
        <RacingBar label="Tire PSI" value={v.tirePress} max={16} unit="" color={CYAN} />
      </div>
    </SceneFrame>
  )
}

function Scene2({ t }: { t: number }) {
  const v = liveVals(t)
  return (
    <SceneFrame phase="Live Telemetry" title="Suspension Travel" accent={LIME}>
      <div className="grid grid-cols-1 gap-2 h-full content-center">
        <Waveform t={t} kind="sine" color={LIME} label="Front Fork (mm)" live={`${v.suspF.toFixed(0)} mm`} height={54} />
        <Waveform t={t + 0.4} kind="sine" color={CYAN} label="Rear Shock (mm)" live={`${v.suspR.toFixed(0)} mm`} height={54} />
      </div>
    </SceneFrame>
  )
}

function Scene3({ t }: { t: number }) {
  const v = liveVals(t)
  return (
    <SceneFrame phase="Live Telemetry" title="Rider Vitals" accent={LIME}>
      <div className="grid grid-cols-[1fr_auto] gap-4 h-full items-center">
        <Waveform t={t} kind="ecg" color={ORANGE} label="Heart Rate" live={`${v.heartRate} bpm`} height={90} />
        <div className="flex flex-col gap-3">
          <BigStat value={v.heartRate} label="BPM" color={ORANGE} />
          <BigStat value={v.speed} label="MPH" color={LIME} />
        </div>
      </div>
    </SceneFrame>
  )
}

// ═══════════════ PHASE 2 · SETUP AI (20-40s) ═══════════════

function Scene4({ t }: { t: number }) {
  const p = sceneProgress(t)
  // Delta bars closing toward optimal as the AI "solves".
  const solve = easeOut(p)
  return (
    <SceneFrame phase="AI Setup Engine" title="Suspension Solver" accent={CYAN}>
      <div className="grid grid-cols-1 gap-2 h-full content-center">
        <RacingBar label="Compression" value={lerp(72, 41, solve)} max={100} unit="clk" color={CYAN} highlight />
        <RacingBar label="Rebound" value={lerp(38, 55, solve)} max={100} unit="clk" color={CYAN} />
        <RacingBar label="Sag Front" value={lerp(28, 35, solve)} max={50} unit="mm" color={LIME} highlight />
        <RacingBar label="Sag Rear" value={lerp(118, 103, solve)} max={140} unit="mm" color={LIME} />
        <RacingBar label="Fork Height" value={lerp(4, 7, solve)} max={12} unit="mm" color={ORANGE} />
      </div>
    </SceneFrame>
  )
}

function Scene5({ t }: { t: number }) {
  const conf = oscBand(t, 88, 97, 2, 0.6)
  return (
    <SceneFrame phase="AI Setup Engine" title="Recommendation" accent={CYAN}>
      <div className="grid grid-cols-[auto_1fr] gap-5 h-full items-center">
        <Ring value={conf} max={100} label="Confidence" sub="model" color={CYAN} size={140} />
        <div className="flex flex-col gap-2">
          <RecCard tag="+2mm" text="Front compression for turn-7 grip" />
          <RecCard tag="-0.18s" text="Predicted lap gain" accent />
          <RecCard tag="12.4 PSI" text="Rear tire, track temp 41°C" />
        </div>
      </div>
    </SceneFrame>
  )
}

function RecCard({ tag, text, accent }: { tag: string; text: string; accent?: boolean }) {
  return (
    <div className={`flex items-center gap-3 border px-3 py-2 rounded ${accent ? 'border-lime-400/40 bg-lime-400/5' : 'border-zinc-800 bg-zinc-900/40'}`}>
      <span className={`font-mono text-sm tabular-nums shrink-0 ${accent ? 'text-lime-400' : 'text-cyan-400'}`} style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900 }}>
        {tag}
      </span>
      <span className="text-zinc-300 text-xs leading-tight">{text}</span>
    </div>
  )
}

function Scene6({ t }: { t: number }) {
  const v = liveVals(t)
  return (
    <SceneFrame phase="AI Setup Engine" title="Tire & Thermal" accent={CYAN}>
      <div className="grid grid-cols-3 gap-3 h-full items-center">
        <Gauge value={v.tirePress} min={8} max={16} label="Tire PSI" unit="psi" color={CYAN} />
        <Gauge value={v.engineTemp} min={60} max={120} label="Engine" unit="°C" color={ORANGE} />
        <Gauge value={oscBand(t, 38, 46, 3, 0.5)} min={20} max={60} label="Track Temp" unit="°C" color={LIME} />
      </div>
    </SceneFrame>
  )
}

function Scene7({ t }: { t: number }) {
  const p = sceneProgress(t)
  return (
    <SceneFrame phase="AI Setup Engine" title="Before / After" accent={CYAN}>
      <div className="grid grid-cols-1 gap-3 h-full content-center">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Baseline Setup</span>
          <RacingBar label="Lap Time" value={98.42} max={105} unit="s" color={COLORS.ZINC} />
        </div>
        <div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-lime-400">AI-Optimized</span>
          <RacingBar label="Lap Time" value={lerp(98.42, 96.71, easeOut(p))} max={105} unit="s" color={LIME} highlight />
        </div>
        <div className="text-center mt-1">
          <BigStat value={lerp(0, 1.71, easeOut(p))} label="Seconds Gained / Lap" unit="s" color={LIME} decimals={2} />
        </div>
      </div>
    </SceneFrame>
  )
}

// ═══════════════ PHASE 3 · READINESS (40-60s) ═══════════════

function Scene8({ t }: { t: number }) {
  const readiness = oscBand(t, 88, 94, 1, 0.4)
  return (
    <SceneFrame phase="Readiness Engine" title="Race-Day Score" accent={LIME}>
      <div className="grid grid-cols-[auto_1fr] gap-5 h-full items-center">
        <Ring value={readiness} max={100} label="Readiness" sub="cleared to race" color={LIME} size={150} />
        <Waveform t={t} kind="ecg" color={LIME} label="HRV — Live" live={`${oscBand(t, 74, 88, 2, 0.5).toFixed(0)} ms`} height={90} />
      </div>
    </SceneFrame>
  )
}

function Scene9({ t }: { t: number }) {
  return (
    <SceneFrame phase="Readiness Engine" title="Recovery Factors" accent={LIME}>
      <div className="grid grid-cols-1 gap-2 h-full content-center">
        <RacingBar label="Sleep Qual" value={oscBand(t, 88, 94, 1, 0.3)} max={100} unit="%" color={LIME} highlight />
        <RacingBar label="HRV Trend" value={oscBand(t, 78, 86, 2, 0.3)} max={100} unit="%" color={CYAN} />
        <RacingBar label="Muscle Load" value={oscBand(t, 42, 52, 3, 0.3)} max={100} unit="%" color={ORANGE} />
        <RacingBar label="Hydration" value={oscBand(t, 90, 96, 4, 0.3)} max={100} unit="%" color={CYAN} />
        <RacingBar label="Soreness" value={oscBand(t, 18, 26, 5, 0.3)} max={100} unit="%" color={ORANGE} />
      </div>
    </SceneFrame>
  )
}

function Scene10({ t }: { t: number }) {
  return (
    <SceneFrame phase="Readiness Engine" title="7-Day Training Load" accent={LIME}>
      <div className="flex flex-col h-full justify-center gap-4">
        <Equalizer t={t} bars={21} color={LIME} height={90} />
        <div className="grid grid-cols-3 gap-4">
          <BigStat value={oscBand(t, 11.5, 12.5, 1, 0.2)} label="Hours This Week" unit="h" color={LIME} decimals={1} />
          <BigStat value={oscBand(t, 3200, 3400, 2, 0.3)} label="Load Units" color={CYAN} />
          <BigStat value={94} label="Compliance %" color={ORANGE} />
        </div>
      </div>
    </SceneFrame>
  )
}

function Scene11({ t }: { t: number }) {
  return (
    <SceneFrame phase="Readiness Engine" title="Biometric Snapshot" accent={LIME}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 h-full content-center">
        <BigStat value={oscBand(t, 46, 52, 1, 0.4)} label="Resting HR" unit="bpm" color={ORANGE} />
        <BigStat value={oscBand(t, 74, 88, 2, 0.5)} label="HRV" unit="ms" color={LIME} />
        <BigStat value={oscBand(t, 7.5, 8.4, 3, 0.2)} label="Sleep" unit="hrs" color={CYAN} decimals={1} />
        <BigStat value={oscBand(t, 58, 64, 4, 0.3)} label="VO2 Max" unit="" color={LIME} />
      </div>
    </SceneFrame>
  )
}

// ═══════════════ PHASE 4 · COACHING (60-80s) ═══════════════

function Scene12({ t }: { t: number }) {
  const v = liveVals(t)
  const laps = [96.71, 97.02, 96.88, 97.44, 96.95]
  const idx = Math.floor(t) % laps.length
  return (
    <SceneFrame phase="Live Coaching" title="Lap Feed <500ms" accent={ORANGE}>
      <div className="grid grid-cols-[1fr_auto] gap-4 h-full items-center">
        <div className="flex flex-col gap-1.5">
          {laps.map((l, i) => (
            <div key={i} className={`flex items-center justify-between border px-3 py-1.5 rounded transition-colors ${i === idx ? 'border-orange-400/50 bg-orange-400/10' : 'border-zinc-800 bg-zinc-900/30'}`}>
              <span className="font-mono text-[10px] text-zinc-500">LAP {12 + i}</span>
              <span className="font-mono text-sm tabular-nums text-zinc-200" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>{l.toFixed(2)}s</span>
            </div>
          ))}
        </div>
        <Gauge value={v.speed} min={0} max={85} label="Live Speed" unit="mph" color={ORANGE} size={120} />
      </div>
    </SceneFrame>
  )
}

function Scene13({ t }: { t: number }) {
  const msgs = [
    'Brake 5m later into 7',
    'Copy — testing new line',
    'Rear grip up 8%, push',
    'Sector 2 purple, +0.3',
  ]
  const shown = clamp(Math.floor(sceneProgress(t) * 5), 1, msgs.length)
  return (
    <SceneFrame phase="Live Coaching" title="Pit ↔ Rider Radio" accent={ORANGE}>
      <div className="grid grid-cols-[1fr_auto] gap-4 h-full items-center">
        <div className="flex flex-col gap-2">
          {msgs.slice(0, shown).map((m, i) => (
            <div key={i} className={`text-xs px-3 py-2 rounded max-w-[85%] ${i % 2 === 0 ? 'bg-zinc-800 text-zinc-200 self-start' : 'bg-orange-400/15 text-orange-200 self-end'}`}>
              {m}
            </div>
          ))}
        </div>
        <BigStat value={oscBand(t, 210, 480, 1, 1.2)} label="Latency" unit="ms" color={ORANGE} />
      </div>
    </SceneFrame>
  )
}

function Scene14({ t }: { t: number }) {
  const v = liveVals(t)
  return (
    <SceneFrame phase="Live Coaching" title="Coach Dashboard" accent={ORANGE}>
      <div className="grid grid-cols-2 gap-3 h-full items-center">
        <Gauge value={v.throttle} min={0} max={100} label="Throttle" unit="%" color={ORANGE} size={120} />
        <div className="flex flex-col gap-2">
          <RacingBar label="Consistency" value={oscBand(t, 91, 96, 1, 0.4)} max={100} unit="%" color={LIME} highlight />
          <RacingBar label="Aggression" value={oscBand(t, 72, 84, 2, 0.6)} max={100} unit="%" color={ORANGE} />
          <RacingBar label="Line Score" value={oscBand(t, 86, 93, 3, 0.5)} max={100} unit="%" color={CYAN} />
        </div>
      </div>
    </SceneFrame>
  )
}

function Scene15({ t }: { t: number }) {
  return (
    <SceneFrame phase="Live Coaching" title="Session Compare" accent={ORANGE}>
      <div className="grid grid-cols-1 gap-2 h-full content-center">
        <Waveform t={t} kind="throttle" color={LIME} label="Best Lap — throttle trace" height={60} />
        <Waveform t={t + 0.6} kind="throttle" color={ORANGE} label="This Lap — throttle trace" height={60} />
      </div>
    </SceneFrame>
  )
}

// ═══════════════ PHASE 5 · COMPETITIVE (80-100s) ═══════════════

function Scene16({ t }: { t: number }) {
  // "You" climbing the field over the scene.
  const climb = easeOut(sceneProgress(t))
  const rows = [
    { name: RIVALS[0], v: 100 },
    { name: RIVALS[1], v: lerp(96, 92, climb) },
    { name: RIVALS[2], v: lerp(88, 97, climb), me: true },
    { name: RIVALS[3], v: lerp(90, 86, climb) },
    { name: RIVALS[4], v: 82 },
  ].sort((a, b) => b.v - a.v)
  return (
    <SceneFrame phase="Competitive Edge" title="Live Leaderboard" accent={CYAN}>
      <div className="flex flex-col gap-2 h-full justify-center">
        {rows.map((r, i) => (
          <div key={r.name} className="flex items-center gap-2">
            <span className={`font-mono text-xs w-6 ${r.me ? 'text-lime-400' : 'text-zinc-500'}`}>P{i + 1}</span>
            <div className="flex-1">
              <RacingBar label={r.name} value={r.v} max={100} unit="" color={r.me ? LIME : COLORS.ZINC} highlight={r.me} />
            </div>
          </div>
        ))}
      </div>
    </SceneFrame>
  )
}

function Scene17({ t }: { t: number }) {
  const close = easeOut(sceneProgress(t))
  const sectors = [
    { s: 'S1', d: lerp(0.12, -0.04, close) },
    { s: 'S2', d: lerp(-0.1, -0.31, close) },
    { s: 'S3', d: lerp(0.08, -0.02, close) },
    { s: 'S4', d: lerp(-0.05, -0.19, close) },
  ]
  return (
    <SceneFrame phase="Competitive Edge" title="Sector Deltas" accent={CYAN}>
      <div className="flex flex-col gap-3 h-full justify-center">
        {sectors.map((s) => (
          <div key={s.s} className="flex items-center gap-3">
            <span className="font-mono text-xs text-zinc-400 w-6">{s.s}</span>
            <div className="relative flex-1 h-5 bg-zinc-800/60 rounded overflow-hidden">
              <div className="absolute inset-y-0 left-1/2 w-px bg-zinc-600" />
              <div
                className="absolute inset-y-0 transition-none"
                style={s.d < 0
                  ? { right: '50%', width: `${clamp((Math.abs(s.d) / 0.5) * 50, 0, 50)}%`, background: LIME, boxShadow: `0 0 10px ${LIME}` }
                  : { left: '50%', width: `${clamp((s.d / 0.5) * 50, 0, 50)}%`, background: ORANGE }}
              />
            </div>
            <span className={`font-mono text-xs tabular-nums w-14 text-right ${s.d < 0 ? 'text-lime-400' : 'text-orange-400'}`}>
              {s.d > 0 ? '+' : ''}{s.d.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </SceneFrame>
  )
}

function Scene18({ t }: { t: number }) {
  const gap = oscBand(t, 0.08, 0.42, 1, 0.8)
  return (
    <SceneFrame phase="Competitive Edge" title="Gap to Leader" accent={CYAN}>
      <div className="grid grid-cols-[auto_1fr] gap-5 h-full items-center">
        <Ring value={100 - gap * 100} max={100} label="P2" sub={`+${gap.toFixed(2)}s`} color={CYAN} size={150} />
        <div className="flex flex-col gap-3">
          <BigStat value={gap} label="Seconds Behind" unit="s" color={CYAN} decimals={2} />
          <BigStat value={oscBand(t, 0.4, 0.8, 2, 0.6)} label="Closing / Lap" unit="s" color={LIME} decimals={2} />
          <BigStat value={14} label="Laps Remaining" color={ORANGE} />
        </div>
      </div>
    </SceneFrame>
  )
}

function Scene19({ t }: { t: number }) {
  return (
    <SceneFrame phase="Competitive Edge" title="Field Spread" accent={CYAN}>
      <div className="flex flex-col h-full justify-center gap-4">
        <Equalizer t={t} bars={24} color={CYAN} height={80} />
        <div className="grid grid-cols-3 gap-4">
          <BigStat value={oscBand(t, 40, 42, 1, 0.3)} label="Riders" color={CYAN} />
          <BigStat value={oscBand(t, 2.1, 2.4, 2, 0.4)} label="Spread" unit="s" color={LIME} decimals={1} />
          <BigStat value={oscBand(t, 96.5, 97.2, 3, 0.5)} label="Fast Lap" unit="s" color={ORANGE} decimals={1} />
        </div>
      </div>
    </SceneFrame>
  )
}

// ═══════════════ PHASE 6 · PAYOFF (100-120s) ═══════════════

function Scene20({ t }: { t: number }) {
  return (
    <SceneFrame phase="The Payoff" title="Season In Numbers" accent={LIME}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 h-full content-center">
        <BigStat value={oscBand(t, 2400, 2480, 1, 0.2)} label="Laps Logged" color={LIME} />
        <BigStat value={oscBand(t, 184, 190, 2, 0.2)} label="Sessions" color={CYAN} />
        <BigStat value={oscBand(t, 1.6, 1.8, 3, 0.3)} label="Avg Lap Gain" unit="s" color={ORANGE} decimals={1} />
        <BigStat value={oscBand(t, 11, 11, 4, 0)} label="Team Roles" color={LIME} />
      </div>
    </SceneFrame>
  )
}

function Scene21({ t }: { t: number }) {
  const climb = easeOut(sceneProgress(t))
  return (
    <SceneFrame phase="The Payoff" title="Championship Chase" accent={LIME}>
      <div className="flex flex-col gap-2 h-full justify-center">
        <RacingBar label="Rd 1-3" value={lerp(0, 66, clamp(climb * 3, 0, 1))} max={100} unit="pts" color={CYAN} />
        <RacingBar label="Rd 4-6" value={lerp(0, 78, clamp(climb * 3 - 0.5, 0, 1))} max={100} unit="pts" color={CYAN} />
        <RacingBar label="Rd 7-9" value={lerp(0, 91, clamp(climb * 3 - 1, 0, 1))} max={100} unit="pts" color={LIME} highlight />
        <div className="text-center mt-2">
          <BigStat value={lerp(0, 235, climb)} label="Points — 1st in Class" color={LIME} />
        </div>
      </div>
    </SceneFrame>
  )
}

function Scene22({ t }: { t: number }) {
  const roles = ['Rider', 'Crew Chief', 'Mechanic', 'Data Analyst', 'Trainer', 'Physio', 'Team Mgr', 'Truck', 'Media', 'Coach', 'Owner']
  const lit = clamp(Math.floor(sceneProgress(t) * 14), 1, roles.length)
  return (
    <SceneFrame phase="The Payoff" title="One Platform, Whole Team" accent={LIME}>
      <div className="flex flex-wrap gap-2 h-full content-center items-center justify-center">
        {roles.map((r, i) => (
          <span
            key={r}
            className={`font-mono text-xs uppercase tracking-wider px-3 py-2 rounded border transition-colors ${i < lit ? 'border-lime-400/50 bg-lime-400/10 text-lime-300' : 'border-zinc-800 bg-zinc-900/30 text-zinc-600'}`}
          >
            {r}
          </span>
        ))}
      </div>
    </SceneFrame>
  )
}

function Scene23({ t }: { t: number }) {
  return (
    <SceneFrame phase="The Payoff" title="Turn Data Into Trophies" accent={LIME}>
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="grid grid-cols-3 gap-6">
          <BigStat value={oscBand(t, 2480, 2480, 1, 0)} label="Data Points/s" color={LIME} />
          <BigStat value={11} label="Roles" color={CYAN} />
          <BigStat value={5} label="Tiers From Free" color={ORANGE} />
        </div>
        <p className="text-zinc-100 text-center text-balance" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 'clamp(1.5rem,4vw,2.4rem)' }}>
          EVERY LAP. <span className="text-lime-400">EVERY DATA POINT.</span>
        </p>
      </div>
    </SceneFrame>
  )
}

// ═══════════════ READINESS & HEALTH (extra sections) ═══════════════

function Scene24({ t }: { t: number }) {
  return (
    <SceneFrame phase="Fuel & Nutrition" title="Race-Week Fueling" accent={LIME}>
      <div className="grid grid-cols-[auto_1fr] gap-5 h-full items-center">
        <Ring value={oscBand(t, 91, 97, 1, 0.3)} max={100} label="Hydration" sub="on target" color={CYAN} size={140} />
        <div className="flex flex-col gap-2">
          <RacingBar label="Carbs" value={oscBand(t, 78, 88, 1, 0.3)} max={100} unit="%" color={LIME} highlight />
          <RacingBar label="Protein" value={oscBand(t, 82, 92, 2, 0.3)} max={100} unit="%" color={CYAN} />
          <RacingBar label="Sodium" value={oscBand(t, 68, 80, 3, 0.3)} max={100} unit="%" color={ORANGE} />
          <RacingBar label="Calories" value={oscBand(t, 2900, 3300, 4, 0.2)} max={4000} unit="kcal" color={LIME} />
        </div>
      </div>
    </SceneFrame>
  )
}

function Scene25({ t }: { t: number }) {
  return (
    <SceneFrame phase="Mental Fitness" title="Focus & Confidence" accent={CYAN}>
      <div className="grid grid-cols-3 gap-3 h-full items-center">
        <Gauge value={oscBand(t, 84, 94, 1, 0.5)} min={0} max={100} label="Focus" unit="%" color={CYAN} />
        <Gauge value={oscBand(t, 78, 90, 2, 0.4)} min={0} max={100} label="Confidence" unit="%" color={LIME} />
        <Gauge value={oscBand(t, 14, 28, 3, 0.6)} min={0} max={100} label="Anxiety" unit="%" color={ORANGE} />
      </div>
    </SceneFrame>
  )
}

function Scene26({ t }: { t: number }) {
  return (
    <SceneFrame phase="Injury Prevention" title="Load Management" accent={LIME}>
      <div className="flex flex-col h-full justify-center gap-4">
        <Equalizer t={t} bars={21} color={ORANGE} height={82} />
        <div className="grid grid-cols-3 gap-4">
          <BigStat value={oscBand(t, 0.9, 1.2, 1, 0.2)} label="Acute:Chronic" color={LIME} decimals={2} />
          <BigStat value={oscBand(t, 18, 26, 2, 0.3)} label="Fatigue %" color={ORANGE} />
          <BigStat value={oscBand(t, 96, 99, 3, 0.2)} label="Availability %" color={CYAN} />
        </div>
      </div>
    </SceneFrame>
  )
}

// ═══════════════ CREW & LOGISTICS ═══════════════

function Scene27({ t }: { t: number }) {
  const parts = [
    { n: 'Front Fork Kit', q: 4 },
    { n: 'Rear Shock Spring', q: 7 },
    { n: 'Piston / Ring Set', q: 12 },
    { n: 'Chain & Sprocket', q: 9 },
  ]
  const lit = clamp(Math.floor(sceneProgress(t) * 5), 1, parts.length)
  return (
    <SceneFrame phase="Part Vault" title="Inventory Tracking" accent={CYAN}>
      <div className="flex flex-col gap-1.5 h-full justify-center">
        {parts.map((p, i) => (
          <div key={p.n} className={`flex items-center justify-between border px-3 py-2 rounded transition-colors ${i < lit ? 'border-cyan-400/40 bg-cyan-400/5' : 'border-zinc-800 bg-zinc-900/30'}`}>
            <span className="text-zinc-300 text-xs">{p.n}</span>
            <span className="font-mono text-sm tabular-nums text-cyan-400" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900 }}>{p.q} in stock</span>
          </div>
        ))}
      </div>
    </SceneFrame>
  )
}

function Scene28({ t }: { t: number }) {
  return (
    <SceneFrame phase="Maintenance" title="Engine Hours & Service" accent={ORANGE}>
      <div className="grid grid-cols-1 gap-2 h-full content-center">
        <RacingBar label="Engine Hrs (rebuild @40)" value={oscBand(t, 27, 31, 1, 0.15)} max={40} unit="h" color={ORANGE} highlight />
        <RacingBar label="Air Filter (svc @15)" value={oscBand(t, 9, 12, 2, 0.15)} max={15} unit="h" color={CYAN} />
        <RacingBar label="Oil Life" value={oscBand(t, 58, 68, 3, 0.2)} max={100} unit="%" color={LIME} />
        <RacingBar label="Brake Pad" value={oscBand(t, 44, 54, 4, 0.2)} max={100} unit="%" color={ORANGE} />
      </div>
    </SceneFrame>
  )
}

function Scene29({ t }: { t: number }) {
  const rounds = ['Anaheim 1', 'San Diego', 'Glendale', 'Oakland', 'Houston']
  const idx = Math.floor(t) % rounds.length
  return (
    <SceneFrame phase="Race Calendar" title="Season Schedule" accent={CYAN}>
      <div className="grid grid-cols-[1fr_auto] gap-4 h-full items-center">
        <div className="flex flex-col gap-1.5">
          {rounds.map((r, i) => (
            <div key={r} className={`flex items-center justify-between border px-3 py-1.5 rounded transition-colors ${i === idx ? 'border-cyan-400/50 bg-cyan-400/10' : 'border-zinc-800 bg-zinc-900/30'}`}>
              <span className="font-mono text-[10px] text-zinc-500">RD {i + 1}</span>
              <span className="text-zinc-200 text-xs">{r}</span>
            </div>
          ))}
        </div>
        <BigStat value={oscBand(t, 12, 12, 1, 0)} label="Rounds Left" color={CYAN} />
      </div>
    </SceneFrame>
  )
}

// ═══════════════ BUSINESS ═══════════════

function Scene30({ t }: { t: number }) {
  return (
    <SceneFrame phase="Sponsor ROI" title="Media Value Delivered" accent={LIME}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 h-full content-center">
        <BigStat value={oscBand(t, 1.8, 2.1, 1, 0.2)} label="Media Value" unit="M$" color={LIME} decimals={2} />
        <BigStat value={oscBand(t, 42, 48, 2, 0.3)} label="Broadcast Min" color={CYAN} />
        <BigStat value={oscBand(t, 3.1, 3.6, 3, 0.3)} label="Social Reach" unit="M" color={ORANGE} decimals={1} />
        <BigStat value={oscBand(t, 118, 128, 4, 0.2)} label="Logo Impressions" unit="M" color={LIME} />
      </div>
    </SceneFrame>
  )
}

function Scene31({ t }: { t: number }) {
  const climb = easeOut(sceneProgress(t))
  return (
    <SceneFrame phase="Team Financials" title="Invoice → Cash" accent={CYAN}>
      <div className="flex flex-col gap-2 h-full justify-center">
        <RacingBar label="Invoiced" value={lerp(0, 92, clamp(climb * 2, 0, 1))} max={100} unit="k$" color={CYAN} />
        <RacingBar label="Collected" value={lerp(0, 78, clamp(climb * 2 - 0.3, 0, 1))} max={100} unit="k$" color={LIME} highlight />
        <RacingBar label="Outstanding" value={lerp(0, 14, clamp(climb * 2 - 0.5, 0, 1))} max={100} unit="k$" color={ORANGE} />
        <div className="grid grid-cols-2 gap-4 mt-1">
          <BigStat value={oscBand(t, 3.2, 3.8, 1, 0.2)} label="Days to Cash" color={LIME} decimals={1} />
          <BigStat value={oscBand(t, 96, 99, 2, 0.2)} label="Collection %" color={CYAN} />
        </div>
      </div>
    </SceneFrame>
  )
}

// ── Scene registry — every entry is a DISTINCT section, played in order ──
const SCENES = [
  // Live Telemetry (0–3)
  Scene0, Scene1, Scene2, Scene3,
  // AI Setup (4–7)
  Scene4, Scene5, Scene6, Scene7,
  // Readiness & Health (8–14)
  Scene8, Scene9, Scene10, Scene11, Scene24, Scene25, Scene26,
  // Coaching (15–18)
  Scene12, Scene13, Scene14, Scene15,
  // Competitive (19–22)
  Scene16, Scene17, Scene18, Scene19,
  // Crew & Logistics (23–25)
  Scene27, Scene28, Scene29,
  // Business (26–27)
  Scene30, Scene31,
  // Payoff (28–31)
  Scene20, Scene21, Scene22, Scene23,
]

export const CHAPTERS = [
  { label: 'Live Telemetry', at: 0, accent: LIME },
  { label: 'AI Setup', at: 20, accent: CYAN },
  { label: 'Readiness & Health', at: 40, accent: LIME },
  { label: 'Coaching', at: 75, accent: ORANGE },
  { label: 'Competitive', at: 95, accent: CYAN },
  { label: 'Crew & Logistics', at: 115, accent: ORANGE },
  { label: 'Business', at: 130, accent: CYAN },
  { label: 'Payoff', at: 140, accent: LIME },
]

// Accent color for the phase active at time t (drives the living backdrop tint).
export function phaseAccentAt(t: number): string {
  let accent = CHAPTERS[0].accent
  for (const c of CHAPTERS) if (t >= c.at) accent = c.accent
  return accent
}

// Narrative anchor: gives the numbers meaning so viewers correlate them to a story.
// Everything derives from t so it stays in sync with the scrubbable clock.
export type DemoContext = {
  headline: string
  lap: string
  sector: string
  accent: string
}
export function contextAt(t: number): DemoContext {
  const totalLaps = 20
  // Lap counter climbs across the whole 160s run.
  const lap = clamp(Math.floor(t / 8) + 1, 1, totalLaps)
  const sector = (Math.floor(t / 1.4) % 4) + 1
  const accent = phaseAccentAt(t)
  let headline = 'Streaming live from the bike — speed, lean, suspension, vitals'
  if (t >= 20 && t < 40) headline = 'AI solving front-fork compression for Turn 4 grip'
  else if (t >= 40 && t < 75) headline = 'Fitness, fuel, focus and injury risk — rider cleared to push'
  else if (t >= 75 && t < 95) headline = 'Pit wall coaching the braking marker into Turn 7'
  else if (t >= 95 && t < 115) headline = 'Closing the gap — P3 climbing toward P2'
  else if (t >= 115 && t < 130) headline = 'Crew tracking parts, engine hours and the race calendar'
  else if (t >= 130 && t < 140) headline = 'Sponsor value delivered, invoices collected'
  else if (t >= 140) headline = 'Season on the board — the whole team, one platform'
  return { headline, lap: `Lap ${lap}/${totalLaps}`, sector: `Sector ${sector}`, accent }
}

// Renders the active scene for time t, with a quick cross-fade at boundaries.
export function DemoScene({ t, index }: { t: number; index: number }) {
  const Active = SCENES[clamp(index, 0, SCENES.length - 1)]
  return <Active t={t} />
}

export const SCENE_TOTAL = SCENES.length
