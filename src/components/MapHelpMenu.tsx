'use client'

import { memo, useState } from 'react'
import { ChevronDown, ChevronUp, Info, MapPin } from 'lucide-react'

export interface MapHelpMenuProps {
  selectedCoords: { lat: number; lon: number } | null
  isLoading?: boolean
  isSelectionMode: boolean
  onToggleSelectionMode: () => void
}

export const MapHelpMenu = memo(function MapHelpMenu({ selectedCoords, isLoading, isSelectionMode, onToggleSelectionMode }: MapHelpMenuProps) {
  const [isMinimized, setIsMinimized] = useState(false)

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsMinimized(false)
          }
        }}
        className="bg-background/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border hover:bg-background transition-all flex items-center gap-2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Show map help menu"
        aria-expanded="false"
      >
        <Info className="w-4 h-4" aria-hidden="true" />
        <ChevronUp className="w-4 h-4" aria-hidden="true" />
      </button>
    )
  }

  return (
    <div
      className="bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border overflow-hidden min-w-[240px]"
      role="region"
      aria-label="Map interaction guide"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
        <div className="flex items-center gap-2 font-medium text-sm">
          <Info className="w-4 h-4" aria-hidden="true" />
          <span>Map Guide</span>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setIsMinimized(true)
            }
          }}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Minimize map help menu"
          aria-expanded="true"
        >
          <ChevronDown className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3 text-xs">
        {/* Select Location Button */}
        <div>
          <button
            onClick={onToggleSelectionMode}
            className={`w-full px-3 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
              isSelectionMode
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
            aria-pressed={isSelectionMode}
          >
            <MapPin className="w-4 h-4" aria-hidden="true" />
            {isSelectionMode ? 'Click map to select' : 'Select Location'}
          </button>
        </div>

        {/* Selected Coordinates */}
        <div>
          <div className="text-muted-foreground uppercase tracking-wide font-semibold mb-1">
            Selected Location
          </div>
          <div
            className="font-mono"
            aria-live="polite"
            aria-atomic="true"
          >
            {selectedCoords
              ? `${selectedCoords.lat.toFixed(4)}, ${selectedCoords.lon.toFixed(4)}`
              : '—'}
          </div>
        </div>

        {/* Keyboard Shortcuts (placeholder) */}
        <div className="opacity-50">
          <div className="text-muted-foreground uppercase tracking-wide font-semibold mb-1">
            Keyboard Shortcuts
          </div>
          <div className="text-muted-foreground italic">
            Coming soon
          </div>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="pt-2 border-t">
            <div
              className="text-primary animate-pulse"
              role="status"
              aria-live="polite"
            >
              Loading location data...
            </div>
          </div>
        )}
      </div>
    </div>
  )
})
