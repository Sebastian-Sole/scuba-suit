import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { z } from 'zod'
import { cache } from '@/lib/cache'

const geocodeQuerySchema = z.object({
  q: z.string().min(1),
})

export const Route = createFileRoute('/api/geocode')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const params = Object.fromEntries(url.searchParams)

        const parseResult = geocodeQuerySchema.safeParse(params)
        if (!parseResult.success) {
          return json(
            { error: 'Missing query parameter' },
            { status: 400 },
          )
        }

        const { q } = parseResult.data

        const cacheKey = `geocode:${q.toLowerCase()}`
        const cached = cache.get(cacheKey)
        if (cached) {
          return json(cached, {
            headers: {
              'Cache-Control': 'public, max-age=86400',
            },
          })
        }

        try {
          const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search')
          nominatimUrl.searchParams.set('q', q)
          nominatimUrl.searchParams.set('format', 'json')
          nominatimUrl.searchParams.set('limit', '5')

          const response = await fetch(nominatimUrl.toString(), {
            headers: {
              'User-Agent': 'ScubaSuitRecommender/1.0 (contact@example.com)',
            },
          })

          if (!response.ok) {
            return json(
              { error: 'Geocoding service unavailable' },
              { status: 502 },
            )
          }

          const results = await response.json()

          const locations = results.map((r: any) => ({
            lat: parseFloat(r.lat),
            lon: parseFloat(r.lon),
            display: r.display_name,
          }))

          const payload = { locations }

          cache.set(cacheKey, payload, 86400)

          return json(payload, {
            headers: {
              'Cache-Control': 'public, max-age=86400',
            },
          })
        } catch (err) {
          console.error('Geocoding error:', err)
          return json(
            { error: 'Failed to geocode location' },
            { status: 502 },
          )
        }
      },
    },
  },
})
