# Date Range Display Update Implementation Plan

## Overview

Update the date range display logic to show more focused historical comparisons with day-to-day variability, and tighter forecast windows. This change reduces the total date range from 15 dates to 14 dates while providing more granular historical context.

**Changes:**
- Historical: From "last 7 years, same day" → "last 3 years, ±1 day for each year" (9 dates)
- Forecast: From "next 7 days" → "selected date ±2 days" (5 dates including selected)

## Current State Analysis

**Date Generation Functions** (`src/lib/dates.ts`):
- `getHistoricalDates(dateISO, years)` - Lines 24-32: Generates same calendar day for N previous years
- `getForecastDates(dateISO, days)` - Lines 37-39: Generates N sequential days after the selected date

**API Endpoint** (`src/routes/api/sst/point.ts`):
- Default parameters: `years=7`, `forecastDays=7` (lines 18-19)
- Creates three separate sections (lines 61-97):
  - Historical rows (7 dates with `kind: 'historical'`)
  - Selected row (1 date with `kind: 'selected'`)
  - Forecast rows (7 dates with `kind: 'forecast'`)
- Total: 15 dates displayed

**Current Example** (selecting Nov 19, 2025):
- Historical: Nov 19 for years 2024, 2023, 2022, 2021, 2020, 2019, 2018 (7 dates)
- Selected: Nov 19, 2025
- Forecast: Nov 20-26, 2025 (7 dates)

## Desired End State

**New Date Generation Logic:**

1. **Historical Dates** (9 dates):
   - For each of 3 previous years, show the selected date ±1 day
   - Example for Nov 19, 2025:
     ```
     Year 1 (2024): Nov 18, 2024 | Nov 19, 2024 | Nov 20, 2024
     Year 2 (2023): Nov 18, 2023 | Nov 19, 2023 | Nov 20, 2023
     Year 3 (2022): Nov 18, 2022 | Nov 19, 2022 | Nov 20, 2022
     ```

2. **Forecast Range** (5 dates including selected):
   - Show selected date ±2 days
   - Example for Nov 19, 2025:
     ```
     Nov 17, 2025 | Nov 18, 2025 | Nov 19, 2025 (selected) | Nov 20, 2025 | Nov 21, 2025
     ```
   - One of these 5 dates will have `kind: 'selected'`
   - Dates in the past/present: fetch real data
   - Dates in the future: fetch forecast data

3. **Total Display**: 14 dates (9 historical + 5 forecast)

### Verification Criteria

**Data Structure:**
- Historical rows: 9 dates, all marked `kind: 'historical'`
- Forecast rows: 5 dates, one marked `kind: 'selected'`, others marked `kind: 'forecast'`
- Selected date appears in forecast range, not as separate row

**Example Response** (selecting Nov 19, 2025):
```json
{
  "rows": [
    {"date": "2024-11-18", "kind": "historical", ...},
    {"date": "2024-11-19", "kind": "historical", ...},
    {"date": "2024-11-20", "kind": "historical", ...},
    {"date": "2023-11-18", "kind": "historical", ...},
    {"date": "2023-11-19", "kind": "historical", ...},
    {"date": "2023-11-20", "kind": "historical", ...},
    {"date": "2022-11-18", "kind": "historical", ...},
    {"date": "2022-11-19", "kind": "historical", ...},
    {"date": "2022-11-20", "kind": "historical", ...},
    {"date": "2025-11-17", "kind": "forecast", ...},
    {"date": "2025-11-18", "kind": "forecast", ...},
    {"date": "2025-11-19", "kind": "selected", ...},
    {"date": "2025-11-20", "kind": "forecast", ...},
    {"date": "2025-11-21", "kind": "forecast", ...}
  ]
}
```

## What We're NOT Doing

- NOT changing the date picker UI or constraints
- NOT changing the date format (still ISO 8601: YYYY-MM-DD)
- NOT changing the API response structure or field names
- NOT changing how temperatures are fetched or calculated
- NOT changing the suit recommendation logic
- NOT changing the sidebar table rendering logic
- NOT changing the map or grid endpoints (only point endpoint affected)
- NOT changing caching behavior

## Implementation Approach

The changes are focused on two core functions in `src/lib/dates.ts` and the logic in `src/routes/api/sst/point.ts`. The strategy is to:

