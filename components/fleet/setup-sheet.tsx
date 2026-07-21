'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SetupParameter {
  parameterKey: string
  parameterValue: string | number
}

interface SetupSheetProps {
  sessionId: string
  onSubmit?: (data: any) => void
}

export function SetupSheet({ sessionId, onSubmit }: SetupSheetProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [parameters, setParameters] = useState<Record<string, string | number>>({
    // Suspension
    forkCompression: '12',
    forkRebound: '10',
    rearCompression: '9',
    rearRebound: '11',
    
    // Gearing
    frontSprocket: '14',
    rearSprocket: '51',
    
    // Jetting
    mainJet: '175',
    needlePosition: '3',
    pilotJet: '40',
    airScrew: '1.5',
    
    // Geometry
    sag: '105mm',
    rideHeight: 'stock',
    leverRatio: 'custom',
  })

  const handleChange = (key: string, value: string | number) => {
    setParameters(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const setupLogs = Object.entries(parameters).map(([key, value]) => ({
        sessionId,
        parameterKey: key,
        parameterValue: String(value),
      }))

      const response = await fetch('/api/setup-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setupLogs }),
      })

      if (!response.ok) throw new Error('Failed to save setup')
      
      const data = await response.json()
      onSubmit?.(data)
    } catch (error) {
      console.error('[v0] Setup sheet error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="suspension" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-zinc-900 border-zinc-800">
          <TabsTrigger value="suspension" className="data-[state=active]:text-primary">Suspension</TabsTrigger>
          <TabsTrigger value="gearing" className="data-[state=active]:text-primary">Gearing</TabsTrigger>
          <TabsTrigger value="jetting" className="data-[state=active]:text-primary">Jetting</TabsTrigger>
          <TabsTrigger value="geometry" className="data-[state=active]:text-primary">Geometry</TabsTrigger>
        </TabsList>

        {/* Suspension Tab */}
        <TabsContent value="suspension" className="space-y-4">
          <Card className="border-zinc-800">
            <CardHeader>
              <CardTitle className="text-primary">Suspension Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="forkComp">Fork Compression (clicks)</Label>
                  <Input
                    id="forkComp"
                    type="number"
                    value={parameters.forkCompression}
                    onChange={(e) => handleChange('forkCompression', e.target.value)}
                    className="border-zinc-800 bg-zinc-900"
                  />
                </div>
                <div>
                  <Label htmlFor="forkReb">Fork Rebound (clicks)</Label>
                  <Input
                    id="forkReb"
                    type="number"
                    value={parameters.forkRebound}
                    onChange={(e) => handleChange('forkRebound', e.target.value)}
                    className="border-zinc-800 bg-zinc-900"
                  />
                </div>
                <div>
                  <Label htmlFor="rearComp">Rear Compression (clicks)</Label>
                  <Input
                    id="rearComp"
                    type="number"
                    value={parameters.rearCompression}
                    onChange={(e) => handleChange('rearCompression', e.target.value)}
                    className="border-zinc-800 bg-zinc-900"
                  />
                </div>
                <div>
                  <Label htmlFor="rearReb">Rear Rebound (clicks)</Label>
                  <Input
                    id="rearReb"
                    type="number"
                    value={parameters.rearRebound}
                    onChange={(e) => handleChange('rearRebound', e.target.value)}
                    className="border-zinc-800 bg-zinc-900"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gearing Tab */}
        <TabsContent value="gearing" className="space-y-4">
          <Card className="border-zinc-800">
            <CardHeader>
              <CardTitle className="text-primary">Gearing Ratios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frontSprocket">Front Sprocket (T)</Label>
                  <Input
                    id="frontSprocket"
                    type="number"
                    value={parameters.frontSprocket}
                    onChange={(e) => handleChange('frontSprocket', e.target.value)}
                    className="border-zinc-800 bg-zinc-900"
                  />
                </div>
                <div>
                  <Label htmlFor="rearSprocket">Rear Sprocket (T)</Label>
                  <Input
                    id="rearSprocket"
                    type="number"
                    value={parameters.rearSprocket}
                    onChange={(e) => handleChange('rearSprocket', e.target.value)}
                    className="border-zinc-800 bg-zinc-900"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jetting Tab */}
        <TabsContent value="jetting" className="space-y-4">
          <Card className="border-zinc-800">
            <CardHeader>
              <CardTitle className="text-primary">Jetting Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mainJet">Main Jet</Label>
                  <Input
                    id="mainJet"
                    type="number"
                    value={parameters.mainJet}
                    onChange={(e) => handleChange('mainJet', e.target.value)}
                    className="border-zinc-800 bg-zinc-900"
                  />
                </div>
                <div>
                  <Label htmlFor="pilotJet">Pilot Jet</Label>
                  <Input
                    id="pilotJet"
                    type="number"
                    value={parameters.pilotJet}
                    onChange={(e) => handleChange('pilotJet', e.target.value)}
                    className="border-zinc-800 bg-zinc-900"
                  />
                </div>
                <div>
                  <Label htmlFor="needlePos">Needle Position (groove)</Label>
                  <Input
                    id="needlePos"
                    type="number"
                    value={parameters.needlePosition}
                    onChange={(e) => handleChange('needlePosition', e.target.value)}
                    className="border-zinc-800 bg-zinc-900"
                  />
                </div>
                <div>
                  <Label htmlFor="airScrew">Air Screw (turns)</Label>
                  <Input
                    id="airScrew"
                    type="number"
                    step="0.25"
                    value={parameters.airScrew}
                    onChange={(e) => handleChange('airScrew', e.target.value)}
                    className="border-zinc-800 bg-zinc-900"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geometry Tab */}
        <TabsContent value="geometry" className="space-y-4">
          <Card className="border-zinc-800">
            <CardHeader>
              <CardTitle className="text-primary">Bike Geometry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sag">Sag (mm)</Label>
                  <Input
                    id="sag"
                    value={parameters.sag}
                    onChange={(e) => handleChange('sag', e.target.value)}
                    className="border-zinc-800 bg-zinc-900"
                  />
                </div>
                <div>
                  <Label htmlFor="rideHeight">Ride Height</Label>
                  <Input
                    id="rideHeight"
                    value={parameters.rideHeight}
                    onChange={(e) => handleChange('rideHeight', e.target.value)}
                    className="border-zinc-800 bg-zinc-900"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isLoading ? 'Saving Setup...' : 'Save Setup Sheet'}
      </Button>
    </form>
  )
}
