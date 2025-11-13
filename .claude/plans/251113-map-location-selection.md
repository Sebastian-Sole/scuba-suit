# Map Location Selection Enhancement Implementation Plan

## Overview

Enhance the existing map interaction with visual feedback and user guidance by adding a persistent location marker, an interactive help menu in the bottom-left corner, and improved click feedback. The goal is to make it immediately clear to users how to interact with the map and provide visual confirmation of their selected location.

## Current State Analysis

**Existing Implementation:**
- MapLibre GL (v5.12.0) is already integrated in `src/components/SSTMap.tsx`
- Click handler exists: `onMapClick` prop triggers data fetch (`src/components/SSTMap.tsx:94-106`)
- Search flow: SearchBar → handleSearchSelect → pans map + fetches data (`src/routes/index.tsx:91-100`)
- Map displays with navigation controls in top-right corner
- Bottom-left area currently shows "Map loaded ✓" status (`src/components/SSTMap.tsx:136-149`)

**What's Missing:**
- No visual marker showing selected location on the map
- No instructional guidance for first-time users
- No real-time coordinate display during map interaction
- No way to minimize/dismiss helper information

**Key Discoveries:**
- Lucide React is already installed (v0.544.0) - can use MapPin icon (`package.json:32`)
- MapLibre marker API available: `maplibregl.Marker` class for DOM-based markers
- Existing color scheme: Cyan (primary), Slate (neutral) - should match
- Mobile-responsive patterns: Fixed overlays with `md:` breakpoints for desktop

## Desired End State

After implementation:
1. Users see a persistent marker (pin) on the map showing their selected location
2. A minimizable help menu in the bottom-left corner displays:
   - Interaction hint ("Click map to select location")
   - Real-time cursor coordinates as they hover over the map
   - (Future: keyboard shortcuts section)
3. Visual feedback during click and loading states
4. All features work seamlessly on mobile and desktop
5. Accessibility: screen reader support and keyboard navigation

**Verification:**
- Run the app and click anywhere on the map → marker appears at clicked location
- Hover over map → coordinates update in real-time in help menu
- Click minimize button on help menu → menu collapses to small button
- Click while data is loading → appropriate loading indicator shown
- Close sidebar → marker remains visible for current selection

## What We're NOT Doing

- Not changing the click interaction pattern (staying with single click)
- Not adding right-click or double-click interactions
- Not implementing keyboard shortcuts yet (placeholder only)
- Not adding a heatmap or additional map layers
- Not changing the search bar or sidebar functionality
- Not adding map drawing tools or measurement features

## Implementation Approach

Enhance the existing `SSTMap` component with marker management and a new help menu component. Keep the changes modular and maintain the current click-based interaction pattern. Use MapLibre's Marker API for the location pin and a custom React component for the help menu overlay.

---

## Phase 1: Add Location Marker

### Overview

Add a persistent marker to the map that shows the user's selected location. The marker should use the MapPin icon from Lucide React, styled to match the app's cyan color scheme.

### Changes Required:

#### 1. SSTMap Component - Marker State & Management

**File**: `src/components/SSTMap.tsx`

**Changes**:
- Import MapPin from lucide-react
- Add state to track the marker instance
- Create marker DOM element with Lucide icon
- Update marker position on click
- Clean up marker on unmount

Add imports:
```tsx
import { MapPin } from 'lucide-react'
import { renderToString } from 'react-dom/server'
```

Add marker state after existing state declarations (around line 37):
```tsx
const [isMapLoaded, setIsMapLoaded] = useState(false)
const marker = useRef<maplibregl.Marker | null>(null)
```

