'use client'

import { useState } from 'react'
import { ChevronRight, Bike, Users, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Step = 'welcome' | 'bike' | 'role' | 'complete'

export function WelcomeFlow() {
  const [step, setStep] = useState<Step>('welcome')
  const [bikeModel, setBikeModel] = useState('')
  const [role, setRole] = useState('')

  const bikes = [
    'Honda CRF450R',
    'Yamaha YZ450F',
    'KTM 450SXF',
    'Suzuki RMZ450',
    'Kawasaki KX450',
    'Honda CRF250R',
    'Yamaha YZ250F',
    'Other',
  ]

  const roles = [
    { id: 'rider', label: 'I\'m a rider', icon: Target, desc: 'Track my bike, get AI diagnostics' },
    { id: 'parent', label: 'I\'m a parent', icon: Users, desc: 'Monitor my kids\' racing' },
    { id: 'coach', label: 'I\'m a coach', icon: Users, desc: 'Coach multiple athletes' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-8">
        {/* Welcome */}
        {step === 'welcome' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-lime-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bike className="h-8 w-8 text-lime-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 mb-3">Welcome to Bike Doctor</h2>
            <p className="text-zinc-400 mb-8">
              Let's get your profile set up in 2 minutes. Tell us about your bike and role.
            </p>
            <Button
              onClick={() => setStep('bike')}
              className="w-full bg-lime-500 hover:bg-lime-600 text-black font-bold"
            >
              Get Started <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Bike Selection */}
        {step === 'bike' && (
          <div>
            <h2 className="text-2xl font-bold text-zinc-100 mb-6">What bike do you ride?</h2>
            <div className="grid grid-cols-2 gap-3">
              {bikes.map((bike) => (
                <button
                  key={bike}
                  onClick={() => {
                    setBikeModel(bike)
                    setStep('role')
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    bikeModel === bike
                      ? 'border-lime-400 bg-lime-400/10 text-lime-100'
                      : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-600'
                  }`}
                >
                  {bike}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Role Selection */}
        {step === 'role' && (
          <div>
            <h2 className="text-2xl font-bold text-zinc-100 mb-6">What's your role?</h2>
            <div className="space-y-3">
              {roles.map((r) => {
                const Icon = r.icon
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setRole(r.id)
                      setStep('complete')
                    }}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      role === r.id
                        ? 'border-lime-400 bg-lime-400/10'
                        : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${role === r.id ? 'text-lime-400' : 'text-zinc-500'}`} />
                      <div>
                        <p className={`font-bold ${role === r.id ? 'text-lime-100' : 'text-zinc-100'}`}>
                          {r.label}
                        </p>
                        <p className="text-xs text-zinc-400">{r.desc}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Complete */}
        {step === 'complete' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-lime-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ChevronRight className="h-8 w-8 text-lime-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 mb-3">All set!</h2>
            <p className="text-zinc-400 mb-2">Bike: {bikeModel}</p>
            <p className="text-zinc-400 mb-8">Role: {role}</p>
            <Button className="w-full bg-lime-500 hover:bg-lime-600 text-black font-bold">
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