1. Update date generation utilities to produce the new date ranges
2. Modify the API endpoint to use new parameters and structure
3. Ensure the selected date is marked within the forecast range

The UI components don't need changes as they already handle the `kind` field for styling and labeling.

## Phase 1: Update Date Utility Functions

### Overview

Modify the date generation functions in `src/lib/dates.ts` to produce the new date ranges with ±1 day variance for historical dates and ±2 days for forecast dates.

### Changes Required

#### 1. Update `getHistoricalDates()` Function

**File**: `src/lib/dates.ts`

**Current Implementation** (lines 24-32):
```typescript
export function getHistoricalDates(dateISO: string, years: number): Array<string> {
  const year = Number(dateISO.slice(0, 4))
  const monthDay = dateISO.slice(5) // MM-DD

  return Array.from({ length: years }, (_, i) => {
    const historicalYear = year - (i + 1)
    return `${historicalYear}-${monthDay}`
  })
}
```

**New Implementation**:
```typescript
export function getHistoricalDates(dateISO: string, years: number): Array<string> {
  const dates: string[] = []

  for (let yearOffset = 1; yearOffset <= years; yearOffset++) {
    // For each year, generate date ±1 day
    for (let dayOffset = -1; dayOffset <= 1; dayOffset++) {
      const historicalDate = addDays(dateISO, dayOffset)
      const year = Number(historicalDate.slice(0, 4))
      const monthDay = historicalDate.slice(5) // MM-DD
      const historicalYear = year - yearOffset
      dates.push(`${historicalYear}-${monthDay}`)
    }
  }

  return dates
}
```

**Logic**:
- Outer loop: iterate through N years (1, 2, 3)
- Inner loop: for each year, create 3 dates (day-1, day, day+1)
- Use `addDays()` to handle date arithmetic (month/year boundaries)
- Result: 3 × N dates in chronological order

#### 2. Update `getForecastDates()` Function

**File**: `src/lib/dates.ts`

**Current Implementation** (lines 37-39):
```typescript
export function getForecastDates(dateISO: string, days: number): Array<string> {
  return Array.from({ length: days }, (_, i) => addDays(dateISO, i + 1))
}
```

**New Implementation**:
```typescript
export function getForecastDates(dateISO: string, daysRange: number): Array<string> {
  const dates: string[] = []

  for (let dayOffset = -daysRange; dayOffset <= daysRange; dayOffset++) {
    dates.push(addDays(dateISO, dayOffset))
  }

  return dates
}
```

**Logic**:
- Generate dates from -N to +N days around the selected date
- Includes the selected date itself (when dayOffset = 0)
- For `daysRange=2`: generates 5 dates (selected ±2 days)

**Parameter Semantics Change**:
- Old: `days` = number of days after selected date
- New: `daysRange` = range radius around selected date

### Success Criteria

#### Automated Verification

- [x] TypeScript compilation passes: `pnpm build`
- [ ] Unit tests pass (if any exist): `pnpm test`
- [ ] No linting errors: `pnpm lint`

#### Manual Verification

Test the utility functions in isolation:

**Historical dates test:**
```typescript
import { getHistoricalDates } from '@/lib/dates'

// Test case: Nov 19, 2025, 3 years
const result = getHistoricalDates('2025-11-19', 3)
console.log(result)
// Expected: [
//   '2024-11-18', '2024-11-19', '2024-11-20',
//   '2023-11-18', '2023-11-19', '2023-11-20',
//   '2022-11-18', '2022-11-19', '2022-11-20'
// ]
```

**Forecast dates test:**
```typescript
import { getForecastDates } from '@/lib/dates'

// Test case: Nov 19, 2025, ±2 days
const result = getForecastDates('2025-11-19', 2)
console.log(result)
// Expected: [
//   '2025-11-17', '2025-11-18', '2025-11-19',
//   '2025-11-20', '2025-11-21'
// ]
```

**Edge case - month boundaries:**
```typescript
// Test: Dec 1, 2025 (should handle Nov 30, Dec 1, Dec 2)
const result1 = getHistoricalDates('2025-12-01', 3)
// Should include '2024-11-30', '2024-12-01', '2024-12-02', etc.

// Test: Jan 1, 2025 (should handle Dec 31, Jan 1, Jan 2)
const result2 = getForecastDates('2025-01-01', 2)
// Should include '2024-12-30', '2024-12-31', '2025-01-01', '2025-01-02', '2025-01-03'
```

