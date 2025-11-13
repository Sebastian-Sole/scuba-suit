/**
 * Dive suit recommendation logic based on surface temperature
 * Thresholds are scuba-oriented and conservative
 */

export type SuitType =
  | 'shorty'
  | 'full-3mm'
  | 'full-5mm'
  | 'full-7mm'
  | 'drysuit'

export interface Suit {
  type: SuitType
  notes?: string
}

export interface UserPrefs {
  runsCold?: boolean
  diveMinutes?: number
}

/**
 * Returns suit recommendation for given temperature
 * Applies optional user preference adjustments
 */
export function suitForTemp(tempC: number, prefs: UserPrefs = {}): Suit {
  // Apply preference-based bias
  const bias =
    (prefs.runsCold ? -1 : 0) +
    (prefs.diveMinutes && prefs.diveMinutes > 45 ? -0.5 : 0)

  const adjustedTemp = tempC + bias

  if (adjustedTemp >= 26) {
    return { type: 'shorty', notes: '≥26°C - warm tropical waters' }
  }

  if (adjustedTemp >= 23) {
    return { type: 'full-3mm', notes: '23–26°C - warm waters' }
  }

  if (adjustedTemp >= 20) {
    return {
      type: 'full-5mm',
      notes: '20–23°C - temperate waters',
    }
  }

  if (adjustedTemp >= 16) {
    return {
      type: 'full-7mm',
      notes: '16–20°C - cold waters, add hood/gloves',
    }
  }

  if (adjustedTemp >= 10) {
    return {
      type: 'drysuit',
      notes: '10–16°C - cold waters, drysuit recommended',
    }
  }

  return {
    type: 'drysuit',
    notes: '<10°C - very cold waters, drysuit required',
  }
}

/**
 * Human-readable suit type labels
 */
export const SUIT_LABELS: Record<SuitType, string> = {
  shorty: 'Shorty (1-3mm)',
  'full-3mm': 'Full Wetsuit (3mm)',
  'full-5mm': 'Full Wetsuit (5mm)',
  'full-7mm': 'Full Wetsuit (7mm)',
  drysuit: 'Drysuit',
}
