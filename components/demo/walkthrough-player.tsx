'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react'
import { DEMO_SCENES, DEMO_TOTAL_DURATION, getCurrentScene } from '@/app/actions/demo-orchestrator'
import { generateDemoTeamData } from '@/app/actions/seed-demo-team'
import DemoSceneRenderer from './demo-scene-renderer'

export default function WalkthroughPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [t, setT] = useState(0)
  const [demoData] = useState(() => generateDemoTeamData())

  // Auto-advance time while playing
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setT(prev => {
        const next = prev + 0.016 // ~60fps
        if (next >= DEMO_TOTAL_DURATION) {
          setIsPlaying(false)
          return DEMO_TOTAL_DURATION
        }
        return next
      })
    }, 16)

    return () => clearInterval(interval)
  }, [isPlaying])

  const { scene, progress } = getCurrentScene(t)

  // Handler functions
  const togglePlay = () => setIsPlaying(!isPlaying)
  const handleReset = () => {
    setT(0)
    setIsPlaying(false)
  }
  const handleSeek = (newT: number) => {
    setT(Math.max(0, Math.min(newT, DEMO_TOTAL_DURATION)))
  }
  const goToScene = (sceneId: string) => {
    const targetScene = DEMO_SCENES.find(s => s.id === sceneId)
    if (targetScene) {
      handleSeek(targetScene.startTime)
      setIsPlaying(true)
    }
  }
  const nextScene = () => {
    const currentIndex = DEMO_SCENES.findIndex(s => s.id === scene.id)
    if (currentIndex < DEMO_SCENES.length - 1) {
      goToScene(DEMO_SCENES[currentIndex + 1].id)
    }
  }
  const prevScene = () => {
    const currentIndex = DEMO_SCENES.findIndex(s => s.id === scene.id)
    if (currentIndex > 0) {
      goToScene(DEMO_SCENES[currentIndex - 1].id)
    }
  }

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
      {/* Main player area */}
      <div className="relative aspect-video bg-zinc-900 flex items-center justify-center overflow-hidden">
        {/* Scene renderer */}
        <DemoSceneRenderer scene={scene} progress={progress} demoData={demoData} t={t} />

        {/* Play/Pause overlay (center) */}
        {!isPlaying && t === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
            <button
              onClick={togglePlay}
              className="flex items-center justify-center w-20 h-20 rounded-full bg-lime-400 hover:bg-lime-300 text-zinc-950 transition-colors"
            >
              <Play className="h-8 w-8 ml-1" fill="currentColor" />
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-zinc-900 border-t border-zinc-800 p-4 space-y-4">
        {/* Progress bar */}
        <div
          className="w-full h-2 bg-zinc-800 rounded-full cursor-pointer hover:bg-zinc-700 transition-colors"
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect()
            const percent = (e.clientX - rect.left) / rect.width
            handleSeek(percent * DEMO_TOTAL_DURATION)
          }}
        >
          <div
            className="h-full bg-lime-400 rounded-full transition-all"
            style={{ width: `${(t / DEMO_TOTAL_DURATION) * 100}%` }}
          />
        </div>

        {/* Time display */}
        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span>{formatTime(t)}</span>
          <span>{formatTime(DEMO_TOTAL_DURATION)}</span>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="p-2 rounded hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-200"
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={prevScene}
            className="p-2 rounded hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-200"
            title="Previous scene"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={togglePlay}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-lime-400 hover:bg-lime-300 text-zinc-950 transition-colors font-semibold text-sm"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" fill="currentColor" />}
          </button>
          <button
            onClick={nextScene}
            className="p-2 rounded hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-200"
            title="Next scene"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Scene navigator */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Jump to scene</p>
          <div className="grid grid-cols-4 gap-2">
            {DEMO_SCENES.map(s => (
              <button
                key={s.id}
                onClick={() => goToScene(s.id)}
                className={`px-3 py-2 rounded text-xs font-mono uppercase tracking-wide transition-colors ${
                  s.id === scene.id
                    ? 'bg-lime-400 text-zinc-950 font-bold'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                }`}
              >
                {s.label.split('. ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Current scene info */}
        <div className="border-t border-zinc-800 pt-4">
          <p className="text-xs uppercase tracking-widest text-zinc-500 font-mono mb-2">Current scene</p>
          <div className="bg-zinc-950 border border-zinc-800 p-3 rounded space-y-1">
            <p className="font-bold text-zinc-100">{scene.title}</p>
            <p className="text-xs text-zinc-400">{scene.narrative}</p>
            <div className="pt-2 space-y-1">
              {scene.dataHighlights.map((h, i) => (
                <p key={i} className="text-xs text-zinc-500 font-mono">
                  • {h}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