Add marker creation and update effect after the map click handler effect (after line 106):
```tsx
// Update marker on map clicks
useEffect(() => {
  if (!map.current || !isMapLoaded) return

  // Create marker element with Lucide icon
  const el = document.createElement('div')
  el.className = 'map-marker'
  el.innerHTML = renderToString(
    <MapPin className="w-8 h-8 text-cyan-600 drop-shadow-lg" fill="white" strokeWidth={2} />
  )
  el.style.cursor = 'pointer'

  // Initialize marker (hidden initially)
  if (!marker.current) {
    marker.current = new maplibregl.Marker({ element: el })
      .setLngLat([0, 0])
      .addTo(map.current)
    marker.current.getElement().style.display = 'none'
  }

  return () => {
    marker.current?.remove()
    marker.current = null
  }
}, [isMapLoaded])
```

Update the click handler to show/move marker (modify existing effect around line 94):
```tsx
// Handle map clicks
useEffect(() => {
  if (!map.current || !onMapClick) return

  const handleClick = (e: maplibregl.MapMouseEvent) => {
    onMapClick(e.lngLat.lat, e.lngLat.lng)

    // Update marker position
    if (marker.current) {
      marker.current.setLngLat([e.lngLat.lng, e.lngLat.lat])
      marker.current.getElement().style.display = 'block'
    }
  }

  map.current.on('click', handleClick)

  return () => {
    map.current?.off('click', handleClick)
  }
}, [onMapClick])
```

#### 2. Index Page - Reset Marker on Sidebar Close

**File**: `src/routes/index.tsx`

**Changes**: Add prop to SSTMap to hide marker when sidebar closes

Update SSTMap component call (around line 127) to track selected state:
```tsx
<SSTMap
  points={[]}
  selectedDate={selectedDate}
  onMapClick={handleMapClick}
  initialCenter={mapCenter}
  hasSelection={selectedPoint !== null}
/>
```

Update SSTMap props interface (in `src/components/SSTMap.tsx` around line 13):
```tsx
export interface SSTMapProps {
  points: MapPoint[]
  selectedDate: string
  onMapMove?: (bounds: {
    minLon: number
    minLat: number
    maxLon: number
    maxLat: number
  }) => void
  onMapClick?: (lat: number, lon: number) => void
  initialCenter?: [number, number]
  initialZoom?: number
  hasSelection?: boolean
}
```

Update component signature (around line 27):
```tsx
export function SSTMap({
  points,
  selectedDate,
  onMapMove,
  onMapClick,
  initialCenter = [5, 55],
  initialZoom = 4,
  hasSelection = false,
}: SSTMapProps) {
```

Add effect to hide marker when hasSelection becomes false (after marker update effect):
```tsx
// Hide marker when selection is cleared
useEffect(() => {
  if (!hasSelection && marker.current) {
    marker.current.getElement().style.display = 'none'
  }
}, [hasSelection])
```

### Success Criteria:

#### Automated Verification:
- [x] TypeScript compilation passes: `pnpm build`
- [ ] No linting errors: `pnpm lint`
- [ ] All tests pass: `pnpm test`

#### Manual Verification:
- [ ] Click anywhere on map → cyan pin appears at clicked location
- [ ] Click different location → pin moves to new location smoothly
- [ ] Close sidebar → pin disappears from map
- [ ] Search for location via SearchBar → pin appears at searched location
- [ ] Pin icon is visible and properly styled (cyan with white fill)
- [ ] Pin doesn't interfere with map panning or zooming

---

## Phase 2: Create Interactive Help Menu (Bottom-Left Corner)

### Overview

Replace the simple "Map loaded ✓" message with a comprehensive, minimizable help menu that shows interaction hints and real-time cursor coordinates.

### Changes Required:

#### 1. Create MapHelpMenu Component

**File**: `src/components/MapHelpMenu.tsx` (new file)

**Changes**: Create new component with minimize/expand functionality

