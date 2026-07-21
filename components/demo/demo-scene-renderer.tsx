'use client'

import { DemoScene } from '@/app/actions/demo-orchestrator'
import { DemoTeamData } from '@/app/actions/seed-demo-team'
import { TrendingUp, Heart, Zap, Trophy } from 'lucide-react'

interface SceneRendererProps {
  scene: DemoScene
  progress: number
  demoData: DemoTeamData
  t: number
}

export default function DemoSceneRenderer({ scene, progress, demoData, t }: SceneRendererProps) {
  // Smooth fade-in/out at scene transitions
  const opacity = Math.min(progress < 0.15 ? progress * 6 : 1, progress > 0.85 ? (1 - progress) * 6 : 1)

  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ opacity }}>
      <div className="w-full h-full p-8 flex flex-col justify-center space-y-6 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900">
        {/* Scene-specific content */}
        {scene.type === 'auth' && <AuthScene rider={demoData.rider} progress={progress} />}
        {scene.type === 'dashboard' && <DashboardScene readiness={demoData.readinessLog} progress={progress} />}
        {scene.type === 'training' && <TrainingScene training={demoData.trainingLog} progress={progress} />}
        {scene.type === 'session' && <SessionScene session={demoData.sessions[2]} progress={progress} />}
        {scene.type === 'telemetry' && <TelemetryScene telemetry={demoData.telemetry} progress={progress} />}
        {scene.type === 'coaching' && <CoachingScene coaching={demoData.coaching} progress={progress} />}
        {scene.type === 'results' && <ResultsScene competitive={demoData.competitiveData} progress={progress} />}
        {scene.type === 'metrics' && <MetricsScene metrics={demoData.businessMetrics} progress={progress} />}

        {/* Title + subtitle overlay */}
        <div className="absolute top-6 left-6 right-6">
          <p className="text-xs uppercase tracking-widest text-lime-400 font-mono font-bold mb-1">{scene.label}</p>
          <h2 className="text-4xl font-black text-zinc-50">{scene.title}</h2>
          <p className="text-zinc-400 mt-1">{scene.subtitle}</p>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Scene Components
// ─────────────────────────────────────────────────────────────────────────

function AuthScene({ rider, progress }: { rider: any; progress: number }) {
  const scale = 0.8 + progress * 0.2
  return (
    <div className="flex flex-col items-center justify-center space-y-6 transform" style={{ transform: `scale(${scale})` }}>
      <div className="text-center space-y-4">
        <p className="text-6xl font-black text-zinc-100">{rider.number}</p>
        <p className="text-2xl font-bold text-zinc-200">{rider.name}</p>
        <p className="text-sm text-zinc-400 max-w-sm">{rider.bio}</p>
      </div>
      <div className="border-t border-zinc-700 pt-6 text-xs text-zinc-500 text-center">✓ Authentication successful</div>
    </div>
  )
}

function DashboardScene({ readiness, progress }: { readiness: any[]; progress: number }) {
  const latest = readiness[readiness.length - 1]
  const scale = 0.9 + progress * 0.1
  return (
    <div className="flex gap-8" style={{ transform: `scale(${scale})` }}>
      <div className="flex-1 space-y-4">
        <div className="text-6xl font-black text-lime-400">{latest.score}</div>
        <p className="text-sm text-zinc-400">Readiness Score (Peak Condition)</p>
      </div>
      <div className="flex-1 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-500">HRV</span>
          <span className="text-zinc-200 font-mono">{latest.hrv} ms</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Resting HR</span>
          <span className="text-zinc-200 font-mono">{latest.rhr} BPM</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Sleep</span>
          <span className="text-zinc-200 font-mono">{latest.sleepHours} hrs</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-zinc-700">
          <span className="text-lime-400">Trend</span>
          <span className="text-lime-400 font-bold">↑ Improving</span>
        </div>
      </div>
    </div>
  )
}

