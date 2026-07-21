'use client'

import { useState } from 'react'
import {
  Watch,
  Heart,
  Zap,
  Plus,
  Trash2,
  Link2,
  Link2Off,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader,
} from 'lucide-react'

interface PairedDevice {
  id: string
  provider: 'garmin' | 'polar' | 'apple_watch' | 'wahoo' | 'strava'
  deviceName: string
  email?: string
  linkedAt: Date
  lastSyncedAt?: Date
  syncStatus: 'active' | 'failed' | 'expired'
  autoSync: boolean
  syncInterval: number
}

const DEVICE_ICONS = {
  garmin: <Zap className="h-5 w-5 text-orange-500" />,
  polar: <Heart className="h-5 w-5 text-red-500" />,
  apple_watch: <Watch className="h-5 w-5 text-gray-500" />,
  wahoo: <Zap className="h-5 w-5 text-blue-500" />,
  strava: <Zap className="h-5 w-5 text-orange-600" />,
}

const DEVICE_COLORS = {
  garmin: 'bg-orange-500/10 border-orange-500/30',
  polar: 'bg-red-500/10 border-red-500/30',
  apple_watch: 'bg-gray-500/10 border-gray-500/30',
  wahoo: 'bg-blue-500/10 border-blue-500/30',
  strava: 'bg-orange-600/10 border-orange-600/30',
}

const SAMPLE_DEVICES: PairedDevice[] = [
  {
    id: '1',
    provider: 'garmin',
    deviceName: 'Garmin Edge 1540',
    email: 'john@example.com',
    linkedAt: new Date('2026-07-01'),
    lastSyncedAt: new Date('2026-07-10T14:32:00'),
    syncStatus: 'active',
    autoSync: true,
    syncInterval: 15,
  },
  {
    id: '2',
    provider: 'polar',
    deviceName: 'Polar H10',
    email: 'john@example.com',
    linkedAt: new Date('2026-06-15'),
    lastSyncedAt: new Date('2026-07-10T09:45:00'),
    syncStatus: 'active',
    autoSync: true,
    syncInterval: 60,
  },
]

