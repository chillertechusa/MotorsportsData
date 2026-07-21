// ─── Official Series Results Deep-Links ─────────────────────────────────────────
// There is no public XML/JSON feed for most motorsport series (MXGP publishes
// PDFs only, and we don't scrape). Instead we generate honest, zero-maintenance
// deep-links to each series' OFFICIAL results + standings pages so a rider can
// jump straight to the source. Matching is done on the free-text `series` field
// the rider types when adding a race event.

export interface SeriesLinks {
  /** Canonical display label for the matched series. */
  label: string
  /** Governing body / promoter name. */
  org: string
  /** Deep-link to the official event results / results hub. */
  resultsUrl: string
  /** Deep-link to the official championship standings/points. */
  standingsUrl: string
}

interface SeriesDef {
  label: string
  org: string
  resultsUrl: string
  standingsUrl: string
  /** Lowercased substrings that indicate this series. */
  match: string[]
}

// Ordered most-specific → most-general so "wsx" beats "sx" and "ama supercross"
// beats "ama". Greedy substrings (like "sx") must come AFTER narrower matches.
const SERIES: SeriesDef[] = [
  {
    label: 'MXGP World Championship',
    org: 'FIM / Infront Moto Racing',
    resultsUrl: 'https://www.mxgp.com/results',
    standingsUrl: 'https://www.mxgp.com/standings',
    match: ['mxgp', 'mx2', 'fim motocross', 'motocross world', 'mxgp world'],
  },
  {
    label: 'WSX World Supercross',
    org: 'SX Global',
    resultsUrl: 'https://www.wsxchampionship.com/results/',
    standingsUrl: 'https://www.wsxchampionship.com/standings/',
    match: ['wsx', 'world supercross'],
  },
  {
    label: 'AMA Supercross (SMX)',
    org: 'Feld Motor Sports / SMX',
    resultsUrl: 'https://www.supercrosslive.com/results',
    standingsUrl: 'https://www.supermotocross.com/standings/',
    match: ['supercross', 'sx', 'smx', 'monster energy sx'],
  },
  {
    label: 'AMA Pro Motocross',
    org: 'MX Sports Pro Racing',
    resultsUrl: 'https://www.promotocross.com/results',
    standingsUrl: 'https://www.promotocross.com/standings',
    match: ['pro motocross', 'ama pro mx', 'ama mx', 'promotocross', 'outdoor national', 'lucas oil pro'],
  },
  {
    label: 'AMA Amateur Motocross',
    org: 'MX Sports',
    resultsUrl: 'https://www.mxsports.com/results',
    standingsUrl: 'https://www.mxsports.com/',
    match: ['loretta', 'amateur national', 'ama amateur', 'mx sports'],
  },
  {
    label: 'GNCC Racing',
    org: 'Racer Productions',
    resultsUrl: 'https://www.gnccracing.com/results',
    standingsUrl: 'https://www.gnccracing.com/points',
    match: ['gncc', 'grand national cross country'],
  },
  {
    label: 'AMA Flat Track',
    org: 'AMA Pro Racing',
    resultsUrl: 'https://www.americanflattrack.com/results',
    standingsUrl: 'https://www.americanflattrack.com/standings',
    match: ['flat track', 'american flat track', 'aft'],
  },
]

/**
 * Resolve a free-text series name to its official results + standings links.
 * Returns null when the series isn't a recognized championship (rider can still
 * paste a manual results URL on the event).
 */
export function resolveSeriesLinks(series: string | null | undefined): SeriesLinks | null {
  if (!series) return null
  const q = series.trim().toLowerCase()
  if (!q) return null

  for (const def of SERIES) {
    if (def.match.some(m => q.includes(m))) {
      return {
        label: def.label,
        org: def.org,
        resultsUrl: def.resultsUrl,
        standingsUrl: def.standingsUrl,
      }
    }
  }
  return null
}

/** List of recognized series labels (for UI hints / autocomplete). */
export function knownSeriesLabels(): string[] {
  return SERIES.map(s => s.label)
}