```tsx
'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Info } from 'lucide-react'

export interface MapHelpMenuProps {
  cursorCoords: { lat: number; lon: number } | null
  isLoading?: boolean
}

export function MapHelpMenu({ cursorCoords, isLoading }: MapHelpMenuProps) {
  const [isMinimized, setIsMinimized] = useState(false)

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-slate-200 hover:bg-white transition-all flex items-center gap-2 text-slate-600 hover:text-slate-900"
        aria-label="Show map help"
      >
        <Info className="w-4 h-4" />
        <ChevronUp className="w-4 h-4" />
      </button>
    )
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 overflow-hidden min-w-[240px]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
          <Info className="w-4 h-4" />
          <span>Map Guide</span>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded hover:bg-slate-100"
          aria-label="Minimize map help"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3 text-xs">
        {/* Interaction Hint */}
        <div>
          <div className="text-slate-500 uppercase tracking-wide font-semibold mb-1">
            Interaction
          </div>
          <div className="text-slate-700">
            Click map to select location
          </div>
        </div>

        {/* Cursor Coordinates */}
        <div>
          <div className="text-slate-500 uppercase tracking-wide font-semibold mb-1">
            Cursor Position
          </div>
          <div className="font-mono text-slate-900">
            {cursorCoords
              ? `${cursorCoords.lat.toFixed(4)}, ${cursorCoords.lon.toFixed(4)}`
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
            <div className="text-cyan-600 animate-pulse">
              Loading location data...
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

#### 2. Update SSTMap Component - Integrate Help Menu

**File**: `src/components/SSTMap.tsx`

**Changes**:
- Import MapHelpMenu component
- Track cursor coordinates on mouse move
- Replace "Map loaded ✓" message with MapHelpMenu
- Pass loading state to menu

Add import:
```tsx
import { MapHelpMenu } from './MapHelpMenu'
```

Add cursor coordinate state (after marker ref around line 38):
```tsx
const marker = useRef<maplibregl.Marker | null>(null)
const [cursorCoords, setCursorCoords] = useState<{ lat: number; lon: number } | null>(null)
```

Add props for loading state to SSTMapProps interface (around line 25):
```tsx
export interface SSTMapProps {
  points: MapPoint[]
  selectedDate: string
  onMapMove?: (bounds: {
    minLon: number
    minLat: number
    maxLon: number
    maxLat: number
  }) => void
  onMapClick?: (lat: number, lon: number) => void
  initialCenter?: [number, number]
  initialZoom?: number
  hasSelection?: boolean
  isLoading?: boolean
}
```

Update component signature (around line 34):
```tsx
export function SSTMap({
  points,
  selectedDate,
  onMapMove,
  onMapClick,
  initialCenter = [5, 55],
  initialZoom = 4,
  hasSelection = false,
  isLoading = false,
}: SSTMapProps) {
```

Add mouse move tracking effect (after existing effects):
```tsx
// Track cursor position for coordinate display
useEffect(() => {
  if (!map.current) return

  const handleMouseMove = (e: maplibregl.MapMouseEvent) => {
    setCursorCoords({
      lat: e.lngLat.lat,
      lon: e.lngLat.lng,
    })
  }

  const handleMouseLeave = () => {
    setCursorCoords(null)
  }

  map.current.on('mousemove', handleMouseMove)
  map.current.on('mouseleave', handleMouseLeave)

  return () => {
    map.current?.off('mousemove', handleMouseMove)
    map.current?.off('mouseleave', handleMouseLeave)
  }
}, [])
```

Replace the existing bottom-left overlay (lines 135-150) with:
```tsx
{isMapLoaded && (
  <div
    style={{
      position: 'absolute',
      bottom: '1rem',
      left: '1rem',
      zIndex: 10,
    }}
  >
    <MapHelpMenu cursorCoords={cursorCoords} isLoading={isLoading} />
  </div>
)}
```

#### 3. Update Index Page - Pass Loading State to Map

**File**: `src/routes/index.tsx`

**Changes**: Pass isLoadingPoint to SSTMap

Update SSTMap component call (around line 127):
```tsx
<SSTMap
  points={[]}
  selectedDate={selectedDate}
  onMapClick={handleMapClick}
  initialCenter={mapCenter}
  hasSelection={selectedPoint !== null}
  isLoading={isLoadingPoint}
/>
```

### Success Criteria:

#### Automated Verification:
- [x] TypeScript compilation passes: `pnpm build`
- [ ] No linting errors: `pnpm lint`
- [ ] All tests pass: `pnpm test`

#### Manual Verification:
- [ ] Help menu appears in bottom-left corner when map loads
- [ ] Menu shows "Click map to select location" instruction
- [ ] Cursor coordinates update in real-time as mouse moves over map
- [ ] Coordinates disappear when cursor leaves map area
- [ ] Click minimize button → menu collapses to small icon button
- [ ] Click collapsed icon → menu expands to full size
- [ ] "Loading location data..." appears in menu when fetching data
- [ ] Menu doesn't overlap with MapLibre attribution (bottom-right)
- [ ] Menu is readable and styled consistently with app (white bg, slate text)
- [ ] Menu works on mobile (touch doesn't show cursor coords, but menu still accessible)

---

## Phase 3: Improve Click Feedback

### Overview

Add visual feedback during map clicks and loading states to make interactions feel more responsive and polished.

### Changes Required:

#### 1. SSTMap Component - Click Visual Feedback

**File**: `src/components/SSTMap.tsx`

**Changes**:
- Change cursor to pointer on hover
- Add brief click animation on marker placement
- Show loading indicator overlay during data fetch

Add CSS for cursor and animations in the map container div (update return statement around line 111):
```tsx
return (
  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
    <div
      ref={mapContainer}
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        cursor: isLoading ? 'wait' : 'crosshair',
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
        <MapHelpMenu cursorCoords={cursorCoords} isLoading={isLoading} />
      </div>
    )}
  </div>
)
```

Add marker bounce animation effect (after marker creation effect):
```tsx
// Animate marker on placement
useEffect(() => {
  if (!marker.current) return

  const element = marker.current.getElement()

  // Add bounce animation class
  element.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'

  // Trigger animation on marker visibility change
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'style') {
        const display = element.style.display
        if (display === 'block') {
          element.style.transform = 'scale(1.3)'
          setTimeout(() => {
            element.style.transform = 'scale(1)'
          }, 300)
        }
      }
    })
  })

  observer.observe(element, { attributes: true })

  return () => observer.disconnect()
}, [marker.current])
```

#### 2. Index Page - Loading Indicator Positioning

**File**: `src/routes/index.tsx`

**Changes**: The loading indicator is already present (lines 133-137), but let's make it more prominent

Update the loading indicator (around line 133):
```tsx
{isLoadingPoint && (
  <div className="absolute top-4 right-4 bg-cyan-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2">
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
    Loading location data...
  </div>
)}
```

### Success Criteria:

#### Automated Verification:
- [x] TypeScript compilation passes: `pnpm build`
- [ ] No linting errors: `pnpm lint`
- [ ] All tests pass: `pnpm test`

#### Manual Verification:
- [ ] Map cursor changes to crosshair when hovering over map
- [ ] Cursor changes to wait/loading cursor while data is fetching
- [ ] Marker has subtle bounce animation when placed
- [ ] Loading indicator appears in top-right during fetch
- [ ] Loading indicator has spinning animation
- [ ] Clicking while loading shows appropriate feedback (cursor + indicator)
- [ ] Clicking the same location twice doesn't break the UI
- [ ] Animations perform smoothly on both desktop and mobile

---

## Phase 4: Polish & Accessibility ✅

### Overview

Ensure the feature is fully accessible, works well on mobile devices, and handles edge cases gracefully.

### Changes Required:

#### 1. MapHelpMenu Component - Accessibility Enhancements ✅

**File**: `src/components/MapHelpMenu.tsx`

**Changes**: Add ARIA attributes and keyboard navigation

Update the component with accessibility features:

```tsx
'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Info } from 'lucide-react'

