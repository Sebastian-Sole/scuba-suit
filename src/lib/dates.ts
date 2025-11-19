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
 * Generate array of historical dates for previous N years with ±1 day variance
 * Returns dates in chronological order (oldest to newest)
 */
export function getHistoricalDates(dateISO: string, years: number): Array<string> {
  const dates: string[] = []

  // Loop from oldest to newest year
  for (let yearOffset = years; yearOffset >= 1; yearOffset--) {
    // For each year, generate date ±1 day in chronological order
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

/**
 * Generate array of dates around selected date (±daysRange)
 */
export function getForecastDates(dateISO: string, daysRange: number): Array<string> {
  const dates: string[] = []

  for (let dayOffset = -daysRange; dayOffset <= daysRange; dayOffset++) {
    dates.push(addDays(dateISO, dayOffset))
  }

  return dates
}

/**
 * Validate ISO date format (basic check)
 */
export function isValidISODate(dateISO: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateISO) && !isNaN(Date.parse(dateISO))
}
