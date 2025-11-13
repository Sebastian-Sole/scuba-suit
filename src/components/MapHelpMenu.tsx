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
        className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-slate-200 hover:bg-white transition-all flex items-center gap-2 text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
      className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 overflow-hidden min-w-[240px]"
      role="region"
      aria-label="Map interaction guide"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
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
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            aria-pressed={isSelectionMode}
          >
            <MapPin className="w-4 h-4" aria-hidden="true" />
            {isSelectionMode ? 'Click map to select' : 'Select Location'}
          </button>
        </div>

        {/* Selected Coordinates */}
        <div>
          <div className="text-slate-500 uppercase tracking-wide font-semibold mb-1">
            Selected Location
          </div>
          <div
            className="font-mono text-slate-900"
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
          <div className="text-slate-500 uppercase tracking-wide font-semibold mb-1">
            Keyboard Shortcuts
          </div>
          <div className="text-slate-600 italic">
            Coming soon
          </div>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="pt-2 border-t border-slate-200">
            <div
              className="text-cyan-600 animate-pulse"
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
