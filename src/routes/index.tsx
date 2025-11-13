import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { z } from 'zod'
import type { SidebarRow } from '@/components/SidebarTable'
import { ErrorState } from '@/components/ErrorState'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { SearchBar } from '@/components/SearchBar'
import { SidebarTable } from '@/components/SidebarTable'
import { SSTMap } from '@/components/SSTMap'
import { getTodayISO } from '@/lib/dates'

// URL search params schema
const searchSchema = z.object({
  lat: z.number().optional(),
  lon: z.number().optional(),
  date: z.string().optional(),
})

export const Route = createFileRoute('/')({
  component: MapPage,
  validateSearch: searchSchema,
})

interface PointData {
  location: {
    lat: number
    lon: number
    display?: string
  }
  rows: Array<SidebarRow>
  stats: any
}

function MapPage() {
  const navigate = useNavigate()
  const searchParams = useSearch({ from: '/' })

  const [selectedDate, setSelectedDate] = useState(
    searchParams.date || getTodayISO(),
  )
  // const [points, setPoints] = useState<MapPoint[]>([]) // Disabled for now - no heatmap
  // const [isLoadingGrid, setIsLoadingGrid] = useState(false) // Disabled for now - no heatmap
  const [selectedPoint, setSelectedPoint] = useState<PointData | null>(null)
  const [isLoadingPoint, setIsLoadingPoint] = useState(false)
  const [pointError, setPointError] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(
    searchParams.lat && searchParams.lon
      ? [searchParams.lon, searchParams.lat]
      : undefined,
  )
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number; display?: string } | null>(null)
  // Grid data fetching disabled for now - no heatmap
  // const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Fetch point data when map is clicked
  const handleMapClick = useCallback(
    async (lat: number, lon: number, display?: string) => {
      setIsLoadingPoint(true)
      setPointError(null)
      setSelectedLocation({ lat, lon, display })

      // Update URL
      void navigate({
        search: {
          lat,
          lon,
          date: selectedDate,
        } as any,
      })

      const url = `/api/sst/point?lat=${lat}&lon=${lon}&date=${selectedDate}&years=7&forecastDays=7`

      try {
        const response = await fetch(url)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to fetch point data')
        }

        const data = await response.json()
        setSelectedPoint(data)
        setPointError(null)
      } catch (err) {
        console.error('Error fetching point data:', err)
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to load temperature data for this location.'
        setPointError(errorMessage)
        setSelectedPoint(null)
      } finally {
        setIsLoadingPoint(false)
      }
    },
    [selectedDate, navigate],
  )

  const handleSearchSelect = useCallback(
    (lat: number, lon: number, display: string) => {
      // Pan map to location
      setMapCenter([lon, lat])

      // Fetch point data
      handleMapClick(lat, lon, display)
    },
    [handleMapClick],
  )

  // Load point from URL on mount
  useEffect(() => {
    if (searchParams.lat && searchParams.lon) {
      handleMapClick(searchParams.lat, searchParams.lon)
    }
  }, []) // Only run once on mount

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Search bar */}
      <div className="bg-white shadow-md p-3 sm:p-4 z-20">
        <div className="max-w-2xl mx-auto">
          <SearchBar
            onSelectLocation={handleSearchSelect}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            displayText={selectedLocation?.display || (selectedLocation ? `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lon.toFixed(4)}` : '')}
          />
        </div>
      </div>

      {/* Map and sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <SSTMap
            points={[]}
            selectedDate={selectedDate}
            onMapClick={handleMapClick}
            initialCenter={mapCenter}
            isLoading={isLoadingPoint}
            selectedLocation={selectedLocation}
          />
          {isLoadingPoint && (
            <div className="absolute top-4 right-4 bg-cyan-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 z-20">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="hidden sm:inline">Loading location data...</span>
              <span className="sm:hidden">Loading...</span>
            </div>
          )}
        </div>

        {/* Sidebar */}
        {isLoadingPoint && !selectedPoint ? (
          <div className="fixed md:relative bottom-0 md:bottom-auto left-0 right-0 md:left-auto md:right-auto w-full md:w-96 h-[70vh] md:h-full bg-white shadow-xl overflow-y-auto z-40 md:z-auto rounded-t-2xl md:rounded-none">
            <LoadingSkeleton />
          </div>
        ) : pointError ? (
          <div className="fixed md:relative bottom-0 md:bottom-auto left-0 right-0 md:left-auto md:right-auto w-full md:w-96 h-[70vh] md:h-full bg-white shadow-xl overflow-y-auto z-40 md:z-auto rounded-t-2xl md:rounded-none flex items-center justify-center">
            <ErrorState
              message={pointError}
              onRetry={() => {
                if (searchParams.lat && searchParams.lon) {
                  handleMapClick(searchParams.lat, searchParams.lon)
                }
              }}
              onClose={() => {
                setPointError(null)
                setSelectedPoint(null)
                setSelectedLocation(null)
                void navigate({ search: {} as any })
              }}
            />
          </div>
        ) : (
          selectedPoint && (
            <SidebarTable
              location={selectedPoint.location}
              rows={selectedPoint.rows}
              stats={selectedPoint.stats}
              onClose={() => {
                setSelectedPoint(null)
                setPointError(null)
                setSelectedLocation(null)
                // Clear URL params
                void navigate({ search: {} as any })
              }}
            />
          )
        )}
      </div>
    </div>
  )
}
