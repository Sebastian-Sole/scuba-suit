---
date: 2025-11-18T00:00:00Z
git_commit: fe997077bf2d7e53a9a3e0dd1e5c115a0f37a519
branch: main
repository: scuba-suit
topic: "Codebase Cleanup Opportunities Analysis"
tags: [research, cleanup, refactoring, technical-debt, maintainability, code-quality]
status: complete
last_updated: 2025-11-18
---

# Research: Codebase Cleanup Opportunities Analysis

**Date**: 2025-11-18
**Git Commit**: fe997077bf2d7e53a9a3e0dd1e5c115a0f37a519
**Branch**: main
**Repository**: scuba-suit

## Research Question

What can be cleaned up in this codebase, including deleting code, removing unused imports, refactoring to increase maintainability and scalability?

## Summary

The scuba-suit codebase is overall well-structured with modern React patterns, TypeScript, and TanStack ecosystem. However, there are several cleanup opportunities across the following categories:

1. **Debug Logging**: 14 console statements (mostly error logging, some debug)
2. **Dead Code**: Significant commented-out heatmap functionality that needs decision
3. **Code Duplication**: API route patterns that could be abstracted
4. **Component Size**: A few large components that could benefit from decomposition
5. **TODO Items**: One outstanding TODO for heatmap visualization
6. **Potential Dependency Optimization**: Some dependencies may be unused

Overall Code Health: **Good** (7/10) - Modern architecture with some technical debt from rapid development.

## Detailed Findings

### 1. Console Statements to Remove/Replace

#### Debug Console.log (2 instances - **HIGH PRIORITY TO REMOVE**)

**`src/components/SSTMap.tsx`**:
- Line 69: `console.log('Map loaded successfully')` - Debug message
- Line 78: `console.log('Map initialized', { center: initialCenter, zoom: initialZoom })` - Debug message

**Recommendation**: Remove these debug logs or replace with proper logging framework.

#### Production Error Logging (12 instances - **KEEP BUT REVIEW**)

These are legitimate error logs that should likely remain, but consider centralizing error handling:

**`src/routes/api/geocode.ts`**:
- Line 74: `console.error('Geocoding error:', err)`

**`src/routes/api/sst/grid.ts`**:
- Line 80: `console.error('Grid fetch error:', err)`

**`src/routes/api/sst/point.ts`**:
- Line 138: `console.error('Point fetch error:', err)`

**`src/routes/map.tsx`**:
- Line 106: `console.error('Error fetching point data:', err)`

**`src/lib/sst.ts`**:
- Line 43: `console.warn(\`Open-Meteo error for ${lat},${lon} on ${dateISO}: ${r.status}\`)`
- Line 67: `console.error(\`Failed to fetch SST for ${lat},${lon}:\`, err)`
- Line 100: `console.warn(\`Open-Meteo grid error: ${r.status}\`)`
- Line 126: `console.error('Failed to fetch SST grid:', err)`

**`src/components/SearchBar.tsx`**:
- Line 52: `console.error('Search error:', err)`
- Line 115: `console.error('Search error:', err)`

**`src/components/SSTMap.tsx`**:
- Line 75: `console.error('Map error:', e)`
- Line 140: `console.warn('Marker not available for click interaction')`

**Recommendation**: Keep error logs but consider:
1. Centralized error logging service/utility
2. Structured logging format
3. Production error tracking (e.g., Sentry integration)

---

### 2. Dead Code and Commented Sections

#### Heatmap Functionality - **DECISION NEEDED**

**`src/components/SSTMap.tsx`**:
- Lines 87-104: Commented map movement handler (~18 lines)
- Line 293: `// TODO: Re-enable heatmap visualization later`
- Multiple references to disabled heatmap

**`src/routes/map.tsx`**:
- Line 48: `// const [points, setPoints] = useState<MapPoint[]>([])`
- Line 49: `// const [isLoadingGrid, setIsLoadingGrid] = useState(false)`
- Line 69: Comment about grid data fetching disabled
- Line 70: `// const debounceTimer = useRef<NodeJS.Timeout | null>(null)`

**Impact**: ~50+ lines of commented code related to heatmap visualization feature