function TrainingScene({ training, progress }: { training: any[]; progress: number }) {
  const displayTraining = training.slice(0, Math.ceil(progress * training.length + 1))
  return (
    <div className="space-y-3 max-w-lg">
      {displayTraining.map((t, i) => (
        <div key={i} className="border-l-2 border-lime-400 pl-4 py-2">
          <div className="flex justify-between items-start mb-1">
            <p className="font-bold text-zinc-100">{t.type}</p>
            <p className="text-xs text-zinc-500 font-mono">{t.duration} min</p>
          </div>
          <p className="text-sm text-zinc-400">{t.notes}</p>
          <div className="h-1 bg-zinc-800 mt-2 rounded-full">
            <div
              className="h-full bg-lime-400 rounded-full"
              style={{ width: `${Math.min(100, (t.intensity / 10) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function SessionScene({ session, progress }: { session: any; progress: number }) {
  const rotate = progress * 360
  return (
    <div className="grid grid-cols-2 gap-8 max-w-2xl">
      <div className="space-y-3">
        <p className="text-lg font-bold text-zinc-100">{session.name}</p>
        <div className="space-y-1 text-sm">
          <p className="text-zinc-500">
            Laps: <span className="text-zinc-200 font-mono">{session.laps}</span>
          </p>
          <p className="text-zinc-500">
            Duration: <span className="text-zinc-200 font-mono">{(session.duration / 60).toFixed(0)} min</span>
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex gap-4">
          <div>
            <p className="text-xs text-zinc-500">Avg Speed</p>
            <p className="text-2xl font-bold text-lime-400">{session.avgSpeed.toFixed(1)}</p>
            <p className="text-xs text-zinc-600">km/h</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Max Speed</p>
            <p className="text-2xl font-bold text-orange-400">{session.maxSpeed.toFixed(1)}</p>
            <p className="text-xs text-zinc-600">km/h</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function TelemetryScene({ telemetry, progress }: { telemetry: any; progress: number }) {
  const frameIndex = Math.floor(progress * (telemetry.sessions[0].frames.length - 1))
  const frame = telemetry.sessions[0].frames[frameIndex]

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <MetricBox label="Speed" value={frame.speed.toFixed(0)} unit="km/h" color="text-cyan-400" />
        <MetricBox label="RPM" value={(frame.rpm / 1000).toFixed(1)}unit="k" color="text-purple-400" />
        <MetricBox label="Lean Angle" value={frame.lean.toFixed(1)} unit="°" color="text-orange-400" />
        <MetricBox label="Heart Rate" value={frame.heartRate.toFixed(0)} unit="BPM" color="text-red-400" />
      </div>
      <div className="border-t border-zinc-700 pt-4 text-xs text-zinc-500">
        Playing lap data: frame {frameIndex} / {telemetry.sessions[0].frames.length}
      </div>
    </div>
  )
}

function CoachingScene({ coaching, progress }: { coaching: any[]; progress: number }) {
  const displayCoaching = coaching.slice(0, Math.ceil(progress * coaching.length + 1))
  return (
    <div className="space-y-2 max-w-lg">
      {displayCoaching.map((c, i) => (
        <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-3 rounded">
          <p className="text-xs uppercase tracking-wider text-lime-400 font-mono mb-1">
            {c.type} • Lap {c.lapNum}
          </p>
          <p className="text-sm text-zinc-200">{c.message}</p>
        </div>
      ))}
    </div>
  )
}

function ResultsScene({ competitive, progress }: { competitive: any[]; progress: number }) {
  const displayRows = competitive.slice(0, Math.ceil(progress * competitive.length + 1))
  return (
    <div className="space-y-2 max-w-lg font-mono text-sm">
      <div className="grid grid-cols-4 gap-4 text-xs text-zinc-500 mb-2 pb-2 border-b border-zinc-700">
        <span>Lap</span>
        <span>Pos</span>
        <span>Time</span>
        <span>Gap</span>
      </div>
      {displayRows.map((r, i) => (
        <div
          key={i}
          className={`grid grid-cols-4 gap-4 text-xs ${
            r.riderName.includes('You') ? 'text-lime-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <span>{r.lap}</span>
          <span>{r.position}</span>
          <span>{(r.lapTime / 1000).toFixed(2)}s</span>
          <span>{r.gapToLeader === 0 ? 'LEAD' : `+${(r.gapToLeader / 1000).toFixed(2)}s`}</span>
        </div>
      ))}
    </div>
  )
}

function MetricsScene({ metrics, progress }: { metrics: any; progress: number }) {
  return (
    <div className="grid grid-cols-2 gap-6 max-w-2xl">
      <MetricBox
        label="Media Value"
        value={`$${(metrics.mediaValue / 1000000).toFixed(1)}M`}
        color="text-green-400"
      />
      <MetricBox
        label="Broadcast Time"
        value={metrics.broadcastMinutes}
        unit="min"
        color="text-purple-400"
      />
      <MetricBox
        label="Social Reach"
        value={`${(metrics.socialReach / 1000000).toFixed(1)}M`}
        color="text-pink-400"
      />
      <MetricBox
        label="Championship"
        value={`P${metrics.championship.position}`}
        unit={`(${metrics.championship.points}pts)`}
        color="text-yellow-400"
      />
    </div>
  )
}

function MetricBox({
  label,
  value,
  unit = '',
  color = 'text-lime-400',
}: {
  label: string
  value: string | number
  unit?: string
  color?: string
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded">
      <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">{label}</p>
      <p className={`text-3xl font-black ${color}`}>
        {value}
        {unit && <span className="text-lg ml-1 text-zinc-500">{unit}</span>}
      </p>
    </div>
  )
}
