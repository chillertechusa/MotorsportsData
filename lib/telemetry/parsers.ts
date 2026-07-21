/**
 * Telemetry File Parsers
 * Converts device-specific file formats (CSV, XML, GPX, FIT, etc.) to normalized telemetry data.
 */

import { FileFormat, ParsedTelemetry } from './device-registry'

export async function parseFile(
  fileContent: string | ArrayBuffer,
  format: FileFormat
): Promise<ParsedTelemetry[]> {
  switch (format) {
    case 'CSV':
      return parseCSV(fileContent as string)
    case 'XML':
      return parseXML(fileContent as string)
    case 'GPX':
      return parseGPX(fileContent as string)
    case 'FIT':
      // FIT requires binary parsing — return empty for now, integrate Garmin FIT SDK later
      return []
    case 'TCX':
      return parseTCX(fileContent as string)
    case 'TXT':
      return parseTXT(fileContent as string)
    default:
      throw new Error(`Unsupported format: ${format}`)
  }
}

/**
 * Parse CSV — most common format across devices.
 * Handles variable column naming (MYLAPSTR2, RaceBox, Westhold, etc.)
 */
function parseCSV(content: string): ParsedTelemetry[] {
  const lines = content.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim())
  const results: ParsedTelemetry[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    const row: ParsedTelemetry = {}

    headers.forEach((header, idx) => {
      // Try to parse numeric values; keep strings otherwise
      const val = values[idx]
      row[header.toLowerCase()] = isNaN(Number(val)) ? val : Number(val)
    })

    if (Object.keys(row).length > 0) results.push(row)
  }

  return results
}

/**
 * Parse XML — used by MYLAPSTR2, some AiM devices.
 * Extracts all leaf nodes as key-value pairs.
 */
function parseXML(content: string): ParsedTelemetry[] {
  const results: ParsedTelemetry[] = []
  
  // Simple regex-based XML parsing (production: use xml2js library)
  const recordPattern = /<record>([\s\S]*?)<\/record>/g
  let match

  while ((match = recordPattern.exec(content)) !== null) {
    const record: ParsedTelemetry = {}
    const tagPattern = /<(\w+)>(.*?)<\/\1>/g
    let tagMatch

    while ((tagMatch = tagPattern.exec(match[1])) !== null) {
      const [, tag, value] = tagMatch
      record[tag.toLowerCase()] = isNaN(Number(value)) ? value : Number(value)
    }

    if (Object.keys(record).length > 0) results.push(record)
  }

  return results
}

/**
 * Parse GPX — GPS exchange format used by RaceBox, Anubesport, Garmin.
 * Extracts trackpoints with lat/lon/elevation/time.
 */
function parseGPX(content: string): ParsedTelemetry[] {
  const results: ParsedTelemetry[] = []

  const trkptPattern = /<trkpt lat="([^"]+)" lon="([^"]+)">([\s\S]*?)<\/trkpt>/g
  let match

  while ((match = trkptPattern.exec(content)) !== null) {
    const [, lat, lon, inner] = match
    const point: ParsedTelemetry = {
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
    }

    // Extract nested elements: time, ele, speed, etc.
    const eleMatch = /<ele>(.*?)<\/ele>/.exec(inner)
    if (eleMatch) point.elevation = parseFloat(eleMatch[1])

    const timeMatch = /<time>(.*?)<\/time>/.exec(inner)
    if (timeMatch) point.timestamp = timeMatch[1]

    const speedMatch = /<speed>(.*?)<\/speed>/.exec(inner)
    if (speedMatch) point.speed = parseFloat(speedMatch[1])

    results.push(point)
  }

  return results
}

/**
 * Parse TCX — Training Center XML used by Garmin devices.
 * Extracts trackpoints with HR, cadence, power.
 */
function parseTCX(content: string): ParsedTelemetry[] {
  const results: ParsedTelemetry[] = []

  const tpPattern = /<Trackpoint>([\s\S]*?)<\/Trackpoint>/g
  let match

  while ((match = tpPattern.exec(content)) !== null) {
    const [, inner] = match
    const tp: ParsedTelemetry = {}

    // Extract standard TCX fields
    const timeMatch = /<Time>(.*?)<\/Time>/.exec(inner)
    if (timeMatch) tp.timestamp = timeMatch[1]

    const hrMatch = /<HeartRateBpm><Value>(.*?)<\/Value>/.exec(inner)
    if (hrMatch) tp.heart_rate = parseInt(hrMatch[1], 10)

    const cadMatch = /<Cadence>(.*?)<\/Cadence>/.exec(inner)
    if (cadMatch) tp.cadence = parseInt(cadMatch[1], 10)

    const powerMatch = /<Watts>(.*?)<\/Watts>/.exec(inner)
    if (powerMatch) tp.power = parseInt(powerMatch[1], 10)

    const latMatch = /<LatitudeDegrees>(.*?)<\/LatitudeDegrees>/.exec(inner)
    if (latMatch) tp.latitude = parseFloat(latMatch[1])

    const lonMatch = /<LongitudeDegrees>(.*?)<\/LongitudeDegrees>/.exec(inner)
    if (lonMatch) tp.longitude = parseFloat(lonMatch[1])

    const altMatch = /<AltitudeMeters>(.*?)<\/AltitudeMeters>/.exec(inner)
    if (altMatch) tp.elevation = parseFloat(altMatch[1])

    if (Object.keys(tp).length > 0) results.push(tp)
  }

  return results
}

/**
 * Parse JSON — extensible format for future devices or custom imports.
 */
function parseJSON(content: string): ParsedTelemetry[] {
  try {
    const data = JSON.parse(content)
    if (Array.isArray(data)) return data
    if (typeof data === 'object' && data !== null) return [data]
  } catch {
    return []
  }
  return []
}

/**
 * Parse TXT — tab or space-delimited text files used by some older devices.
 * Falls back to CSV-like parsing.
 */
function parseTXT(content: string): ParsedTelemetry[] {
  // Detect delimiter (tab vs space vs comma)
  const firstLine = content.split('\n')[0]
  let delimiter = ' '
  if (firstLine.includes('\t')) delimiter = '\t'
  else if (firstLine.includes(',')) delimiter = ','

  // Re-split with detected delimiter
  const modified = content.replace(/[\t ]+/g, delimiter)
  return parseCSV(modified)
}