---

## Phase 2: Update API Endpoint Logic

### Overview

Modify the `/api/sst/point` endpoint to use the new default parameters and restructure the data fetching to integrate the selected date into the forecast range.

### Changes Required

#### 1. Update Default Parameters

**File**: `src/routes/api/sst/point.ts`

**Change** (lines 18-19):
```typescript
// OLD:
years: z.string().optional().default('7'),
forecastDays: z.string().optional().default('7'),

// NEW:
years: z.string().optional().default('3'),
forecastDays: z.string().optional().default('2'),
```

**Reasoning**:
- `years=3`: generate 3 years of historical data
- `forecastDays=2`: generate ±2 days around selected date (radius, not total count)

#### 2. Update API Call in Map Route

**File**: `src/routes/map.tsx`

**Change** (line 88):
```typescript
// OLD:
const url = `/api/sst/point?lat=${lat}&lon=${lon}&date=${date}&time=${time}&years=7&forecastDays=7`

// NEW:
const url = `/api/sst/point?lat=${lat}&lon=${lon}&date=${date}&time=${time}&years=3&forecastDays=2`
```

**Reasoning**: Use the new default values explicitly in the API call.

#### 3. Restructure Data Fetching Logic

**File**: `src/routes/api/sst/point.ts`

**Current Logic** (lines 61-97):
- Fetch historical dates (7 years, same day)
- Fetch selected date separately
- Fetch forecast dates (7 days after)
- Combine into three sections

**New Logic**:
- Fetch historical dates (3 years × 3 dates = 9 dates)
- Fetch forecast dates (selected ±2 days = 5 dates)
- Mark the selected date within forecast range
- Combine into two sections

**Implementation**:

```typescript
try {
  // Historical: 3 years × 3 dates (±1 day)
  const historicalDates = getHistoricalDates(date, years)
  const historicalTemps = await Promise.all(
    historicalDates.map((d) => fetchSSTDayAvg(lat, lon, d, hour)),
  )

  const historicalRows = historicalDates.map((d, i) => ({
    date: d,
    tempC: historicalTemps[i],
    suit: historicalTemps[i] !== null ? suitForTemp(historicalTemps[i]) : null,
    kind: 'historical' as const,
  }))

  // Forecast: selected date ±2 days (5 dates including selected)
  const forecastDates = getForecastDates(date, forecastDays)
  const forecastTemps = await Promise.all(
    forecastDates.map((d) => fetchSSTDayAvg(lat, lon, d, hour)),
  )

  const forecastRows = forecastDates.map((d, i) => ({
    date: d,
    tempC: forecastTemps[i],
    suit: forecastTemps[i] !== null ? suitForTemp(forecastTemps[i]) : null,
    kind: (d === date ? 'selected' : 'forecast') as const,
  }))

  // Combine: historical first, then forecast range
  const rows = [
    ...historicalRows.reverse(),  // Reverse for chronological order
    ...forecastRows,
  ]

  // Rest of the logic remains the same (stats calculation, caching, etc.)
  const validTemps = rows
    .filter((r) => r.tempC !== null)
    .map((r) => r.tempC as number)

  if (validTemps.length === 0) {
    return json(
      {
        error: 'No ocean temperature data available for this location. Try clicking on ocean areas or searching for coastal cities.',
        code: 'NO_DATA'
      },
      { status: 404 },
    )
  }

  const stats = validTemps.length
    ? {
        mean: validTemps.reduce((a, b) => a + b, 0) / validTemps.length,
        min: Math.min(...validTemps),
        max: Math.max(...validTemps),
        p10: quantile(validTemps, 0.1),
        p90: quantile(validTemps, 0.9),
      }
    : null

  const payload = {
    location: { lat, lon },
    rows,
    stats,
  }

  cache.set(cacheKey, payload, 1800)

  return json(payload, {
    headers: {
      'Cache-Control': 'public, max-age=1800',
    },
  })
} catch (err) {
  console.error('Point fetch error:', err)
  return json(
    { error: 'Failed to fetch SST data' },
    { status: 502 },
  )
}
```

**Key Changes**:
- Remove separate `selectedTemp` and `selectedRow` logic (lines 73-79)
- Selected date is now part of `forecastRows`
- Use ternary to mark selected date: `kind: (d === date ? 'selected' : 'forecast')`
- Combine only two sections: historical + forecast

