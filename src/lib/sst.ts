/**
 * SST data fetching utilities for Open-Meteo Marine API
 * Handles single and multi-coordinate requests with robust error handling
 */

const MARINE_API_BASE = 'https://marine-api.open-meteo.com/v1/marine'

export interface SSTPoint {
  lat: number
  lon: number
  temp: number | null
}

/**
 * Fetch SST day average for a single coordinate
 * Returns null if no data available (land, ice, or API error)
 */
export async function fetchSSTDayAvg(
  lat: number,
  lon: number,
  dateISO: string,
): Promise<number | null> {
  const qs = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    hourly: 'sea_surface_temperature',
    start_date: dateISO,
    end_date: dateISO,
    timezone: 'auto',
    cell_selection: 'sea', // Bias toward ocean cells near coastlines
  })

  try {
    const r = await fetch(`${MARINE_API_BASE}?${qs}`, {
      headers: {
        'User-Agent': 'ScubaSuitRecommender/1.0',
      },
    })

    if (!r.ok) {
      console.warn(`Open-Meteo error for ${lat},${lon} on ${dateISO}: ${r.status}`)
      return null
    }

    const j = await r.json()

    // Open-Meteo returns different structures for single vs multi-point
    const temps: Array<number | null> =
      j?.hourly?.sea_surface_temperature ?? []

    if (!temps.length) return null

    // Filter out null values (ice coverage, land, etc.)
    const validTemps = temps.filter((t): t is number => t !== null)
    if (!validTemps.length) return null

    // Return daily average
    return validTemps.reduce((a, b) => a + b, 0) / validTemps.length
  } catch (err) {
    console.error(`Failed to fetch SST for ${lat},${lon}:`, err)
    return null
  }
}

/**
 * Fetch SST for multiple coordinates (grid sampling)
 * More efficient than individual requests for heatmap data
 */
export async function fetchSSTGrid(
  coords: Array<{ lat: number; lon: number }>,
  dateISO: string,
): Promise<Array<SSTPoint>> {
  if (!coords.length) return []

  const qs = new URLSearchParams({
    latitude: coords.map((c) => c.lat.toFixed(4)).join(','),
    longitude: coords.map((c) => c.lon.toFixed(4)).join(','),
    hourly: 'sea_surface_temperature',
    start_date: dateISO,
    end_date: dateISO,
    timezone: 'auto',
    cell_selection: 'sea',
  })

  try {
    const r = await fetch(`${MARINE_API_BASE}?${qs}`, {
      headers: {
        'User-Agent': 'ScubaSuitRecommender/1.0',
      },
    })

    if (!r.ok) {
      console.warn(`Open-Meteo grid error: ${r.status}`)
      return coords.map((c) => ({ ...c, temp: null }))
    }

    const j = await r.json()

    // Multi-coordinate responses are in j.results array
    const results = j.results ?? [j]

    return results.map((res: any, i: number) => {
      const temps: Array<number | null> =
        res?.hourly?.sea_surface_temperature ?? []

      const validTemps = temps.filter((t): t is number => t !== null)
      const temp =
        validTemps.length > 0
          ? validTemps.reduce((a, b) => a + b, 0) / validTemps.length
          : null

      return {
        lat: coords[i].lat,
        lon: coords[i].lon,
        temp,
      }
    })
  } catch (err) {
    console.error('Failed to fetch SST grid:', err)
    return coords.map((c) => ({ ...c, temp: null }))
  }
}

/**
 * Attempt to find valid SST by nudging coordinate seaward
 * Useful for coastal/land-edge clicks that return null
 */
export async function fetchSSTWithNudge(
  lat: number,
  lon: number,
  dateISO: string,
  maxAttempts = 3,
): Promise<number | null> {
  let temp = await fetchSSTDayAvg(lat, lon, dateISO)
  if (temp !== null) return temp

  // Try nudging slightly in different directions (simplified: just east/west)
  const nudgeAmount = 0.02 // ~2km at equator
  const attempts = [
    { lat, lon: lon + nudgeAmount },
    { lat, lon: lon - nudgeAmount },
    { lat: lat + nudgeAmount, lon },
  ]

  for (let i = 0; i < Math.min(maxAttempts, attempts.length); i++) {
    temp = await fetchSSTDayAvg(
      attempts[i].lat,
      attempts[i].lon,
      dateISO,
    )
    if (temp !== null) return temp
  }

  return null
}
