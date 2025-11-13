import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { z } from 'zod'
import { cache } from '@/lib/cache'
import { fetchSSTGrid } from '@/lib/sst'

const gridQuerySchema = z.object({
  bbox: z.string().regex(/^-?\d+\.?\d*,-?\d+\.?\d*,-?\d+\.?\d*,-?\d+\.?\d*$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  step: z.string().optional().default('0.5'),
})

export const Route = createFileRoute('/api/sst/grid')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const params = Object.fromEntries(url.searchParams)

        const parseResult = gridQuerySchema.safeParse(params)
        if (!parseResult.success) {
          return json(
            { error: 'Invalid parameters', details: parseResult.error.issues },
            { status: 400 },
          )
        }

        const { bbox, date, step } = parseResult.data
        const stepNum = parseFloat(step)

        const cacheKey = `grid:${bbox}:${date}:${stepNum}`
        const cached = cache.get(cacheKey)
        if (cached) {
          return json(cached, {
            headers: {
              'Cache-Control': 'public, max-age=900',
            },
          })
        }

        const [minLon, minLat, maxLon, maxLat] = bbox.split(',').map(Number)

        const coords: Array<{ lat: number; lon: number }> = []
        for (
          let lat = minLat;
          lat <= maxLat;
          lat = Math.round((lat + stepNum) * 10000) / 10000
        ) {
          for (
            let lon = minLon;
            lon <= maxLon;
            lon = Math.round((lon + stepNum) * 10000) / 10000
          ) {
            coords.push({ lat, lon })
          }
        }

        if (coords.length > 1000) {
          return json(
            {
              error: 'Grid too large',
              message: 'Reduce zoom level or increase step size',
            },
            { status: 400 },
          )
        }

        try {
          const points = await fetchSSTGrid(coords, date)
          const payload = { points }

          cache.set(cacheKey, payload, 900)

          return json(payload, {
            headers: {
              'Cache-Control': 'public, max-age=900',
            },
          })
        } catch (err) {
          console.error('Grid fetch error:', err)
          return json(
            { error: 'Failed to fetch SST data' },
            { status: 502 },
          )
        }
      },
    },
  },
})