### Success Criteria

#### Automated Verification

- [x] TypeScript compilation passes: `pnpm build`
- [x] Development server runs without errors: `pnpm dev`
- [ ] No linting errors: `pnpm lint`

#### Manual Verification

Test the API endpoint directly:

**Test 1: Current date (today)**
```bash
# Assuming today is Nov 19, 2025
curl "http://localhost:3000/api/sst/point?lat=40.7128&lon=-74.0060&date=2025-11-19&time=12:00"
```

Expected response:
- 9 historical dates (2024-11-18 to 2024-11-20, 2023-11-18 to 2023-11-20, 2022-11-18 to 2022-11-20)
- 5 forecast dates (2025-11-17 to 2025-11-21)
- One date marked `kind: 'selected'` (2025-11-19)
- Total: 14 rows

**Test 2: Future date**
```bash
# Select Nov 21, 2025 (2 days in future)
curl "http://localhost:3000/api/sst/point?lat=40.7128&lon=-74.0060&date=2025-11-21&time=12:00"
```

Expected response:
- 9 historical dates (2024-11-20 to 2024-11-22, 2023-11-20 to 2023-11-22, 2022-11-20 to 2022-11-22)
- 5 forecast dates (2025-11-19 to 2025-11-23)
- 2025-11-19 should be "real data" or "forecast" (depending on current date)
- 2025-11-21 marked `kind: 'selected'`

**Test 3: Month boundary**
```bash
# Select Dec 1, 2025
curl "http://localhost:3000/api/sst/point?lat=40.7128&lon=-74.0060&date=2025-12-01&time=12:00"
```

Expected response:
- Historical dates include Nov 30 and Dec 1-2 for previous years
- Forecast dates include Nov 29-30 and Dec 1-3, 2025
- No date arithmetic errors

---

## Phase 3: Verify UI Rendering

### Overview

Verify that the existing UI components (SidebarTable, DateTimePicker) correctly render the new data structure without requiring code changes.

### Changes Required

**No code changes needed** - the UI already handles:
- Different `kind` values for styling
- Variable number of rows
- Highlighting selected dates
- Showing "(forecast)" labels

### Success Criteria

#### Manual Verification

Test the full user flow in the browser:

**Test 1: Select a location on the map**
- [ ] Click on ocean area
- [ ] Sidebar displays temperature table
- [ ] Table shows 14 dates total
- [ ] Historical section shows 9 dates (3 years × 3 dates)
- [ ] Forecast section shows 5 dates including selected date
- [ ] Selected date is highlighted with accent background
- [ ] Future dates show "(forecast)" label
- [ ] Temperature values are reasonable
- [ ] Suit recommendations appear correctly

**Test 2: Change date using DateTimePicker**
- [ ] Click on date picker
- [ ] Select a different date (e.g., 3 days from now)
- [ ] Table updates with new historical and forecast ranges
- [ ] Selected date is correctly highlighted in the forecast section
- [ ] Date ranges are correct (±1 for historical, ±2 for forecast)

**Test 3: Search for a location**
- [ ] Use search box to find a city
- [ ] Select a result
- [ ] Map centers on location
- [ ] Sidebar shows temperature data with new date ranges

**Test 4: Edge cases**
- [ ] Select date at month boundary (e.g., Dec 1)
- [ ] Verify dates span correctly (Nov 30, Dec 1, Dec 2)
- [ ] Select date at year boundary (e.g., Jan 1)
- [ ] Verify dates span correctly (Dec 31, Jan 1, Jan 2)

**Test 5: Mobile responsiveness**
- [ ] Open on mobile device or resize browser
- [ ] Sidebar remains functional
- [ ] Table displays correctly with 14 rows
- [ ] Date picker works on touch

---

## Testing Strategy

### Automated Tests

Currently, the project may not have extensive test coverage for the date utilities. Consider adding unit tests for the modified functions:

