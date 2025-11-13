/**
 * Date utility functions for SST data fetching
 */

/**
 * Add days to ISO date string (YYYY-MM-DD)
 */
export function addDays(dateISO: string, days: number): string {
  const d = new Date(dateISO + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/**
 * Get today's date in ISO format
 */
export function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Generate array of historical same-day dates for previous N years
 */
export function getHistoricalDates(dateISO: string, years: number): Array<string> {
  const year = Number(dateISO.slice(0, 4))
  const monthDay = dateISO.slice(5) // MM-DD

  return Array.from({ length: years }, (_, i) => {
    const historicalYear = year - (i + 1)
    return `${historicalYear}-${monthDay}`
  })
}

/**
 * Generate array of future dates for forecast
 */
export function getForecastDates(dateISO: string, days: number): Array<string> {
  return Array.from({ length: days }, (_, i) => addDays(dateISO, i + 1))
}

/**
 * Validate ISO date format (basic check)
 */
export function isValidISODate(dateISO: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateISO) && !isNaN(Date.parse(dateISO))
}
