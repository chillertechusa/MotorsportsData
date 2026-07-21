export type PartStatus = 'good' | 'warn' | 'replace'

export interface Vehicle {
  id: string
  number: string
  model: string
  rider: string
  engineHours: number
  nextService: number
  status: 'ready' | 'attention' | 'service'
}

export interface Part {
  id: string
  name: string
  vehicle: string
  currentHours: number
  maxHours: number
}

export interface Alert {
  id: string
  vehicle: string
  message: string
  current: number
  max: number
}

export const track = {
  name: 'Washougal MX Park',
  status: 'Practice — Session 2',
  ambientTemp: 84,
  trackTemp: 121,
  humidity: 38,
  altitude: 312,
  condition: 'Hard Pack / Dusty',
  wind: '6 mph NW',
}

export const vehicles: Vehicle[] = [
  { id: 'v1', number: '01', model: 'YZ450F', rider: 'C. Reed', engineHours: 12.5, nextService: 15, status: 'attention' },
  { id: 'v2', number: '24', model: 'YZ250F', rider: 'J. Martin', engineHours: 6.0, nextService: 15, status: 'ready' },
  { id: 'v3', number: '51', model: 'CRF450R', rider: 'A. Cianciarulo', engineHours: 14.2, nextService: 15, status: 'service' },
  { id: 'v4', number: '94', model: 'KX450', rider: 'K. Roczen', engineHours: 3.5, nextService: 15, status: 'ready' },
]

export const parts: Part[] = [
  { id: 'p1', name: 'Clutch Pack', vehicle: '#01 YZ450F', currentHours: 14, maxHours: 15 },
  { id: 'p2', name: 'Piston & Rings', vehicle: '#51 CRF450R', currentHours: 14.2, maxHours: 15 },
  { id: 'p3', name: 'Top End Gasket Set', vehicle: '#01 YZ450F', currentHours: 12.5, maxHours: 20 },
  { id: 'p4', name: 'Fork Seals', vehicle: '#24 YZ250F', currentHours: 6, maxHours: 25 },
  { id: 'p5', name: 'Chain & Sprockets', vehicle: '#94 KX450', currentHours: 3.5, maxHours: 30 },
  { id: 'p6', name: 'Air Filter', vehicle: '#51 CRF450R', currentHours: 5, maxHours: 5 },
  { id: 'p7', name: 'Brake Pads (F)', vehicle: '#24 YZ250F', currentHours: 9, maxHours: 12 },
  { id: 'p8', name: 'Rear Shock Service', vehicle: '#94 KX450', currentHours: 8, maxHours: 30 },
]

export function partStatus(current: number, max: number): PartStatus {
  const ratio = current / max
  if (ratio >= 0.95) return 'replace'
  if (ratio >= 0.75) return 'warn'
  return 'good'
}

export const alerts: Alert[] = parts
  .filter((p) => partStatus(p.currentHours, p.maxHours) !== 'good')
  .map((p) => ({
    id: p.id,
    vehicle: p.vehicle,
    message: p.name,
    current: p.currentHours,
    max: p.maxHours,
  }))
