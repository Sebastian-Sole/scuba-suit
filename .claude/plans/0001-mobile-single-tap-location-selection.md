# Mobile Single-Tap Location Selection Implementation Plan

## Overview

Enable single-tap location selection on mobile devices by bypassing the selection mode requirement for viewports under 640px. This enhances mobile UX by allowing users to tap the map directly to select dive locations without first clicking a "Select Location" button, while preserving the intentional two-step process on desktop to prevent accidental selections during panning.

## Current State Analysis

**Map Click Handler** (`src/components/SSTMap.tsx:74-108`):
- Requires `isSelectionMode` prop to be `true` before processing map clicks (line 76)
- Automatically exits selection mode after selection (lines 88-90)
- MapLibre GL natively handles touch gesture differentiation (taps vs drags)

**Selection Mode State** (`src/routes/map.tsx:54, 180-193`):
- Managed via `isSelectionMode` state in the map route
- "Select Location" button toggles this mode (lines 181-192)
- Button is mobile-only with `sm:hidden` class (line 178)

**Viewport Detection**:
- Codebase uses Tailwind responsive classes (`sm:`, `md:`, etc.)
- Mobile breakpoint is 640px (Tailwind's `sm` breakpoint)
- No existing `useMediaQuery` hook in the codebase
- `window.matchMedia` is used in `ThemeProvider.tsx:46` for theme detection

### Key Constraints

- Desktop behavior must remain unchanged (explicit selection mode required)
- Map navigation gestures (pan, zoom, rotate) must not be affected
- Mobile breakpoint is `640px` to match existing Tailwind conventions

## Desired End State

After implementation:

1. **Mobile users (< 640px)** can tap the map once to immediately select a location
2. **Desktop users (≥ 640px)** must still click "Select Location" button before clicking the map
3. Map navigation gestures work correctly on all devices
4. "Select Location" button remains visible on mobile as a status indicator
5. No regressions in existing functionality

### Verification Checklist

- [x] Single tap on mobile (< 640px) selects location without button click
- [x] Desktop (≥ 640px) still requires "Select Location" button
- [x] Marker appears immediately after tap/click
- [x] Data fetches automatically and drawer/sidebar opens
- [x] Pan, zoom, pinch gestures work without interference
- [x] No console errors or warnings

## What We're NOT Doing

- Not changing desktop behavior (desktop keeps explicit selection mode)
- Not adding gesture tutorials or onboarding overlays
- Not implementing long-press selection
- Not adding haptic feedback
- Not changing marker design or animation
- Not modifying the overall selection flow logic beyond viewport detection

## Implementation Approach

We'll use **Option 1: Conditional Selection Mode** from the ticket, which involves:

1. Creating a reusable `useMediaQuery` hook for viewport detection
2. Using the hook directly in the `SSTMap` component to detect mobile viewports
3. Conditionally bypassing selection mode check on mobile devices
4. Keeping the component self-contained and responsive

This approach:
- Centralizes viewport logic in a reusable hook
- Makes the component self-contained (owns its responsive behavior)
- Preserves backward compatibility
- Follows React best practices for responsive behavior
- Avoids unnecessary prop drilling
- Allows future viewport-dependent features

---

## Phase 1: Create useMediaQuery Hook

### Overview

Create a reusable hook that wraps `window.matchMedia` to detect viewport size changes. This provides a React-friendly way to respond to media queries.

### Changes Required

#### 1. New Hook File

**File**: `src/hooks/useMediaQuery.ts` (new file)

```typescript
import { useEffect, useState } from 'react'

/**
 * Hook to detect if a media query matches the current viewport
 * @param query - CSS media query string (e.g., "(max-width: 640px)")
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    // Check if window is available (SSR safety)
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    // SSR safety check
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)

    // Update state when media query changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Set initial value
    setMatches(mediaQuery.matches)

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}
```

**Rationale**: This hook pattern is similar to the `window.matchMedia` usage in `ThemeProvider.tsx:46` and provides SSR-safe viewport detection with automatic updates on resize.

### Success Criteria

#### Automated Verification

- [x] TypeScript compilation passes: `pnpm build`
- [x] No linting errors: `pnpm lint`

#### Manual Verification

- [x] Hook file exists at `src/hooks/useMediaQuery.ts`
- [x] Hook can be imported without errors

---

## Phase 2: Modify SSTMap Component

### Overview

Update the `SSTMap` component to use the `useMediaQuery` hook directly to detect mobile viewports and conditionally bypass the selection mode check for mobile devices.

### Changes Required

#### 1. Import the Hook

**File**: `src/components/SSTMap.tsx:1-9`

Add import after existing imports:

```typescript
import { useMediaQuery } from '@/hooks/useMediaQuery'
```

#### 2. Use Hook in Component

**File**: `src/components/SSTMap.tsx:21-35`

Add after component function signature and before the first `useRef`:

```typescript
export const SSTMap = memo(function SSTMap({
  onMapClick,
  initialCenter = [5, 55], // North Sea default
  initialZoom = 4,
  isLoading = false,
  selectedLocation = null,
  isSelectionMode = false,
  onToggleSelectionMode,
}: SSTMapProps) {
  // Detect mobile viewport (< 640px = Tailwind's sm breakpoint)
  const isMobile = useMediaQuery('(max-width: 639px)')

  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<MapLibreMap | null>(null)
  // ... rest of component
```

**Note**: We use `639px` instead of `640px` to match Tailwind's `sm:` breakpoint behavior, which applies at `640px` and above.

#### 3. Modify Click Handler Logic

**File**: `src/components/SSTMap.tsx:74-76`

**Old code:**
```typescript
const handleClick = (e: maplibregl.MapMouseEvent) => {
  // Only handle clicks when in selection mode
  if (!isSelectionMode) return
```

**New code:**
```typescript
const handleClick = (e: maplibregl.MapMouseEvent) => {
  // On mobile: always handle clicks (no selection mode needed)
  // On desktop: only handle clicks when in selection mode
  if (!isMobile && !isSelectionMode) return
```

**Rationale**: This is the core change - mobile users bypass the selection mode check entirely, while desktop users must still enable selection mode first. The component now owns its responsive behavior rather than relying on props from the parent.

### Success Criteria

#### Automated Verification

- [x] TypeScript compilation passes: `pnpm build`
- [x] No linting errors: `pnpm lint`
- [x] No type errors in SSTMap.tsx
- [x] Hook import resolves correctly

#### Manual Verification

- [x] Component uses `useMediaQuery` hook without errors
- [x] Desktop behavior unchanged (requires selection mode)
- [x] Mobile viewport detection works correctly
- [x] No console errors when resizing viewport

---

## Phase 3: Verification and Testing

### Overview

This phase focuses on comprehensive testing across all viewports and devices to ensure the feature works correctly and doesn't introduce regressions. Since the `SSTMap` component now handles viewport detection internally, no code changes are needed - this is purely verification.

### Success Criteria

#### Automated Verification

- [x] Full application builds successfully: `pnpm build`
- [x] No linting errors: `pnpm lint`
- [x] Type checking passes without errors
- [x] No runtime errors in console during basic usage

#### Manual Verification - Core Functionality

- [x] Mobile viewport (< 640px) allows single-tap selection without button
- [x] Desktop viewport (≥ 640px) still requires "Select Location" button click
- [x] Marker appears immediately at tap/click location
- [x] Location data fetches automatically after selection
- [x] Sidebar (desktop) or drawer (mobile) opens with data
- [x] Viewport resize (crossing 640px boundary) triggers correct behavior

#### Manual Verification - Regression Testing

- [x] Desktop selection mode toggle still works
- [x] Desktop crosshair cursor appears in selection mode
- [x] Desktop pan/zoom works without selection mode active
- [x] Mobile pan gesture doesn't trigger selection
- [x] Mobile pinch zoom works correctly
- [x] Keyboard navigation (Enter key) still functions
- [x] "Select Location" button on mobile still toggles mode if clicked

---

## Testing Strategy

### Unit Tests

While this ticket doesn't require new unit tests, consider these areas if adding tests later:

- `useMediaQuery` hook returns correct boolean based on viewport
- Hook updates when viewport size changes
- SSR safety (returns `false` when `window` is undefined)

### Integration Tests

Key scenarios to verify end-to-end:

1. Mobile user taps map → location selected → data fetched → drawer opens
2. Desktop user clicks map without selection mode → nothing happens
3. Desktop user enables selection mode → clicks map → location selected
4. Viewport resize from desktop to mobile → behavior switches

### Manual Testing Checklist

#### Mobile Testing (< 640px)

- [ ] **iOS Safari**: Single tap selects location and opens drawer
- [ ] **iOS Chrome**: Single tap selects location and opens drawer
- [ ] **Android Chrome**: Single tap selects location and opens drawer
- [ ] **Mobile pan gesture**: Dragging map pans without selecting
- [ ] **Mobile pinch zoom**: Pinch gesture zooms without selecting
- [ ] **Mobile marker**: Marker appears immediately at tap location
- [ ] **Mobile data fetch**: Location data loads after tap

#### Desktop Testing (≥ 640px)

- [ ] **Without selection mode**: Clicking map does nothing
- [ ] **With selection mode**: Clicking map selects location
- [ ] **Cursor change**: Crosshair appears in selection mode
- [ ] **Desktop pan**: Click-drag pans map (not in selection mode)
- [ ] **Desktop marker**: Marker appears after click in selection mode
- [ ] **Selection mode exit**: Mode exits automatically after selection

#### Tablet Testing (~640px boundary)

- [ ] **Portrait (< 640px)**: Behaves like mobile
- [ ] **Landscape (≥ 640px)**: Behaves like desktop
- [ ] **Window resize**: Switching breakpoint updates behavior correctly

#### Edge Cases

- [ ] **Rapid double-tap**: Only one selection, no zoom interference
- [ ] **Long press**: Doesn't interfere with selection
- [ ] **Multi-touch**: Pinch zoom doesn't trigger selection
- [ ] **Button toggle on mobile**: Still works for users who prefer it
- [ ] **Keyboard navigation**: Enter key still works (line 237-242)

### Performance Testing

- [ ] No performance degradation from `useMediaQuery` hook
- [ ] No excessive re-renders on viewport changes
- [ ] Marker animation remains smooth

---

## Performance Considerations

### Hook Efficiency

The `useMediaQuery` hook uses native browser APIs (`matchMedia`) which are highly optimized. It only triggers re-renders when the media query match status actually changes, not on every resize event.

### Re-render Impact

Adding `isMobile` prop to `SSTMap` is minimal impact because:
- `SSTMap` is wrapped in `React.memo` (line 21)
- The prop only changes at breakpoint boundaries (640px)
- Normal viewport resizing within mobile or desktop ranges won't cause re-renders

### No Performance Regressions

The implementation:
- Doesn't add expensive computations to render path
- Doesn't affect map rendering or marker animations
- Uses the same click handler logic (just different conditions)

---

## Migration Notes

### No Breaking Changes

This is a pure enhancement with:
- No API changes (all new props have defaults)
- No data migrations needed
- Full backward compatibility
- Desktop behavior unchanged

### Gradual Rollout Capability

If needed, the feature can be feature-flagged:

```typescript
const isMobile = ENABLE_MOBILE_TAP && useMediaQuery('(max-width: 639px)')
```

But this isn't recommended - the feature is low-risk and high-value.

---

## Accessibility Considerations

### Preserved Features

- Keyboard navigation (Enter key) still works (SSTMap.tsx:231-251)
- ARIA labels remain unchanged
- Touch targets meet minimum size requirements (button is `px-3 py-2`)

### Improvements

Mobile users with motor impairments benefit from fewer required taps to accomplish the same task.

---

## References

- Original ticket: `.claude/tickets/0001-mobile-single-tap-location-selection.md`
- Current map implementation: `src/components/SSTMap.tsx`
- Route with selection mode: `src/routes/map.tsx`
- Theme provider (matchMedia example): `src/components/ThemeProvider.tsx:46`
- Tailwind breakpoint documentation: https://tailwindcss.com/docs/responsive-design

---

## Open Questions

✅ **All questions resolved:**

- Breakpoint confirmed: 640px (Tailwind `sm`)
- Approach confirmed: useMediaQuery hook with conditional logic
- Button behavior: Keep visible on mobile
- Desktop behavior: No changes (explicit selection mode required)
