'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapPin } from 'lucide-react'
import { renderToString } from 'react-dom/server'
import { MapHelpMenu } from './MapHelpMenu'
import type { Map as MapLibreMap } from 'maplibre-gl'

export interface MapPoint {
  lat: number
  lon: number
  temp: number | null
}

export interface SSTMapProps {
  points: Array<MapPoint>
  selectedDate: string
  onMapMove?: (bounds: {
    minLon: number
    minLat: number
    maxLon: number
    maxLat: number
  }) => void
  onMapClick?: (lat: number, lon: number) => void
  initialCenter?: [number, number] // [lon, lat]
  initialZoom?: number
  hasSelection?: boolean
  isLoading?: boolean
}

export function SSTMap({
  points,
  selectedDate,
  onMapMove,
  onMapClick,
  initialCenter = [5, 55], // North Sea default
  initialZoom = 4,
  hasSelection = false,
  isLoading = false,
}: SSTMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<MapLibreMap | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const marker = useRef<maplibregl.Marker | null>(null)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lon: number } | null>(null)

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Use MapLibre demo tiles
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json', // MapLibre demo style
      center: initialCenter,
      zoom: initialZoom,
      pitchWithRotate: false, // Disable pitch control
      dragRotate: false, // Disable rotation with right-click
    })

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right')

    // Mark map as loaded
    map.current.on('load', () => {
      console.log('Map loaded successfully')
      setIsMapLoaded(true)
    })

    // Log any map errors
    map.current.on('error', (e) => {
      console.error('Map error:', e)
    })

    console.log('Map initialized', { center: initialCenter, zoom: initialZoom })

    // Cleanup
    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [initialCenter, initialZoom])

  // Handle map movement - disabled for now (no heatmap)
  // useEffect(() => {
  //   if (!map.current || !onMapMove) return
  //   const handleMoveEnd = () => {
  //     if (!map.current) return
  //     const bounds = map.current.getBounds()
  //     onMapMove({
  //       minLon: bounds.getWest(),
  //       minLat: bounds.getSouth(),
  //       maxLon: bounds.getEast(),
  //       maxLat: bounds.getNorth(),
  //     })
  //   }
  //   map.current.on('moveend', handleMoveEnd)
  //   return () => {
  //     map.current?.off('moveend', handleMoveEnd)
  //   }
  // }, [onMapMove])

  // Handle map clicks in selection mode
  useEffect(() => {
    if (!map.current || !onMapClick || !isMapLoaded) return

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      // Only handle clicks when in selection mode
      if (!isSelectionMode) return

      const lat = e.lngLat.lat
      const lon = e.lngLat.lng

      // Update selected coordinates
      setSelectedCoords({ lat, lon })

      // Call the parent handler to fetch data
      onMapClick(lat, lon)

      // Exit selection mode after selecting
      setIsSelectionMode(false)

      // Center map on selected location with smooth animation
      if (map.current) {
        map.current.easeTo({
          center: [lon, lat],
          duration: 800, // 800ms smooth animation
          essential: true
        })
      }

      // Update marker position - set position immediately, animate styles
      if (marker.current) {
        const element = marker.current.getElement()
        const newLngLat: [number, number] = [lon, lat]

        // Set position immediately (not in RAF to avoid delay)
        marker.current.setLngLat(newLngLat)

        // Animate visibility with RAF
        requestAnimationFrame(() => {
          element.style.opacity = '1' // Fade in
          element.style.transform = 'scale(1)' // No bounce, just appear
        })
      } else {
        console.warn('Marker not available for click interaction')
      }
    }

    map.current.on('click', handleClick)

    return () => {
      map.current?.off('click', handleClick)
    }
  }, [onMapClick, isMapLoaded, isSelectionMode])

  // Create marker once when map loads
  useEffect(() => {
    if (!map.current || !isMapLoaded || marker.current) return

    // Create marker element with Lucide icon
    const el = document.createElement('div')
    el.className = 'map-marker'
    el.innerHTML = renderToString(
      <MapPin className="w-8 h-8 text-cyan-600 drop-shadow-lg" fill="white" strokeWidth={2} />
    )
    el.style.cursor = 'pointer'
    el.style.width = '32px'
    el.style.height = '32px'
    el.style.display = 'flex'
    el.style.alignItems = 'center'
    el.style.justifyContent = 'center'
    // Use opacity for GPU acceleration
    el.style.transition = 'opacity 0.2s ease'
    el.style.willChange = 'opacity' // Hint for browser optimization
    el.style.opacity = '0' // Start invisible for smooth fade-in
    el.style.pointerEvents = 'none' // Don't block map interactions

    // Initialize marker (hidden initially) with bottom anchor
    marker.current = new maplibregl.Marker({
      element: el,
      anchor: 'bottom' // Anchor at bottom so pin points to location
    })
      .setLngLat([0, 0])
      .addTo(map.current)
    const markerEl = marker.current.getElement()
    markerEl.style.opacity = '0'

    return () => {
      if (marker.current) {
        marker.current.remove()
        marker.current = null
      }
    }
  }, [isMapLoaded])

  // Hide marker when selection is cleared
  useEffect(() => {
    if (!hasSelection && marker.current) {
      const element = marker.current.getElement()
      requestAnimationFrame(() => {
        element.style.opacity = '0'
      })
    }
  }, [hasSelection])

  // Update cursor style based on selection mode
  useEffect(() => {
    if (!mapContainer.current) return

    if (isSelectionMode) {
      mapContainer.current.style.cursor = 'crosshair'
    } else {
      mapContainer.current.style.cursor = isLoading ? 'wait' : 'grab'
    }
  }, [isSelectionMode, isLoading])

  // Keyboard navigation support
  useEffect(() => {
    if (!map.current) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow screen readers to announce map interactions
      if (e.key === 'Enter' && map.current) {
        const center = map.current.getCenter()
        if (onMapClick) {
          onMapClick(center.lat, center.lng)
        }
      }
    }

    const container = mapContainer.current
    container?.addEventListener('keydown', handleKeyDown)

    return () => {
      container?.removeEventListener('keydown', handleKeyDown)
    }
  }, [onMapClick])

  // Memoize the toggle function to prevent unnecessary re-renders
  const handleToggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => !prev)
  }, [])

  // Heatmap disabled for now - focus on basic map interaction
  // TODO: Re-enable heatmap visualization later

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div
        ref={mapContainer}
        role="application"
        aria-label="Interactive map for selecting dive locations"
        tabIndex={0}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }}
      />
      {!isMapLoaded && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            zIndex: 50,
          }}
        >
          <div style={{ color: 'white', fontSize: '1.125rem' }}>Loading map...</div>
        </div>
      )}
      {isMapLoaded && (
        <div
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            zIndex: 10,
          }}
        >
          <MapHelpMenu
            selectedCoords={selectedCoords}
            isLoading={isLoading}
            isSelectionMode={isSelectionMode}
            onToggleSelectionMode={handleToggleSelectionMode}
          />
        </div>
      )}
    </div>
  )
}
