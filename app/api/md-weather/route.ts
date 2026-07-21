import { NextRequest, NextResponse } from 'next/server'
import { getTrackWeather, geocodeTrack, cToF } from '@/lib/md-weather'
import { getSessionTeamId } from '@/lib/md-auth'

/**
 * GET /api/md-weather?track=Pala+Raceway
 * Returns current conditions in imperial units for the setup sheet weather auto-fill.
 */
export async function GET(req: NextRequest) {
  const authResult = await getSessionTeamId()
  if (!authResult.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const trackQuery = searchParams.get('track')?.trim()
  if (!trackQuery) return NextResponse.json({ error: 'track param required' }, { status: 400 })

  const geo = await geocodeTrack(trackQuery)
  if (!geo) return NextResponse.json({ error: 'Location not found' }, { status: 404 })

  const forecast = await getTrackWeather(geo.lat, geo.lng)
  if (!forecast) return NextResponse.json({ error: 'Weather unavailable' }, { status: 503 })

  const c = forecast.current
  return NextResponse.json({
    tempF: cToF(c.temp_c),
    humidityPct: c.humidity,
    windMph: Math.round(c.wind_kph * 0.621371),
    description: c.condition,
    trackConditions: forecast.track_conditions,
    resolvedLocation: `${geo.name}${geo.admin1 ? `, ${geo.admin1}` : ''}`,
  })
}
