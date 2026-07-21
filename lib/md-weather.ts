/**
 * Open-Meteo weather + geocoding helpers for MD Platform.
 * Free, no API key required. Used for track weather on schedule events.
 */

export interface TrackForecast {
  current: {
    temp_c: number
    feels_like_c: number
    humidity: number
    wind_kph: number
    wind_dir: string
    condition: string
    uv_index: number
  }
  daily: Array<{
    date: string
    max_c: number
    min_c: number
    rain_chance: number
    condition: string
    wind_kph: number
  }>
  track_conditions: 'Ideal' | 'Good' | 'Fair' | 'Rough' | 'Wet'
}

export interface GeoResult {
  name: string
  lat: number
  lng: number
  admin1?: string
  country?: string
}

const WMO_CONDITIONS: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Icy fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
  80: 'Rain showers', 81: 'Heavy showers', 82: 'Violent showers',
  95: 'Thunderstorm', 96: 'Thunderstorm w/ hail', 99: 'Thunderstorm w/ hail',
}

const WIND_DIRS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW']

function windDir(deg: number): string {
  return WIND_DIRS[Math.round(deg / 22.5) % 16]
}

function trackConditions(rain: number, wind: number): TrackForecast['track_conditions'] {
  if (rain > 60) return 'Wet'
  if (rain > 30) return 'Rough'
  if (wind > 50) return 'Fair'
  if (rain > 10 || wind > 30) return 'Good'
  return 'Ideal'
}

export async function geocodeTrack(query: string): Promise<GeoResult | null> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
    const res = await fetch(url, { next: { revalidate: 86400 } })
    const data = await res.json()
    const r = data?.results?.[0]
    if (!r) return null
    return { name: r.name, lat: r.latitude, lng: r.longitude, admin1: r.admin1, country: r.country }
  } catch {
    return null
  }
}

export async function getTrackWeather(lat: number, lng: number): Promise<TrackForecast | null> {
  try {
    const url = [
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}`,
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,uv_index`,
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code,wind_speed_10m_max`,
      `&forecast_days=5&wind_speed_unit=kmh&timezone=auto`,
    ].join('')

    const res = await fetch(url, { next: { revalidate: 1800 } }) // 30-min cache
    const d = await res.json()
    if (!d.current) return null

    const c = d.current
    const dl = d.daily

    const daily = (dl.time as string[]).map((date: string, i: number) => ({
      date,
      max_c: Math.round(dl.temperature_2m_max[i]),
      min_c: Math.round(dl.temperature_2m_min[i]),
      rain_chance: dl.precipitation_probability_max[i] ?? 0,
      condition: WMO_CONDITIONS[dl.weather_code[i]] ?? 'Unknown',
      wind_kph: Math.round(dl.wind_speed_10m_max[i]),
    }))

    const todayRain = daily[0]?.rain_chance ?? 0
    const todayWind = Math.round(c.wind_speed_10m)

    return {
      current: {
        temp_c: Math.round(c.temperature_2m),
        feels_like_c: Math.round(c.apparent_temperature),
        humidity: c.relative_humidity_2m,
        wind_kph: todayWind,
        wind_dir: windDir(c.wind_direction_10m),
        condition: WMO_CONDITIONS[c.weather_code] ?? 'Unknown',
        uv_index: Math.round(c.uv_index ?? 0),
      },
      daily,
      track_conditions: trackConditions(todayRain, todayWind),
    }
  } catch {
    return null
  }
}

export function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32)
}