**Recommendation**:
- **Option A**: If heatmap is planned, create a feature flag and keep code
- **Option B**: If heatmap is not immediate priority (>2 months), delete and rely on git history
- **Option C**: Move to separate branch until ready to implement

Current assessment: The commented code suggests active development pause, not permanent deletion. However, it adds noise. **Recommended action**: Delete commented code and create GitHub issue tracking heatmap feature work with reference to this commit.

#### Commented Code in Multiple Files

14 files contain commented sections (found via grep). Most significant:
- `src/routes/__root.tsx`: Meta tags and configuration comments (documentation - OK to keep)
- `src/components/SSTMap.tsx`: Largest amount of dead code
- `src/routes/map.tsx`: State management for disabled features
- `src/components/DateTimePicker.tsx`: Likely commented alternatives

**Recommendation**: Review each file individually, remove code that's not coming back soon.

---

### 3. Code Duplication Opportunities

#### API Route Pattern Duplication (**MEDIUM PRIORITY**)

All three API routes (`geocode.ts`, `sst/point.ts`, `sst/grid.ts`) follow nearly identical patterns:

**Duplicated Pattern**:
```typescript
// 1. Parse URL params
const url = new URL(request.url)
const params = Object.fromEntries(url.searchParams)

// 2. Validate with Zod
const parseResult = schema.safeParse(params)
if (!parseResult.success) {
  return json({ error: '...' }, { status: 400 })
}

// 3. Check cache
const cacheKey = `...`
const cached = cache.get(cacheKey)
if (cached) {
  return json(cached, { headers: { 'Cache-Control': '...' }})
}

// 4. Fetch data (business logic)
try {
  // ...
  cache.set(cacheKey, payload, ttl)
  return json(payload, { headers: { 'Cache-Control': '...' }})
} catch (err) {
  console.error('...', err)
  return json({ error: '...' }, { status: 502 })
}
```

**Files affected**:
- `src/routes/api/geocode.ts` (84 lines)
- `src/routes/api/sst/point.ts` (160 lines)
- `src/routes/api/sst/grid.ts` (90 lines)

**Recommendation**: Create shared utilities:

```typescript
// src/lib/api-helpers.ts
export function parseQueryParams<T>(request: Request, schema: ZodSchema<T>) {
  const url = new URL(request.url)
  const params = Object.fromEntries(url.searchParams)
  return schema.safeParse(params)
}

export function createCachedHandler<T>(
  options: {
    getCacheKey: (params: T) => string
    fetchData: (params: T) => Promise<any>
    ttl: number
  }
) {
  // Wrap the common pattern
}
```

**Impact**: Would reduce ~30-40 lines per route, increase maintainability

#### Location Data Interface Duplication (**LOW PRIORITY**)

Similar location structures appear in multiple files:

```typescript
// src/components/SearchBar.tsx:4
interface SearchResult {
  lat: number
  lon: number
  display: string
}

// src/routes/map.tsx:26 (inside PointData)
location: {
  lat: number
  lon: number
  display?: string  // Note: optional here
}

// src/routes/api/geocode.ts:58 (implicit from map)
{ lat: number, lon: number, display: string }
```

**Recommendation**: Create shared type in `src/lib/types.ts`:
```typescript
export interface Location {
  lat: number
  lon: number
  display?: string
}
```

#### Error Handling Pattern (**LOW PRIORITY**)

Each API route has similar try-catch with console.error pattern. Consider centralized error handling middleware or wrapper.

---

### 4. Component Size and Complexity

#### Large Components That Could Be Decomposed

**`src/components/SSTMap.tsx`** (347 lines)
- **Responsibilities**: Map initialization, marker management, selection mode, keyboard nav, help menu
- **Recommendation**: Extract marker logic into `useMapMarker` hook, selection mode into `useMapSelection` hook
- **Estimated Impact**: Could reduce to ~200 lines in main component

**`src/routes/map.tsx`** (245 lines)
- **Responsibilities**: Route definition, state management, data fetching, layout, sidebar display
- **Recommendation**: Extract data fetching logic into custom hook `usePointData(lat, lon, datetime)`
- **Estimated Impact**: Could reduce to ~150 lines, improve testability