export function DevicePairingUI() {
  const [devices, setDevices] = useState<PairedDevice[]>(SAMPLE_DEVICES)
  const [showPairingModal, setShowPairingModal] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [pairing, setPairing] = useState(false)

  const handlePairDevice = async (provider: string) => {
    setSelectedProvider(provider)
    setPairing(true)

    try {
      // Request Terra widget session from backend
      const res = await fetch('/api/md-devices/widget-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        console.error('[device-pairing] widget session failed:', await res.text())
        return
      }

      const data = await res.json()
      if (data.url) {
        // Redirect to Terra widget (opens in same tab or new window depending on provider)
        window.location.href = data.url
      }
    } catch (err) {
      console.error('[device-pairing] error:', err)
    } finally {
      setPairing(false)
    }
  }

  const handleUnpairDevice = (deviceId: string) => {
    setDevices(devices.filter((d) => d.id !== deviceId))
    console.log(`[v0] Device unpaired: ${deviceId}`)
  }

  const handleToggleAutoSync = (deviceId: string) => {
    setDevices(
      devices.map((d) =>
        d.id === deviceId ? { ...d, autoSync: !d.autoSync } : d
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black uppercase tracking-wide text-zinc-50 flex items-center gap-3">
          <Link2 className="h-6 w-6 text-lime-500" />
          Wearable Devices
        </h2>
        <p className="text-sm text-zinc-400 mt-2">
          Connect fitness trackers, heart rate monitors, and cycling computers. Telemetry syncs automatically to your
          training log.
        </p>
      </div>

      {/* Paired Devices */}
      {devices.length > 0 && (
        <div className="border border-zinc-800 bg-zinc-900 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-zinc-800">
            <h3 className="font-bold text-zinc-50">Linked Devices ({devices.length})</h3>
          </div>

          <div className="divide-y divide-zinc-800">
            {devices.map((device) => (
              <div key={device.id} className="p-6 hover:bg-zinc-800/50 transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`p-2 rounded border ${DEVICE_COLORS[device.provider]}`}
                    >
                      {DEVICE_ICONS[device.provider]}
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-50">{device.deviceName}</h4>
                      {device.email && (
                        <p className="text-xs text-zinc-400 mt-1">
                          {device.provider.toUpperCase()} • {device.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnpairDevice(device.id)}
                    className="p-2 hover:bg-red-900/30 rounded transition"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>

                {/* Status & Sync Info */}
                <div className="grid md:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-xs">
                    {device.syncStatus === 'active' ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-zinc-400">Connected & syncing</span>
                      </>
                    ) : device.syncStatus === 'failed' ? (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-zinc-400">Sync failed</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <span className="text-zinc-400">Token expired</span>
                      </>
                    )}
                  </div>

                  {device.lastSyncedAt && (
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-4 w-4 text-zinc-500" />
                      <span className="text-zinc-400">
                        Last sync: {new Date(device.lastSyncedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Auto-Sync Toggle */}
                <div className="bg-zinc-800/30 border border-zinc-700 rounded p-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={device.autoSync}
                      onChange={() => handleToggleAutoSync(device.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-bold text-zinc-300">
                      Auto-sync every {device.syncInterval} minutes
                    </span>
                  </label>
                  <p className="text-xs text-zinc-500 mt-2 ml-7">
                    When enabled, new sessions automatically fetch data from {device.deviceName}.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Device */}
      <div className="border border-zinc-800 bg-zinc-900 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-zinc-50">Add New Device</h3>
          {showPairingModal && (
            <button
              onClick={() => {
                setShowPairingModal(false)
                setSelectedProvider(null)
              }}
              className="text-xs text-zinc-500 hover:text-zinc-400"
            >
              Cancel
            </button>
          )}
        </div>

        {!showPairingModal ? (
          <button
            onClick={() => setShowPairingModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-zinc-700 rounded font-bold text-zinc-300 hover:border-lime-500 transition"
          >
            <Plus className="h-4 w-4" />
            Link Device
          </button>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {['garmin', 'polar', 'apple_watch', 'wahoo', 'strava'].map((provider) => (
              <button
                key={provider}
                onClick={() => handlePairDevice(provider)}
                disabled={pairing}
                className={`p-4 border rounded-lg transition text-left ${
                  pairing
                    ? 'border-zinc-700 bg-zinc-800/50 cursor-wait'
                    : 'border-zinc-700 hover:border-lime-500 hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {DEVICE_ICONS[provider as keyof typeof DEVICE_ICONS]}
                  <span className="font-bold text-zinc-50 capitalize">{provider.replace('_', ' ')}</span>
                </div>
                <p className="text-xs text-zinc-400">
                  {provider === 'garmin' && 'GPS cycling computers & watches'}
                  {provider === 'polar' && 'Heart rate monitors & sports watches'}
                  {provider === 'apple_watch' && 'Apple Watch fitness data'}
                  {provider === 'wahoo' && 'Wahoo trainers & devices'}
                  {provider === 'strava' && 'Strava activities & segments'}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="border border-lime-500/30 bg-lime-500/5 rounded-lg p-4 space-y-3">
        <p className="text-sm text-zinc-300">
          <strong>Secure Connection:</strong> All device credentials are encrypted AES-256. We never store your
          passwords.
        </p>
        <p className="text-sm text-zinc-300">
          <strong>Auto-Sync:</strong> New data is fetched automatically on your schedule. Disable auto-sync for manual
          uploads only.
        </p>
        <p className="text-sm text-zinc-300">
          <strong>Privacy:</strong> Only you and your riders can see this data. Coaches cannot access your personal
          fitness accounts.
        </p>
      </div>
    </div>
  )
}
