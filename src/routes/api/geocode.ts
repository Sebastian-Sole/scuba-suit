import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { z } from 'zod'
import { cache } from '@/lib/cache'
import { env } from '@/env'

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
          const geoapifyUrl = new URL('https://api.geoapify.com/v1/geocode/search')
          geoapifyUrl.searchParams.set('text', q)
          geoapifyUrl.searchParams.set('apiKey', env.GEOAPIFY_API_KEY)
          geoapifyUrl.searchParams.set('limit', '5')
          geoapifyUrl.searchParams.set('format', 'json')

          // Add timeout to prevent hanging requests
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 8000) // 8s timeout

          try {
            const response = await fetch(geoapifyUrl.toString(), {
              signal: controller.signal,
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
              console.error(`Geoapify returned ${response.status}: ${response.statusText}`)
              return json(
                { error: 'Geocoding service unavailable' },
                { status: 502 },
              )
            }

            const data = await response.json()
            const results = data.results || []

            const locations = results.map((r: any) => ({
              lat: r.lat,
              lon: r.lon,
              display: r.formatted,
            }))

            const payload = { locations }

            cache.set(cacheKey, payload, 86400)

            return json(payload, {
              headers: {
                'Cache-Control': 'public, max-age=86400',
              },
            })
          } catch (fetchErr) {
            clearTimeout(timeoutId)

            if (fetchErr instanceof Error && fetchErr.name === 'AbortError') {
              console.error(`Geocoding timeout for query: ${q}`)
              return json(
                { error: 'Geocoding request timed out' },
                { status: 504 },
              )
            }
            throw fetchErr
          }
        } catch (err) {
          console.error('Geocoding error:', err instanceof Error ? err.message : String(err), {
            query: q,
            error: err,
          })
          return json(
            { error: 'Failed to geocode location' },
            { status: 502 },
          )
        }
      },
    },
  },
})