**File**: `src/lib/dates.test.ts` (create if doesn't exist)

```typescript
import { describe, it, expect } from 'vitest'
import { getHistoricalDates, getForecastDates, addDays } from './dates'

describe('getHistoricalDates', () => {
  it('generates ±1 day for 3 years', () => {
    const result = getHistoricalDates('2025-11-19', 3)
    expect(result).toEqual([
      '2024-11-18', '2024-11-19', '2024-11-20',
      '2023-11-18', '2023-11-19', '2023-11-20',
      '2022-11-18', '2022-11-19', '2022-11-20',
    ])
    expect(result).toHaveLength(9)
  })

  it('handles month boundaries', () => {
    const result = getHistoricalDates('2025-12-01', 1)
    expect(result).toEqual([
      '2024-11-30', '2024-12-01', '2024-12-02',
    ])
  })

  it('handles year boundaries', () => {
    const result = getHistoricalDates('2025-01-01', 1)
    expect(result).toEqual([
      '2023-12-31', '2024-01-01', '2024-01-02',
    ])
  })
})

describe('getForecastDates', () => {
  it('generates ±2 days around selected date', () => {
    const result = getForecastDates('2025-11-19', 2)
    expect(result).toEqual([
      '2025-11-17', '2025-11-18', '2025-11-19',
      '2025-11-20', '2025-11-21',
    ])
    expect(result).toHaveLength(5)
  })

  it('handles month boundaries', () => {
    const result = getForecastDates('2025-12-01', 2)
    expect(result).toEqual([
      '2025-11-29', '2025-11-30', '2025-12-01',
      '2025-12-02', '2025-12-03',
    ])
  })
})
```

### Integration Tests

**Manual API testing:**
1. Use browser DevTools Network tab to inspect API responses
2. Verify response structure matches expected format
3. Check that all dates are valid ISO 8601 format
4. Verify `kind` field is correctly assigned

### Manual Testing Checklist

- [ ] Test multiple locations (coastal, open ocean, various latitudes)
- [ ] Test various dates (current, past, future, month/year boundaries)
- [ ] Verify temperature data is fetched correctly for all dates
- [ ] Verify suit recommendations match temperature thresholds
- [ ] Test error handling (land locations, invalid coordinates)
- [ ] Verify caching behavior (second click should use cached data)
- [ ] Test with different time values (morning, noon, evening)
- [ ] Check console for errors or warnings

---

## Performance Considerations

**Impact Analysis:**

1. **Network Requests**:
   - Current: 15 API calls to Open-Meteo (7 historical + 1 selected + 7 forecast)
   - New: 14 API calls (9 historical + 5 forecast)
   - **Change**: 1 fewer request (~7% reduction)

2. **Data Transfer**:
   - Marginal reduction in response payload size
   - Negligible impact on bandwidth

3. **Computation**:
   - Slightly more complex date generation logic (nested loops)
   - Impact: negligible, all calculations happen in microseconds
   - Date generation is not a performance bottleneck

4. **Caching**:
   - Cache key includes date parameters, so new requests will miss cache initially
   - Subsequent requests to same location/date/time will hit cache
   - **No changes needed to caching logic**

5. **UI Rendering**:
   - Rendering 14 rows instead of 15
   - Negligible performance difference

**Conclusion**: The changes have a slightly positive performance impact due to fewer API requests, with no negative performance implications.

---

## Migration Notes

**No database migration needed** - this is a pure API/computation change.

**No user data migration needed** - changes are server-side only.

**Breaking Changes**:
- None - the API response structure remains identical
- Existing clients will receive fewer rows, which is backward-compatible
- The `kind` field values remain the same ('historical', 'selected', 'forecast')

**Rollback Strategy**:
- Simple: revert the changes to `dates.ts` and `point.ts`
- No data loss or corruption risk
- Can roll back independently without affecting user data

**Gradual Rollout** (optional):
- Could add a query parameter to toggle between old and new behavior
- Not recommended unless A/B testing is desired

---

## References

- Date utility functions: `src/lib/dates.ts:24-39`
- API endpoint: `src/routes/api/sst/point.ts:61-97`
- Map route (API call): `src/routes/map.tsx:88`
- SidebarTable component: `src/components/SidebarTable.tsx:120-159`
- DateTimePicker component: `src/components/DateTimePicker.tsx`

**Dependencies**:
- Open-Meteo Marine API (external): no changes needed
- TanStack Router: no changes needed
- React components: no changes needed

**External Resources**:
- Open-Meteo API docs: https://open-meteo.com/en/docs/marine-weather-api
- ISO 8601 date format: https://en.wikipedia.org/wiki/ISO_8601