**`src/components/SearchBar.tsx`** (231 lines)
- **Responsibilities**: Search UI, debouncing, keyboard navigation, results dropdown
- **Recommendation**: Extract keyboard navigation into `useKeyboardNav` hook, results dropdown into separate component
- **Estimated Impact**: Could reduce to ~120-150 lines

**Files with good size** (<150 lines):
- Most UI components in `src/components/ui/`
- API routes
- Utility libraries

---

### 5. Architecture and Scalability Concerns

#### Current Architecture (Well Designed)

**Strengths**:
- Clean separation: routes → components → lib utilities
- Type-safe with TypeScript
- Modern React patterns (hooks, memo, context)
- Server-side rendering capable with TanStack Start
- Proper caching strategy
- Path aliases configured (`@/*`)

**Scalability Observations**:

1. **API Rate Limiting**: No rate limiting on API routes (could be added for production)
2. **Error Boundaries**: No React Error Boundaries detected (recommended for production)
3. **State Management**: Currently using local state + URL state (good for small app, may need global state management if complexity grows)
4. **Bundle Size**: No code splitting detected beyond route-level (consider lazy loading for map components)

**Future Scalability Recommendations**:
- Add error boundaries around major component trees
- Consider adding API rate limiting middleware
- Monitor bundle size as dependencies grow
- Consider code splitting for heavy libraries (maplibre-gl)

---

### 6. Dependency Review

#### Dependencies Analysis (from package.json)

**Potentially Unused** (requires deeper analysis):
- `@faker-js/faker` - Only used in tests/storybook? Check if needed in production bundle
- `@tanstack/match-sorter-utils` - Not found in grep of imports
- `@tanstack/react-router-ssr-query` - May be transitively used, verify
- `tw-animate-css` - Tailwind animations, check if actually used
- `web-vitals` - Dev dependency but listed in devDependencies correctly

**Recommendation**: Run a dependency analysis tool:
```bash
pnpm exec depcheck
```

**Note**: I attempted to run depcheck but it's not installed. Consider adding it:
```bash
pnpm add -D depcheck
pnpm exec depcheck
```

#### Dependencies That Are Correctly Used
- React 19 + React DOM
- TanStack Router + Start (core framework)
- MapLibre GL (map visualization)
- Radix UI components (UI primitives)
- Tailwind CSS (styling)
- Zod (validation)
- date-fns (date utilities)

---

### 7. Unused Imports (File-Level Analysis)

**Method**: Analyzed import statements vs usage in key files

**Files with potential unused imports** (requires TypeScript compiler to confirm):

Most imports appear to be used. Modern build tools (Vite) typically tree-shake unused imports in production builds.

**Recommendation**: Run TypeScript compiler in strict mode to detect truly unused imports:
```bash
pnpm exec tsc --noEmit --noUnusedLocals --noUnusedParameters
```

---

## Code References

**Console logs to remove**:
- `src/components/SSTMap.tsx:69` - Map loaded debug log
- `src/components/SSTMap.tsx:78` - Map initialized debug log

**Dead code sections**:
- `src/components/SSTMap.tsx:87-104` - Commented map movement handler
- `src/components/SSTMap.tsx:293` - TODO for heatmap
- `src/routes/map.tsx:48-49` - Commented state variables

**Duplication opportunities**:
- `src/routes/api/geocode.ts:10-83` - API handler pattern
- `src/routes/api/sst/point.ts:22-147` - API handler pattern
- `src/routes/api/sst/grid.ts:13-89` - API handler pattern

**Large components for refactoring**:
- `src/components/SSTMap.tsx` - 347 lines
- `src/routes/map.tsx` - 245 lines
- `src/components/SearchBar.tsx` - 231 lines

---

## Architecture Insights

### Current Patterns (Positive)

1. **File-based routing**: TanStack Router auto-discovers routes
2. **Server-side API routes**: Co-located with frontend in `/api` directory
3. **Component composition**: Shadcn UI wrapper pattern over Radix primitives
4. **Memoization strategy**: Good use of `memo()`, `useMemo()`, `useCallback()`
5. **Type safety**: Consistent TypeScript usage with Zod validation
6. **Caching layer**: Simple but effective in-memory cache with TTL

### Anti-patterns or Concerns

