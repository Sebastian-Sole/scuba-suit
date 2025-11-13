import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { z } from 'zod'
import { cache } from '@/lib/cache'
import { fetchSSTDayAvg, fetchSSTWithNudge } from '@/lib/sst'
import { suitForTemp } from '@/lib/suit'
import {
  getForecastDates,
  getHistoricalDates,
  isValidISODate,
} from '@/lib/dates'

const pointQuerySchema = z.object({
  lat: z.string().regex(/^-?\d+\.?\d*$/),
  lon: z.string().regex(/^-?\d+\.?\d*$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  years: z.string().optional().default('7'),
  forecastDays: z.string().optional().default('7'),
})

export const Route = createFileRoute('/api/sst/point')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const params = Object.fromEntries(url.searchParams)

        const parseResult = pointQuerySchema.safeParse(params)
        if (!parseResult.success) {
          return json(
            { error: 'Invalid parameters', details: parseResult.error.issues },
            { status: 400 },
          )
        }

        const { lat: latStr, lon: lonStr, date, years: yearsStr, forecastDays: forecastDaysStr } = parseResult.data
        const lat = parseFloat(latStr)
        const lon = parseFloat(lonStr)
        const years = parseInt(yearsStr)
        const forecastDays = parseInt(forecastDaysStr)

        if (!isValidISODate(date)) {
          return json({ error: 'Invalid date format' }, { status: 400 })
        }

        const cacheKey = `point:${lat.toFixed(3)}:${lon.toFixed(3)}:${date}:${years}:${forecastDays}`
        const cached = cache.get(cacheKey)
        if (cached) {
          return json(cached, {
            headers: {
              'Cache-Control': 'public, max-age=1800',
            },
          })
        }

        try {
          const historicalDates = getHistoricalDates(date, years)
          const historicalTemps = await Promise.all(
            historicalDates.map((d) => fetchSSTDayAvg(lat, lon, d)),
          )

          const historicalRows = historicalDates.map((d, i) => ({
            date: d,
            tempC: historicalTemps[i],
            suit: historicalTemps[i] !== null ? suitForTemp(historicalTemps[i]) : null,
            kind: 'historical' as const,
          }))

          const selectedTemp = await fetchSSTWithNudge(lat, lon, date, 3)
          const selectedRow = {
            date,
            tempC: selectedTemp,
            suit: selectedTemp !== null ? suitForTemp(selectedTemp) : null,
            kind: 'selected' as const,
          }

          const forecastDates = getForecastDates(date, forecastDays)
          const forecastTemps = await Promise.all(
            forecastDates.map((d) => fetchSSTDayAvg(lat, lon, d)),
          )

          const forecastRows = forecastDates.map((d, i) => ({
            date: d,
            tempC: forecastTemps[i],
            suit: forecastTemps[i] !== null ? suitForTemp(forecastTemps[i]) : null,
            kind: 'forecast' as const,
          }))

          const rows = [
            ...historicalRows.reverse(),
            selectedRow,
            ...forecastRows,
          ]

          const validTemps = rows
            .filter((r) => r.tempC !== null)
            .map((r) => r.tempC as number)

          // If no valid temperatures at all, return error
          if (validTemps.length === 0) {
            return json(
              {
                error: 'No ocean temperature data available for this location. Try clicking on ocean areas or searching for coastal cities.',
                code: 'NO_DATA'
              },
              { status: 404 },
            )
          }

          const stats = validTemps.length
            ? {
                mean: validTemps.reduce((a, b) => a + b, 0) / validTemps.length,
                min: Math.min(...validTemps),
                max: Math.max(...validTemps),
                p10: quantile(validTemps, 0.1),
                p90: quantile(validTemps, 0.9),
              }
            : null

          const payload = {
            location: { lat, lon },
            rows,
            stats,
          }

          cache.set(cacheKey, payload, 1800)

          return json(payload, {
            headers: {
              'Cache-Control': 'public, max-age=1800',
            },
          })
        } catch (err) {
          console.error('Point fetch error:', err)
          return json(
            { error: 'Failed to fetch SST data' },
            { status: 502 },
          )
        }
      },
    },
  },
})

function quantile(arr: Array<number>, q: number): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const pos = (sorted.length - 1) * q
  const base = Math.floor(pos)
  const rest = pos - base
  const nextIndex = base + 1
  if (nextIndex < sorted.length) {
    return sorted[base] + rest * (sorted[nextIndex] - sorted[base])
  }
  return sorted[base]
}
