/**
 * Demo data generator for new teams.
 * Creates realistic sample season data based on discipline.
 */

import type { Discipline } from '@/lib/use-discipline-language'

export interface DemoSeason {
  teamId: string
  discipline: Discipline
  events: DemoEvent[]
  expenses: DemoExpense[]
  workOrders: DemoWorkOrder[]
  setupSheets: DemoSetupSheet[]
}

export interface DemoEvent {
  id: string
  name: string
  date: Date
  location: string
  type: 'qualifying' | 'practice' | 'main'
  entries: number
  finished: number
  points: number
}

export interface DemoExpense {
  id: string
  category: string
  description: string
  amount: number
  date: Date
  vendor: string
}

export interface DemoWorkOrder {
  id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'completed'
  createdAt: Date
  completedAt?: Date
}

export interface DemoSetupSheet {
  id: string
  event: string
  bike: string
  frontSuspension: string
  rearSuspension: string
  gearing: string
  notes: string
  createdAt: Date
}

/**
 * Generate a complete demo season for a new team.
 */
export function generateDemoSeason(teamId: string, discipline: Discipline): DemoSeason {
  const now = new Date()
  
  // Discipline-specific event names and schedule
  const eventSchedules: Record<Discipline, Array<{ name: string; offset: number }>> = {
    mx_sx: [
      { name: 'Troy Lee Designs - Round 1', offset: 7 },
      { name: 'Feld Racing - Round 2', offset: 14 },
      { name: 'Fox Racing - Round 3', offset: 21 },
      { name: 'Pro Circuit - Round 4', offset: 28 },
      { name: 'Leatt - Round 5', offset: 35 },
    ],
    nascar: [
      { name: 'Daytona 500', offset: 7 },
      { name: 'Road America', offset: 21 },
      { name: 'Charlotte Motor Speedway', offset: 35 },
      { name: 'Bristol Motor Speedway', offset: 49 },
      { name: 'Las Vegas Motor Speedway', offset: 63 },
    ],
    karting: [
      { name: 'IKF Spring Classic', offset: 7 },
      { name: 'WKA Grand Nationals - Round 1', offset: 21 },
      { name: 'WKA Grand Nationals - Round 2', offset: 35 },
      { name: 'Rotax Max Challenge', offset: 49 },
    ],
    drag: [
      { name: 'NHRA Spring Nationals', offset: 7 },
      { name: 'Lucas Oil Nationals - Round 1', offset: 21 },
      { name: 'Lucas Oil Nationals - Round 2', offset: 35 },
      { name: 'Summer Nationals', offset: 49 },
    ],
    boats: [
      { name: 'Lake Havasu Heat', offset: 7 },
      { name: 'California Delta Run', offset: 21 },
      { name: 'San Diego Bay Dash', offset: 35 },
    ],
    offroad: [
      { name: 'SCORE Baja 1000', offset: 7 },
      { name: 'BITD Ultra4', offset: 21 },
      { name: 'King of the Hammers', offset: 35 },
    ],
    rally: [
      { name: 'Olympus Rally', offset: 7 },
      { name: 'Oregon Trail Rally', offset: 21 },
      { name: 'Cascade Range Rally', offset: 35 },
    ],
    other: [
      { name: 'Event 1', offset: 7 },
      { name: 'Event 2', offset: 21 },
      { name: 'Event 3', offset: 35 },
    ],
  }

  const schedule = eventSchedules[discipline] || eventSchedules.other

  const events: DemoEvent[] = schedule.map((event, i) => ({
    id: `demo-event-${i}`,
    name: event.name,
    date: new Date(now.getTime() + event.offset * 24 * 60 * 60 * 1000),
    location: ['Holding, CA', 'Las Vegas, NV', 'Phoenix, AZ', 'Reno, NV', 'San Diego, CA'][i % 5],
    type: i === 0 ? 'qualifying' : i === 1 ? 'practice' : 'main',
    entries: Math.floor(Math.random() * 40) + 20,
    finished: Math.floor(Math.random() * 15) + 5,
    points: Math.floor(Math.random() * 100) + 50,
  }))

  const expenses: DemoExpense[] = [
    { id: 'exp-1', category: 'Fuel', description: 'VP Racing fuel - 5 gallons', amount: 7500, date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), vendor: 'VP Fuels' },
    { id: 'exp-2', category: 'Parts', description: 'Fox Suspension springs', amount: 45000, date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), vendor: 'Fox Racing' },
    { id: 'exp-3', category: 'Maintenance', description: 'Engine rebuild', amount: 25000, date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), vendor: 'Precision Engine' },
    { id: 'exp-4', category: 'Registration', description: 'Event entry fees', amount: 35000, date: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000), vendor: 'Event Promoter' },
    { id: 'exp-5', category: 'Lodging', description: 'Hotel for races', amount: 28000, date: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000), vendor: 'Holiday Inn' },
  ]

  const workOrders: DemoWorkOrder[] = [
    { id: 'wo-1', title: 'Replace front brake pads', description: 'Worn brake pads - replace with OEM', status: 'completed', createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), completedAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000) },
    { id: 'wo-2', title: 'Check tire pressure', description: 'Verify all tire pressures before next race', status: 'in_progress', createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) },
    { id: 'wo-3', title: 'Chassis inspection', description: 'Annual safety inspection', status: 'open', createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
  ]

  const setupSheets: DemoSetupSheet[] = [
    { id: 'setup-1', event: 'Round 1 - Saturday', bike: '#24', frontSuspension: '48mm', rearSuspension: '38mm', gearing: '13/49', notes: 'Track was wet, reduced compression', createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
    { id: 'setup-2', event: 'Round 2 - Sunday', bike: '#24', frontSuspension: '49mm', rearSuspension: '39mm', gearing: '13/50', notes: 'Found better feel with stiffer setup', createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000) },
  ]

  return {
    teamId,
    discipline,
    events,
    expenses,
    workOrders,
    setupSheets,
  }
}

/**
 * Get a description of what demo data will be created.
 */
export function getDemoDataDescription(discipline: Discipline): string {
  const descriptions: Record<Discipline, string> = {
    mx_sx: 'Sample motocross season with 5 rounds, setup sheets, maintenance log, and typical expenses.',
    nascar: 'Sample NASCAR season with 5 races, pit crew schedules, fuel tracking, and race analysis.',
    karting: 'Sample karting season with WKA and IKF events, setup documentation, and equipment maintenance.',
    drag: 'Sample drag racing season with NHRA and Lucas Oil events, tune documentation, and fuel management.',
    boats: 'Sample boat racing season with lake and coastal events, fuel consumption, and mechanical logs.',
    offroad: 'Sample off-road season with SCORE and BITD events, terrain notes, and vehicle maintenance.',
    rally: 'Sample rally season with regional events, stage notes, pace notes, and service schedules.',
    other: 'Sample racing season with typical events, maintenance, and expense tracking.',
  }
  return descriptions[discipline] || descriptions.other
}