export interface MapHelpMenuProps {
  cursorCoords: { lat: number; lon: number } | null
  isLoading?: boolean
}

export function MapHelpMenu({ cursorCoords, isLoading }: MapHelpMenuProps) {
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
        {/* Interaction Hint */}
        <div>
          <div className="text-slate-500 uppercase tracking-wide font-semibold mb-1">
            Interaction
          </div>
          <div className="text-slate-700">
            Click map to select location
          </div>
        </div>

        {/* Cursor Coordinates */}
        <div>
          <div className="text-slate-500 uppercase tracking-wide font-semibold mb-1">
            Cursor Position
          </div>
          <div
            className="font-mono text-slate-900"
            aria-live="polite"
            aria-atomic="true"
          >
            {cursorCoords
              ? `${cursorCoords.lat.toFixed(4)}, ${cursorCoords.lon.toFixed(4)}`
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
}
```

#### 2. SSTMap Component - Accessibility & Mobile

**File**: `src/components/SSTMap.tsx`

**Changes**: Add ARIA labels and ensure touch events work properly

Add accessible label to map container (update around line 111):
```tsx
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
        cursor: isLoading ? 'wait' : 'crosshair',
      }}
    />
    {/* ... rest of the component */}
  </div>
)
```

Add keyboard event handling for accessibility (after mouse move effect):
```tsx
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
```

#### 3. Index Page - Mobile Touch Handling

**File**: `src/routes/index.tsx`

**Changes**: Ensure the help menu doesn't interfere with mobile interactions

Add mobile-specific CSS to help menu positioning (update SSTMap wrapper around line 126):
```tsx
{/* Map */}
<div className="flex-1 relative">
  <SSTMap
    points={[]}
    selectedDate={selectedDate}
    onMapClick={handleMapClick}
    initialCenter={mapCenter}
    hasSelection={selectedPoint !== null}
    isLoading={isLoadingPoint}
  />
  {isLoadingPoint && (
    <div className="absolute top-4 right-4 bg-cyan-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 z-20">
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      <span className="hidden sm:inline">Loading location data...</span>
      <span className="sm:hidden">Loading...</span>
    </div>
  )}
