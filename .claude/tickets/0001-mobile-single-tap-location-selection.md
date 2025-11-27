# 0001 - Mobile Single-Tap Location Selection

## 🎯 **Description**

Enable single-tap location selection on mobile devices to improve user experience. Currently, mobile users must tap a "Select Location" button to enter selection mode before tapping the map. This enhancement allows users to set a location by directly tapping the map on mobile views, matching user expectations.

## 📋 **User Story**

As a mobile user, I want to tap the map directly to select a dive location so that I can quickly explore temperature data without the extra step of enabling selection mode.

## 🔧 **Technical Context**

The current implementation requires mobile users to:

1. Tap the "Select Location" button to enter `isSelectionMode`
2. Tap the map to select a location
3. Automatically exit selection mode after selection

This was implemented to differentiate between map navigation (pan/zoom) and location selection. However, user feedback indicates this adds friction to the mobile experience, as users naturally expect tapping the map to select a location.

The relevant code is in:

- `src/routes/map.tsx:180-193` - Select Location button
- `src/components/SSTMap.tsx:70-115` - Map click handler with selection mode logic

## ✅ **Acceptance Criteria**

- [x] On mobile viewports (< 640px), single tap on map sets location without requiring "Select Location" button
- [x] On desktop viewports (≥ 640px), current behavior is maintained (button click required for selection mode)
- [x] Map panning and zooming still work correctly on mobile (no interference with location selection)
- [x] Selected location marker appears immediately after tap
- [x] Location data fetch is triggered automatically on tap
- [x] Sidebar/drawer opens automatically with location data
- [x] No regression in desktop functionality

## 🚨 **Technical Requirements**

### **Implementation Details**

**Option 1: Conditional Selection Mode (Recommended)**

```typescript
// In SSTMap component
const isMobile = useMediaQuery('(max-width: 640px)') // or pass as prop

// In map click handler effect
const handleClick = (e: maplibregl.MapMouseEvent) => {
  // On mobile: always handle clicks (no selection mode needed)
  // On desktop: only handle clicks when in selection mode
  if (!isMobile && !isSelectionMode) return

  // Rest of click handling logic...
}
```

**Option 2: Touch vs Click Detection**
Detect touch events vs mouse events to differentiate mobile vs desktop interactions.

**Recommendation**: Option 1 is simpler and more maintainable. Use a viewport-based approach with Tailwind's breakpoint system or a media query hook.

### **Dependencies**

- `src/components/SSTMap.tsx` - Map click handler logic
- `src/routes/map.tsx` - Selection mode state and button visibility
- Consider adding a `useMediaQuery` hook if not already available

### **Integration Points**

- Map click handler (`SSTMap.tsx:74-108`)
- Selection mode state management (`map.tsx:54`)
- "Select Location" button rendering (`map.tsx:180-193`)

## 🔍 **Implementation Notes**

### Considerations

1. **Touch vs Pan Conflict**: MapLibre GL handles touch events well - short taps register as clicks while drag gestures trigger panning. No special handling needed.

2. **Desktop Behavior Preservation**: Ensure desktop users still have the explicit selection mode to avoid accidental location changes while panning.

3. **Button Visibility**: The "Select Location" button should either:
   - Be hidden on mobile (since it's not needed)
   - OR display a different affordance (e.g., "Current location: Tap map to change")

4. **Cursor Feedback**: On desktop, the crosshair cursor indicates selection mode. On mobile, consider adding a visual hint that the map is tappable (possibly in help menu or onboarding).

### Edge Cases

- Rapid tap (double-tap) - should only register one selection, not zoom + select
- Long press - should not interfere with context menu or other gestures
- Multi-touch gestures (pinch zoom) - should not trigger location selection

## 📊 **Definition of Done**

- [x] Mobile users can tap map once to select location
- [x] Desktop users maintain current two-step selection process
- [x] No interference with map navigation gestures (pan, zoom, rotate)
- [x] Code is responsive to viewport size changes
- [x] Manual testing confirms improved UX on iOS and Android devices
- [x] No console errors or warnings

## 🧪 **Testing Requirements**

- [x] **Manual - Mobile (iOS)**: Verify single-tap selection works on iPhone Safari and Chrome
- [x] **Manual - Mobile (Android)**: Verify single-tap selection works on Android Chrome
- [x] **Manual - Desktop**: Confirm selection mode button still required on desktop (≥640px)
- [x] **Manual - Tablet**: Test behavior at breakpoint boundary (~640px)
- [x] **Manual - Gestures**: Verify pan, zoom, and pinch gestures don't interfere with selection
- [x] **Visual - Marker**: Confirm marker appears at tap location immediately
- [x] **Integration - Data Fetch**: Verify data loads correctly after tap selection
- [x] **Regression - Desktop**: Ensure desktop experience unchanged

## 🚫 **Out of Scope**

- Changing desktop behavior (desktop should maintain explicit selection mode)
- Adding map gesture tutorials or onboarding overlays
- Implementing "long press" for location selection
- Adding haptic feedback for location selection
- Changing the marker design or animation

## 📝 **Notes**

This change addresses direct user feedback indicating that the current selection flow feels non-intuitive on mobile. The goal is to reduce friction in the mobile experience while preserving the intentional selection process on desktop where accidental clicks during panning are more common.

**User Feedback Context**: Users reported that they instinctively tap the map expecting it to select a location, similar to other map applications (Google Maps, Apple Maps, etc.).

---

## ✅ **Completion Notes**

**Status**: Completed successfully on 2025-11-27

**Implementation Summary**:
- Created reusable `useMediaQuery` hook (`src/hooks/useMediaQuery.ts`) for SSR-safe viewport detection
- Modified `SSTMap` component to conditionally bypass selection mode on mobile viewports (<640px)
- Desktop behavior preserved - explicit selection mode still required on ≥640px viewports
- MapLibre GL natively handles touch gesture differentiation (taps vs drags)

**Key Components Modified**:
- `src/hooks/useMediaQuery.ts` (new) - Responsive viewport detection hook
- `src/components/SSTMap.tsx` - Added mobile viewport detection and conditional click handling

**Testing Verified**:
- ✅ Mobile single-tap selection works without "Select Location" button
- ✅ Desktop still requires selection mode button
- ✅ Map navigation gestures (pan, zoom, pinch) work correctly
- ✅ Marker appears immediately at tap location
- ✅ Data fetching and drawer/sidebar opening works automatically
- ✅ Responsive behavior at 640px breakpoint boundary
- ✅ No console errors or warnings
- ✅ No regressions in existing functionality

**Implementation Approach**:
Used Option 1 (Conditional Selection Mode) from technical requirements. This approach centralizes viewport logic in a reusable hook, makes the component self-contained, and follows React best practices for responsive behavior.

**Git Commit**: `6d3057a` - "feat: enable single-tap location selection on mobile"

**Related Documentation**:
- Implementation plan: `.claude/plans/0001-mobile-single-tap-location-selection.md`

## 🏷️ **Labels**

- `priority: high`
- `type: enhancement`
- `component: map`
- `platform: mobile`
- `ux-improvement`
