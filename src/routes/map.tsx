import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import type { SidebarRow } from '@/components/SidebarTable'
import { ErrorState } from '@/components/ErrorState'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { SearchBar } from '@/components/SearchBar'
import { SidebarTable } from '@/components/SidebarTable'
import { SSTMap } from '@/components/SSTMap'
import { getTodayISO } from '@/lib/dates'
import { useNavbarContent } from '@/components/NavbarContext'

// URL search params schema
const searchSchema = z.object({
  lat: z.number().optional(),
  lon: z.number().optional(),
  datetime: z.string().optional(), // ISO datetime string (YYYY-MM-DDTHH:mm:ss)
})

export const Route = createFileRoute('/map')({
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
  const searchParams = useSearch({ from: '/map' })
  const { setNavbarContent } = useNavbarContent()

  // Initialize with datetime from URL or default to today at noon
  const [selectedDateTime, setSelectedDateTime] = useState(() => {
    if (searchParams.datetime) {
      return searchParams.datetime
    }
    const today = getTodayISO()
    return `${today}T12:00:00`
  })
  const [selectedPoint, setSelectedPoint] = useState<PointData | null>(null)
  const [isLoadingPoint, setIsLoadingPoint] = useState(false)
  const [pointError, setPointError] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number; display?: string } | null>(null)

  // Memoize initial center to prevent map reinitialization
  const initialCenter = useMemo<[number, number] | undefined>(() => {
    if (searchParams.lat && searchParams.lon) {
      return [searchParams.lon, searchParams.lat]
    }
    return undefined
  }, [searchParams.lat, searchParams.lon])

  // Memoize displayText to prevent SearchBar rerenders
  const displayText = useMemo(() => {
    if (!selectedLocation) return ''
    if (selectedLocation.display) return selectedLocation.display
    return `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lon.toFixed(4)}`
  }, [selectedLocation])

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
          datetime: selectedDateTime,
        } as any,
      })

      // Extract date and time from datetime string
      const [date, timeWithSeconds] = selectedDateTime.split('T')
      const time = timeWithSeconds ? timeWithSeconds.substring(0, 5) : '12:00' // HH:mm

      const url = `/api/sst/point?lat=${lat}&lon=${lon}&date=${date}&time=${time}&years=3&forecastDays=2`

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
    [selectedDateTime, navigate],
  )

  const handleSearchSelect = useCallback(
    (lat: number, lon: number, display: string) => {
      // Just fetch point data - SSTMap will handle centering via selectedLocation prop
      handleMapClick(lat, lon, display)
    },
    [handleMapClick],
  )

  // Load point from URL on mount
  useEffect(() => {
    if (searchParams.lat && searchParams.lon) {
      // Set selectedLocation immediately so marker appears
      setSelectedLocation({ lat: searchParams.lat, lon: searchParams.lon })
      handleMapClick(searchParams.lat, searchParams.lon)
    }
  }, []) // Only run once on mount

  // Memoize the handleDateTimeChange callback
  const handleDateTimeChange = useCallback((datetime: string) => {
    setSelectedDateTime(datetime)
  }, [])

  // Refetch data when datetime changes (if we have a selected location)
  // Using a ref to track if we should skip the initial mount
  const isInitialMount = useRef(true)
  useEffect(() => {
    // Skip on initial mount to avoid double-fetching
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    if (selectedLocation) {
      handleMapClick(selectedLocation.lat, selectedLocation.lon, selectedLocation.display)
    }
  }, [selectedDateTime]) // Note: handleMapClick depends on selectedDateTime, so this will refetch

  // Memoize the SearchBar element to prevent unnecessary recreations
  const searchBarElement = useMemo(() => (
    <SearchBar
      onSelectLocation={handleSearchSelect}
      selectedDateTime={selectedDateTime}
      onDateTimeChange={handleDateTimeChange}
      displayText={displayText}
    />
  ), [handleSearchSelect, selectedDateTime, handleDateTimeChange, displayText])

  // Set navbar content with SearchBar
  useEffect(() => {
    setNavbarContent(searchBarElement)

    // Clean up when component unmounts
    return () => setNavbarContent(null)
  }, [setNavbarContent, searchBarElement])

  return (
    <div className="h-full w-full flex flex-col">
      {/* Mobile search bar - shown below navbar on mobile only */}
      <div className="md:hidden border-b bg-background p-2 [&_input]:min-h-[36px] [&_input]:py-1 [&_input]:px-3 [&_input]:text-sm [&_button]:min-h-[36px] [&_button]:py-1 [&_button]:px-3 [&_button]:text-sm [&_form]:gap-1.5">
        {searchBarElement}
      </div>

      {/* Map and sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <SSTMap
            onMapClick={handleMapClick}
            initialCenter={initialCenter}
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
          <div className="fixed md:relative bottom-0 md:bottom-auto left-0 right-0 md:left-auto md:right-auto w-full md:w-96 h-[70vh] md:h-full bg-background shadow-xl overflow-y-auto z-40 md:z-auto rounded-t-2xl md:rounded-none">
            <LoadingSkeleton />
          </div>
        ) : pointError ? (
          <div className="fixed md:relative bottom-0 md:bottom-auto left-0 right-0 md:left-auto md:right-auto w-full md:w-96 h-[70vh] md:h-full bg-background shadow-xl overflow-y-auto z-40 md:z-auto rounded-t-2xl md:rounded-none flex items-center justify-center">
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
                // Keep selectedLocation and URL params to maintain marker
              }}
            />
          )
        )}
      </div>
    </div>
  )
}
