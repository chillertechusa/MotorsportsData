'use client'

import { useState } from 'react'
import { X, Zap, Inbox } from 'lucide-react'
import { getDemoDataDescription } from '@/lib/demo-data-generator'
import type { Discipline } from '@/lib/use-discipline-language'

interface OnboardingChoiceModalProps {
  isOpen: boolean
  onClose: () => void
  discipline: Discipline
  onChooseSampleData: () => void
  onChooseStartFresh: () => void
  loading?: boolean
}

export default function OnboardingChoiceModal({
  isOpen,
  onClose,
  discipline,
  onChooseSampleData,
  onChooseStartFresh,
  loading = false,
}: OnboardingChoiceModalProps) {
  const [choice, setChoice] = useState<'sample' | 'fresh' | null>(null)

  if (!isOpen) return null

  const demoDescription = getDemoDataDescription(discipline)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-800/50">
          <h2 className="text-xl font-black uppercase tracking-tight">Welcome to Motorsport Data</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-8 space-y-6">
          <p className="text-sm text-zinc-400">
            Let&apos;s get you started. Would you like to begin with sample data to explore the platform, or start with a clean slate?
          </p>

          {/* Option 1: Sample Data */}
          <button
            onClick={() => {
              setChoice('sample')
              onChooseSampleData()
            }}
            disabled={loading}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              choice === 'sample'
                ? 'border-lime-400 bg-lime-400/10'
                : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-start gap-3 mb-2">
              <div className="mt-0.5">
                <Zap className={`w-5 h-5 ${choice === 'sample' ? 'text-lime-400' : 'text-zinc-500'}`} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-zinc-100">Load Sample Data</p>
                <p className="text-xs text-zinc-400 mt-1">{demoDescription}</p>
              </div>
            </div>
          </button>

          {/* Option 2: Start Fresh */}
          <button
            onClick={() => {
              setChoice('fresh')
              onChooseStartFresh()
            }}
            disabled={loading}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              choice === 'fresh'
                ? 'border-blue-400 bg-blue-400/10'
                : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-start gap-3 mb-2">
              <div className="mt-0.5">
                <Inbox className={`w-5 h-5 ${choice === 'fresh' ? 'text-blue-400' : 'text-zinc-500'}`} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-zinc-100">Start Fresh</p>
                <p className="text-xs text-zinc-400 mt-1">Begin with empty consoles. Add your own data as you go.</p>
              </div>
            </div>
          </button>

          {/* Subtext */}
          <p className="text-xs text-zinc-600 text-center">
            You can always change this later from your account settings.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-zinc-800 bg-zinc-800/30">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg border border-zinc-700 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (choice === 'sample') onChooseSampleData()
              else if (choice === 'fresh') onChooseStartFresh()
            }}
            disabled={loading || !choice}
            className="flex-1 px-4 py-2 rounded-lg bg-lime-400 text-zinc-950 text-sm font-bold hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting up...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
