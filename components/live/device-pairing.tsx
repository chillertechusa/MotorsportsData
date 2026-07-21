'use client'

import { useState } from 'react'
import { Copy, Trash2, Plus, CheckCircle, AlertCircle } from 'lucide-react'

interface Device {
  id: string
  name: string
  type: string
  status: 'connected' | 'disconnected' | 'pairing'
  lastConnected?: Date
  sessionToken?: string
}

interface DevicePairingProps {
  devices: Device[]
  onAddDevice?: () => void
  onRemoveDevice?: (deviceId: string) => void
}

export function DevicePairing({ devices, onAddDevice, onRemoveDevice }: DevicePairingProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (token: string, deviceId: string) => {
    navigator.clipboard.writeText(token)
    setCopied(deviceId)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Paired Devices</h3>
          <p className="text-xs text-slate-500">Connect telemetry devices for live data streaming</p>
        </div>
        {onAddDevice && (
          <button
            onClick={onAddDevice}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lime-500 hover:bg-lime-600 text-slate-900 font-bold transition"
          >
            <Plus className="h-4 w-4" />
            Add Device
          </button>
        )}
      </div>

      <div className="space-y-3">
        {devices.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No devices paired yet</p>
          </div>
        ) : (
          devices.map((device) => (
            <div
              key={device.id}
              className="flex items-center justify-between p-4 rounded-lg border border-slate-700 bg-slate-800/30"
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={`h-3 w-3 rounded-full ${
                    device.status === 'connected'
                      ? 'bg-lime-400 animate-pulse'
                      : device.status === 'pairing'
                        ? 'bg-blue-400 animate-pulse'
                        : 'bg-slate-600'
                  }`}
                />
                <div>
                  <p className="font-bold text-slate-100">{device.name}</p>
                  <p className="text-xs text-slate-500">
                    {device.type} • {device.status}
                    {device.lastConnected && (
                      <> • Last: {device.lastConnected.toLocaleTimeString()}</>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {device.sessionToken && (
                  <button
                    onClick={() => copyToClipboard(device.sessionToken!, device.id)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition"
                    title="Copy session token"
                  >
                    <Copy
                      className={`h-4 w-4 ${
                        copied === device.id ? 'text-lime-400' : 'text-slate-400'
                      }`}
                    />
                  </button>
                )}
                {onRemoveDevice && (
                  <button
                    onClick={() => onRemoveDevice(device.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition"
                    title="Remove device"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