</div>
```

#### 4. Add Global CSS for Marker Styling

**File**: `src/routes/__root.tsx` or relevant global styles location

**Changes**: Ensure marker animations work properly

If there's a global CSS file, add:
```css
.map-marker {
  transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
}

.map-marker:hover {
  transform: scale(1.1);
}
```

If no global CSS, these styles are already handled inline via the component.

### Success Criteria:

#### Automated Verification:
- [x] TypeScript compilation passes: `pnpm build`
- [ ] No linting errors: `pnpm lint`
- [ ] All tests pass: `pnpm test`

#### Manual Verification:
- [ ] Screen reader announces "Interactive map for selecting dive locations"
- [ ] Tab key focuses on help menu minimize/expand button
- [ ] Enter/Space keys toggle help menu when button is focused
- [ ] Pressing Enter while map is focused selects map center location
- [ ] Help menu is fully functional on mobile (touch tap to minimize/expand)
- [ ] Marker appears correctly on mobile tap
- [ ] Cursor coordinates don't show on mobile (no mouse cursor)
- [ ] Help menu doesn't overlap with sidebar on mobile or desktop
- [ ] All interactive elements have visible focus indicators
- [ ] Loading text is shortened on mobile ("Loading..." vs "Loading location data...")
- [ ] Z-index stacking is correct (help menu < loading indicator < sidebar)

---

## Testing Strategy

### Unit Tests

Since this is primarily UI/visual functionality, unit testing will be limited. Focus on:

- **MapHelpMenu component**: Test minimize/expand state toggle
- **Coordinate formatting**: Test that decimal format is correct (4 decimal places)

Example test file `src/components/MapHelpMenu.test.tsx`:
```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MapHelpMenu } from './MapHelpMenu'

