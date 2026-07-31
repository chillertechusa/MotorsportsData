'use client'

import { useState } from 'react'
import { CheckCircle2, Users, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Step = 'welcome' | 'verify' | 'coaches' | 'shops' | 'complete'

export default function AdminOnboardingPage() {
  const [step, setStep] = useState<Step>('welcome')
  const [verifyEmail, setVerifyEmail] = useState('')

  const steps = [
    { id: 'welcome', label: 'Welcome' },
    { id: 'verify', label: 'Verify Admin' },
    { id: 'coaches', label: 'Approve Coaches' },
    { id: 'shops', label: 'Add Shops' },
    { id: 'complete', label: 'Complete' },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Bike Doctor Admin Setup</h1>
          <p className="text-zinc-400">Follow these steps to configure your instance</p>
        </div>

        {/* Progress */}
        <div className="flex justify-between mb-12">
          {steps.map((s, idx) => (
            <div key={s.id} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step === s.id
                    ? 'bg-lime-400 text-black'
                    : idx < steps.indexOf(...steps.filter((x) => x.id === step) || [])
                      ? 'bg-lime-500/30 text-lime-300'
                      : 'bg-zinc-700 text-zinc-400'
                }`}
              >
                {idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div className="w-12 h-1 bg-zinc-700 mx-2" />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-8 mb-8">
          {step === 'welcome' && (
            <div>
              <h2 className="text-2xl font-bold text-zinc-100 mb-4">Welcome, Admin</h2>
              <p className="text-zinc-300 mb-6">
                This wizard will help you set up Bike Doctor for your community. You'll:
              </p>
              <ul className="space-y-3 mb-8 text-zinc-300">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-lime-400" />
                  Verify your admin status
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-lime-400" />
                  Approve coaches (tier 5) and shops (tier 6)
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-lime-400" />
                  Configure shop integrations
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-lime-400" />
                  Monitor platform health
                </li>
              </ul>
              <Button
                onClick={() => setStep('verify')}
                className="w-full bg-lime-500 hover:bg-lime-600 text-black font-bold"
              >
                Continue
              </Button>
            </div>
          )}

          {step === 'verify' && (
            <div>
              <h2 className="text-2xl font-bold text-zinc-100 mb-4">Verify Admin Status</h2>
              <p className="text-zinc-300 mb-6">
                Enter your admin email to verify your credentials:
              </p>
              <input
                type="email"
                placeholder="admin@bikedoctor.io"
                value={verifyEmail}
                onChange={(e) => setVerifyEmail(e.target.value)}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-3 text-zinc-100 mb-6"
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep('welcome')}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep('coaches')}
                  className="flex-1 bg-lime-500 hover:bg-lime-600 text-black font-bold"
                >
                  Verify & Continue
                </Button>
              </div>
            </div>
          )}

          {step === 'coaches' && (
            <div>
              <h2 className="text-2xl font-bold text-zinc-100 mb-4">Approve Coaches</h2>
              <p className="text-zinc-300 mb-6">
                Review and approve coach tier (5) requests. They pay $49/mo and get read-only access to rider data.
              </p>
              <div className="bg-zinc-700/30 border border-zinc-600 rounded-lg p-4 mb-6">
                <p className="text-zinc-400 text-sm">Pending approvals: Check /admin dashboard for queue</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep('verify')}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep('shops')}
                  className="flex-1 bg-lime-500 hover:bg-lime-600 text-black font-bold"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 'shops' && (
            <div>
              <h2 className="text-2xl font-bold text-zinc-100 mb-4">Configure Shops</h2>
              <p className="text-zinc-300 mb-6">
                Shops (tier 6) receive work orders from riders at $99/mo. They integrate via Clutch DMS webhook.
              </p>
              <div className="bg-zinc-700/30 border border-zinc-600 rounded-lg p-4 mb-6">
                <p className="text-zinc-400 text-sm">
                  Set CLUTCH_DMS_WEBHOOK_URL in environment to enable shop bridge
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep('coaches')}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep('complete')}
                  className="flex-1 bg-lime-500 hover:bg-lime-600 text-black font-bold"
                >
                  Complete Setup
                </Button>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-lime-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-8 w-8 text-lime-400" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-100 mb-3">Setup Complete!</h2>
              <p className="text-zinc-400 mb-8">
                Your Bike Doctor platform is ready. Monitor health and approvals from /admin dashboard.
              </p>
              <Button className="w-full bg-lime-500 hover:bg-lime-600 text-black font-bold">
                Go to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