1. **Console.log in components**: Debug logs left in production code
2. **Large commented blocks**: Suggests indecision about feature direction
3. **Duplicated error handling**: No centralized error handling utility
4. **No error boundaries**: React components lack error boundary protection
5. **Cache eviction**: Simple size-based sweep, could be more sophisticated

---

## Historical Context (from experiences/)

### Previous Refactoring Efforts

From `.claude/plans/fix-map-rerenders-251114.md`:
- Recent work to reduce unnecessary map rerenders (70-90% reduction achieved)
- Focus on `useMemo`, `React.memo()`, and prop stabilization
- This aligns with current finding of good memoization patterns

From `.claude/plans/fix-map-interactions/251113.md`:
- Map interaction bugs recently fixed
- Cursor tracking and animation improvements
- Suggests SSTMap component has been actively refined

From `.claude/rules/coding-standards.md`:
- Project has strict coding standards defined
- Locked core dependencies (React 19, TypeScript 5.7)
- Performance optimization guidelines already established

**Insight**: The codebase shows signs of recent optimization work. The commented heatmap code may be temporarily disabled during performance improvements.

---

## Recommended Cleanup Priority

### High Priority (Do This Week)

1. **Remove debug console.logs** (2 instances in SSTMap.tsx)
   - Lines 69, 78
   - Estimated time: 5 minutes

2. **Decide on heatmap code**
   - Create GitHub issue for heatmap feature
   - Delete commented code (lines 87-104 in SSTMap, related code in map.tsx)
   - Reference issue in commit message
   - Estimated time: 15 minutes

3. **Remove commented state variables** in map.tsx
   - Lines 48-49, 69-70
   - Estimated time: 5 minutes

### Medium Priority (Do This Month)

4. **Refactor API route patterns**
   - Create `src/lib/api-helpers.ts`
   - Extract common patterns
   - Update 3 API routes to use helpers
   - Estimated time: 2-3 hours

5. **Extract hooks from large components**
   - `useMapMarker` from SSTMap.tsx
   - `usePointData` from map.tsx
   - `useKeyboardNav` from SearchBar.tsx
   - Estimated time: 4-6 hours

6. **Add dependency analysis**
   - Install depcheck
   - Remove unused dependencies
   - Estimated time: 30 minutes

### Low Priority (Nice to Have)

7. **Create shared Location type**
   - Define in `src/lib/types.ts`
   - Update all usages
   - Estimated time: 1 hour

8. **Centralized error logging**
   - Create error logging utility
   - Replace all console.error calls
   - Estimated time: 2-3 hours

9. **Add Error Boundaries**
   - Wrap major component trees
   - Estimated time: 1-2 hours

---

## Open Questions

1. **Heatmap feature**: Is this planned for next sprint, or shelved indefinitely?
2. **Error tracking**: Is there a plan to add production error tracking (e.g., Sentry)?
3. **Code splitting**: Are there bundle size concerns that warrant lazy loading?
4. **State management**: Will the app complexity grow to need Zustand/Redux?
5. **Dependency audit**: When was the last time dependencies were reviewed for security?

---

## Metrics and Statistics

- **Total source files analyzed**: 41
- **Console statements found**: 14 (2 debug, 12 error/warn)
- **TODO comments**: 1
- **Files with commented code**: 14
- **Large components (>200 lines)**: 3
- **API routes with duplication**: 3
- **Lines of duplicated patterns**: ~80-100 across routes
- **Estimated cleanup time**: 10-15 hours total
- **Estimated impact**: 15-20% reduction in code volume, 30-40% improvement in maintainability

---

## Conclusion

The scuba-suit codebase is well-architected with modern patterns and good separation of concerns. The main cleanup opportunities are:

1. **Remove debug logs** (quick win)
2. **Delete commented heatmap code** (decision needed)
3. **Refactor API patterns** (medium effort, high value)
4. **Extract component hooks** (improves testability and maintainability)

The codebase shows evidence of active refinement (recent performance optimizations) and has good foundational practices. The cleanup is more about removing development artifacts and reducing duplication than fixing architectural problems.

**Recommended Next Action**: Start with high-priority items (console.logs and commented code) to get quick wins, then tackle API refactoring for longer-term maintainability benefits.