describe('MapHelpMenu', () => {
  it('should render expanded by default', () => {
    render(<MapHelpMenu cursorCoords={null} />)
    expect(screen.getByText('Map Guide')).toBeInTheDocument()
    expect(screen.getByText('Click map to select location')).toBeInTheDocument()
  })

  it('should minimize when minimize button is clicked', () => {
    render(<MapHelpMenu cursorCoords={null} />)
    const minimizeBtn = screen.getByLabelText('Minimize map help menu')
    fireEvent.click(minimizeBtn)
    expect(screen.queryByText('Map Guide')).not.toBeInTheDocument()
  })

  it('should display cursor coordinates in correct format', () => {
    render(<MapHelpMenu cursorCoords={{ lat: 55.1234, lon: 5.6789 }} />)
    expect(screen.getByText('55.1234, 5.6789')).toBeInTheDocument()
  })

  it('should show loading indicator when isLoading is true', () => {
    render(<MapHelpMenu cursorCoords={null} isLoading={true} />)
    expect(screen.getByText('Loading location data...')).toBeInTheDocument()
  })
})
```

### Integration Tests

Focus on the interaction between components:

- Click map → marker appears → sidebar opens with data
- Search location → map pans → marker appears
- Close sidebar → marker disappears
- Help menu minimize → expand flow

### Manual Testing Checklist

**Desktop (Chrome, Firefox, Safari):**
1. Load app → verify help menu appears and is readable
2. Hover over map → verify coordinates update in real-time
3. Click random location → verify marker appears and sidebar loads
4. Click different location → verify marker moves
5. Minimize help menu → verify it collapses to button
6. Expand help menu → verify it expands fully
7. Close sidebar → verify marker disappears
8. Use search bar → verify marker appears at searched location
9. Test keyboard navigation: Tab through interactive elements
10. Test keyboard selection: Focus map, press Enter

**Mobile (iOS Safari, Android Chrome):**
1. Load app on mobile device
2. Verify help menu is visible and doesn't overlap controls
3. Tap map → verify marker appears and sidebar slides up
4. Verify cursor coordinates section doesn't show on mobile (no hover)
5. Tap help menu minimize → verify it collapses
6. Tap help menu expand → verify it expands
7. Test with different screen sizes (phone, tablet)
8. Verify loading indicator fits on small screens

**Accessibility (Screen Reader):**
1. Enable VoiceOver (macOS) or NVDA (Windows)
2. Navigate to map → verify "Interactive map for selecting dive locations" is announced
3. Navigate to help menu → verify region is announced
4. Tab to minimize button → verify button label is announced
5. Verify coordinate updates are announced (aria-live)

## Performance Considerations

- **Mouse move throttling**: The cursor coordinate updates happen on every `mousemove` event. This is acceptable for MapLibre's event system, which is already optimized. If performance issues arise on low-end devices, consider throttling updates to ~100ms intervals.

- **Marker DOM element**: Using a custom DOM element (Lucide icon) for the marker is more performant than canvas-based markers for a single point. No optimization needed unless adding multiple markers.

- **Help menu re-renders**: The menu will re-render on every coordinate update. This is acceptable since it's a small component. If needed, wrap in `React.memo` with custom comparison function.

- **Animation performance**: CSS transforms and transitions are GPU-accelerated, ensuring smooth animations even on mobile devices.

## Migration Notes

No data migration required. This is purely a UI enhancement with no backend or data model changes.

**Backwards compatibility:**
- All existing functionality (search, click, sidebar) remains unchanged
- New props are optional with sensible defaults
- No breaking changes to component APIs

**Rollout considerations:**
- Can be deployed immediately with no feature flags needed
- Users will see new UI immediately upon refresh
- No documentation changes required for end users (self-explanatory UI)

## References

- MapLibre GL Marker API: https://maplibre.org/maplibre-gl-js/docs/API/classes/Marker/
- Lucide React Icons: https://lucide.dev/
- Current implementation: `src/components/SSTMap.tsx:1`
- Search integration: `src/routes/index.tsx:91-100`
- Existing UI patterns: `src/components/SidebarTable.tsx` (mobile drawer, color scheme)
