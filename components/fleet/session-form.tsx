'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SessionFormProps {
  vehicleId?: string
  vehicles?: Array<{ id: string; name: string }>
  onSubmit?: (data: any) => void
}

export function SessionForm({ vehicleId, vehicles = [], onSubmit }: SessionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    vehicleId: vehicleId || '',
    trackName: '',
    trackConditions: 'dry',
    bestLapSeconds: '',
    sessionHours: '',
    riderFeedback: '',
    ambientTempF: '',
    humidityPct: '',
    windMph: '',
    trackSurface: 'dirt',
    tireFront: '',
    tireRear: '',
    tirePressureFront: '',
    tirePressureRear: '',
    fuelMix: '',
    jetNeedle: '',
    airFilterCondition: 'clean',
    engineMap: '0',
  })

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: String(value) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to create session')
      
      const data = await response.json()
      onSubmit?.(data)
      setFormData({ ...formData, trackName: '', bestLapSeconds: '', sessionHours: '', riderFeedback: '' })
    } catch (error) {
      console.error('[v0] Session form error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vehicle Selection */}
        <div>
          <Label htmlFor="vehicleId">Bike</Label>
          <Select value={formData.vehicleId ?? ""} onValueChange={(v) => handleChange('vehicleId', v)}>
            <SelectTrigger id="vehicleId" className="border-zinc-800">
              <SelectValue placeholder="Select a bike" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map(v => (
                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Track Name */}
        <div>
          <Label htmlFor="trackName">Track Name</Label>
          <Input
            id="trackName"
            placeholder="e.g., Pala Raceway, Glen Helen"
            value={formData.trackName}
            onChange={(e) => handleChange('trackName', e.target.value)}
            className="border-zinc-800 bg-zinc-900"
          />
        </div>

        {/* Session Hours */}
        <div>
          <Label htmlFor="sessionHours">Session Hours</Label>
          <Input
            id="sessionHours"
            type="number"
            step="0.5"
            placeholder="2.5"
            value={formData.sessionHours}
            onChange={(e) => handleChange('sessionHours', parseFloat(e.target.value))}
            className="border-zinc-800 bg-zinc-900"
          />
        </div>

        {/* Best Lap Time */}
        <div>
          <Label htmlFor="bestLapSeconds">Best Lap (seconds)</Label>
          <Input
            id="bestLapSeconds"
            type="number"
            step="0.01"
            placeholder="95.45"
            value={formData.bestLapSeconds}
            onChange={(e) => handleChange('bestLapSeconds', parseFloat(e.target.value))}
            className="border-zinc-800 bg-zinc-900"
          />
        </div>

        {/* Track Conditions */}
        <div>
          <Label htmlFor="trackConditions">Track Conditions</Label>
          <Select value={formData.trackConditions ?? ""} onValueChange={(v) => handleChange('trackConditions', v)}>
            <SelectTrigger id="trackConditions" className="border-zinc-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dry">Dry</SelectItem>
              <SelectItem value="wet">Wet</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
              <SelectItem value="dusty">Dusty</SelectItem>
              <SelectItem value="muddy">Muddy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Track Surface */}
        <div>
          <Label htmlFor="trackSurface">Surface Type</Label>
          <Select value={formData.trackSurface ?? ""} onValueChange={(v) => handleChange('trackSurface', v)}>
            <SelectTrigger id="trackSurface" className="border-zinc-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dirt">Dirt</SelectItem>
              <SelectItem value="sand">Sand</SelectItem>
              <SelectItem value="clay">Clay</SelectItem>
              <SelectItem value="loam">Loam</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ambient Temp */}
        <div>
          <Label htmlFor="ambientTempF">Ambient Temp (°F)</Label>
          <Input
            id="ambientTempF"
            type="number"
            placeholder="78"
            value={formData.ambientTempF}
            onChange={(e) => handleChange('ambientTempF', parseInt(e.target.value))}
            className="border-zinc-800 bg-zinc-900"
          />
        </div>

        {/* Humidity */}
        <div>
          <Label htmlFor="humidityPct">Humidity (%)</Label>
          <Input
            id="humidityPct"
            type="number"
            min="0"
            max="100"
            placeholder="65"
            value={formData.humidityPct}
            onChange={(e) => handleChange('humidityPct', parseInt(e.target.value))}
            className="border-zinc-800 bg-zinc-900"
          />
        </div>

        {/* Wind */}
        <div>
          <Label htmlFor="windMph">Wind (mph)</Label>
          <Input
            id="windMph"
            type="number"
            placeholder="5"
            value={formData.windMph}
            onChange={(e) => handleChange('windMph', parseInt(e.target.value))}
            className="border-zinc-800 bg-zinc-900"
          />
        </div>

        {/* Tire Front */}
        <div>
          <Label htmlFor="tireFront">Tire Front</Label>
          <Input
            id="tireFront"
            placeholder="Dunlop Geomax MX3S"
            value={formData.tireFront}
            onChange={(e) => handleChange('tireFront', e.target.value)}
            className="border-zinc-800 bg-zinc-900"
          />
        </div>

        {/* Tire Rear */}
        <div>
          <Label htmlFor="tireRear">Tire Rear</Label>
          <Input
            id="tireRear"
            placeholder="Dunlop Geomax MX3S"
            value={formData.tireRear}
            onChange={(e) => handleChange('tireRear', e.target.value)}
            className="border-zinc-800 bg-zinc-900"
          />
        </div>

        {/* PSI Front */}
        <div>
          <Label htmlFor="tirePressureFront">PSI Front</Label>
          <Input
            id="tirePressureFront"
            type="number"
            step="0.1"
            placeholder="12.5"
            value={formData.tirePressureFront}
            onChange={(e) => handleChange('tirePressureFront', parseFloat(e.target.value))}
            className="border-zinc-800 bg-zinc-900"
          />
        </div>

        {/* PSI Rear */}
        <div>
          <Label htmlFor="tirePressureRear">PSI Rear</Label>
          <Input
            id="tirePressureRear"
            type="number"
            step="0.1"
            placeholder="13.2"
            value={formData.tirePressureRear}
            onChange={(e) => handleChange('tirePressureRear', parseFloat(e.target.value))}
            className="border-zinc-800 bg-zinc-900"
          />
        </div>

        {/* Fuel Mix */}
        <div>
          <Label htmlFor="fuelMix">Fuel Mix Ratio</Label>
          <Input
            id="fuelMix"
            placeholder="32:1"
            value={formData.fuelMix}
            onChange={(e) => handleChange('fuelMix', e.target.value)}
            className="border-zinc-800 bg-zinc-900"
          />
        </div>

        {/* Jet Needle */}
        <div>
          <Label htmlFor="jetNeedle">Jet Needle Position</Label>
          <Input
            id="jetNeedle"
            placeholder="3rd groove"
            value={formData.jetNeedle}
            onChange={(e) => handleChange('jetNeedle', e.target.value)}
            className="border-zinc-800 bg-zinc-900"
          />
        </div>

        {/* Air Filter */}
        <div>
          <Label htmlFor="airFilterCondition">Air Filter Condition</Label>
          <Select value={formData.airFilterCondition ?? ""} onValueChange={(v) => handleChange('airFilterCondition', v)}>
            <SelectTrigger id="airFilterCondition" className="border-zinc-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clean">Clean</SelectItem>
              <SelectItem value="light-dust">Light Dust</SelectItem>
              <SelectItem value="heavy-dust">Heavy Dust</SelectItem>
              <SelectItem value="needs-cleaning">Needs Cleaning</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Engine Map */}
        <div>
          <Label htmlFor="engineMap">Engine Map</Label>
          <Select value={formData.engineMap ?? ""} onValueChange={(v) => handleChange('engineMap', v)}>
            <SelectTrigger id="engineMap" className="border-zinc-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Map 0 (Stock)</SelectItem>
              <SelectItem value="1">Map 1 (Sport)</SelectItem>
              <SelectItem value="2">Map 2 (Race)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Rider Feedback */}
      <div>
        <Label htmlFor="riderFeedback">Rider Feedback</Label>
        <Textarea
          id="riderFeedback"
          placeholder="How did the bike feel? Any adjustments needed?"
          value={formData.riderFeedback}
          onChange={(e) => handleChange('riderFeedback', e.target.value)}
          className="border-zinc-800 bg-zinc-900 min-h-[100px]"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading || !formData.vehicleId || !formData.trackName}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isLoading ? 'Logging Session...' : 'Log Session'}
      </Button>
    </form>
  )
}
