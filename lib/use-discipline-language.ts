/**
 * Discipline-aware language mapping for the platform.
 * One codebase, multiple motorsport vocabularies.
 */

export type Discipline = 'mx_sx' | 'nascar' | 'karting' | 'drag' | 'boats' | 'offroad' | 'rally' | 'other'

export interface DisciplineLanguage {
  // Vehicle term
  vehicle: string
  vehiclePlural: string
  
  // Driver/athlete term
  athlete: string
  athletePlural: string
  
  // Competition setting
  venue: string
  venuePlural: string
  
  // Setup/configuration
  setup: string
  
  // Team role terms (often culture-specific)
  crew: string
  
  // Event/race term
  event: string
  eventPlural: string
  
  // Speed/performance measurement
  lapTerm: string
  
  // Physical location
  pitArea: string
  
  // Season/series term
  season: string
  
  // Informal/marketing name
  displayName: string
  
  // Icon color preference (hex)
  accentColor: string
}

const DISCIPLINE_MAP: Record<Discipline, DisciplineLanguage> = {
  mx_sx: {
    vehicle: 'bike',
    vehiclePlural: 'bikes',
    athlete: 'rider',
    athletePlural: 'riders',
    venue: 'track',
    venuePlural: 'tracks',
    setup: 'setup',
    crew: 'pit crew',
    event: 'race',
    eventPlural: 'races',
    lapTerm: 'lap',
    pitArea: 'pit',
    season: 'season',
    displayName: 'Motocross / Supercross',
    accentColor: '#a3e635', // lime
  },
  nascar: {
    vehicle: 'car',
    vehiclePlural: 'cars',
    athlete: 'driver',
    athletePlural: 'drivers',
    venue: 'track',
    venuePlural: 'tracks',
    setup: 'setup',
    crew: 'pit crew',
    event: 'race',
    eventPlural: 'races',
    lapTerm: 'lap',
    pitArea: 'pit',
    season: 'season',
    displayName: 'NASCAR',
    accentColor: '#ef4444', // red
  },
  karting: {
    vehicle: 'kart',
    vehiclePlural: 'karts',
    athlete: 'driver',
    athletePlural: 'drivers',
    venue: 'track',
    venuePlural: 'tracks',
    setup: 'setup',
    crew: 'team',
    event: 'race',
    eventPlural: 'races',
    lapTerm: 'lap',
    pitArea: 'pit',
    season: 'season',
    displayName: 'Karting',
    accentColor: '#f59e0b', // amber
  },
  drag: {
    vehicle: 'car',
    vehiclePlural: 'cars',
    athlete: 'driver',
    athletePlural: 'drivers',
    venue: 'track',
    venuePlural: 'tracks',
    setup: 'tune',
    crew: 'team',
    event: 'race',
    eventPlural: 'races',
    lapTerm: 'run',
    pitArea: 'staging area',
    season: 'season',
    displayName: 'Drag Racing',
    accentColor: '#ec4899', // pink
  },
  boats: {
    vehicle: 'boat',
    vehiclePlural: 'boats',
    athlete: 'driver',
    athletePlural: 'drivers',
    venue: 'course',
    venuePlural: 'courses',
    setup: 'setup',
    crew: 'crew',
    event: 'race',
    eventPlural: 'races',
    lapTerm: 'lap',
    pitArea: 'pit',
    season: 'season',
    displayName: 'Boat Racing',
    accentColor: '#3b82f6', // blue
  },
  offroad: {
    vehicle: 'vehicle',
    vehiclePlural: 'vehicles',
    athlete: 'driver',
    athletePlural: 'drivers',
    venue: 'course',
    venuePlural: 'courses',
    setup: 'setup',
    crew: 'team',
    event: 'event',
    eventPlural: 'events',
    lapTerm: 'stage',
    pitArea: 'base',
    season: 'season',
    displayName: 'Off-Road Racing',
    accentColor: '#8b5cf6', // purple
  },
  rally: {
    vehicle: 'car',
    vehiclePlural: 'cars',
    athlete: 'driver',
    athletePlural: 'drivers',
    venue: 'stage',
    venuePlural: 'stages',
    setup: 'setup',
    crew: 'navigator & crew',
    event: 'rally',
    eventPlural: 'rallies',
    lapTerm: 'stage',
    pitArea: 'service area',
    season: 'season',
    displayName: 'Rally',
    accentColor: '#06b6d4', // cyan
  },
  other: {
    vehicle: 'vehicle',
    vehiclePlural: 'vehicles',
    athlete: 'athlete',
    athletePlural: 'athletes',
    venue: 'venue',
    venuePlural: 'venues',
    setup: 'setup',
    crew: 'team',
    event: 'event',
    eventPlural: 'events',
    lapTerm: 'session',
    pitArea: 'area',
    season: 'season',
    displayName: 'Other',
    accentColor: '#6b7280', // gray
  },
}

/**
 * Get language mapping for a discipline.
 * Falls back to 'other' if discipline not recognized.
 */
export function getDiscplineLanguage(discipline?: string | null): DisciplineLanguage {
  if (!discipline || !(discipline in DISCIPLINE_MAP)) {
    return DISCIPLINE_MAP.other
  }
  return DISCIPLINE_MAP[discipline as Discipline]
}

/**
 * React hook for accessing discipline language throughout the app.
 * Usage: const lang = useDiscplineLanguage(userDiscipline)
 * Then: `lang.vehicle`, `lang.athlete`, etc.
 */
export function useDiscplineLanguage(discipline?: string | null): DisciplineLanguage {
  return getDiscplineLanguage(discipline)
}

/**
 * Get all available disciplines for a discipline picker dropdown.
 */
export function getAvailableDisciplines(): Array<{ id: Discipline; label: string; color: string }> {
  return Object.entries(DISCIPLINE_MAP).map(([id, lang]) => ({
    id: id as Discipline,
    label: lang.displayName,
    color: lang.accentColor,
  }))
}
