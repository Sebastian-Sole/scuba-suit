import { Link } from '@tanstack/react-router'
import { SUIT_LABELS, suitForTemp } from '@/lib/suit'

export interface SidebarRow {
  date: string
  tempC: number | null
  suit: {
    type: string
    notes?: string
  } | null
  kind?: 'historical' | 'selected' | 'forecast'
}

export interface SidebarTableProps {
  location: {
    lat: number
    lon: number
    display?: string
  }
  rows: Array<SidebarRow>
  stats: {
    mean: number
    min: number
    max: number
    p10: number
    p90: number
  } | null
  onClose: () => void
}

export function SidebarTable({
  location,
  rows,
  stats,
  onClose,
}: SidebarTableProps) {
  return (
    <>
      {/* Mobile backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-30 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar/Drawer */}
      <div className="fixed md:relative bottom-0 md:bottom-auto left-0 right-0 md:left-auto md:right-auto w-full md:w-96 h-[70vh] md:h-full bg-background shadow-xl overflow-y-auto z-40 md:z-auto rounded-t-2xl md:rounded-none border-l">
      {/* Header */}
      <div className="sticky top-0 bg-primary text-primary-foreground p-4 z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-1">
              {location.display || 'Selected Location'}
            </h2>
            <p className="text-sm opacity-90">
              {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="opacity-90 hover:opacity-100 transition-opacity"
            aria-label="Close sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="opacity-80">Mean</div>
              <div className="font-semibold">{stats.mean.toFixed(1)}°C</div>
            </div>
            <div>
              <div className="opacity-80">Range</div>
              <div className="font-semibold">
                {stats.min.toFixed(1)}-{stats.max.toFixed(1)}°C
              </div>
            </div>
            <div>
              <div className="opacity-80">P10-P90</div>
              <div className="font-semibold">
                {stats.p10.toFixed(1)}-{stats.p90.toFixed(1)}°C
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 font-semibold">
                Date
              </th>
              <th className="text-right py-2 font-semibold">
                Temp
              </th>
              <th className="text-right py-2 font-semibold">
                Suit
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isSelected = row.kind === 'selected'
              const isForecast = row.kind === 'forecast'

              return (
                <tr
                  key={i}
                  className={`border-b ${
                    isSelected ? 'bg-accent' : ''
                  }`}
                >
                  <td className="py-2">
                    {row.date}
                    {isForecast && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        (forecast)
                      </span>
                    )}
                  </td>
                  <td className="py-2 text-right font-mono">
                    {row.tempC !== null ? `${row.tempC.toFixed(1)}°C` : '—'}
                  </td>
                  <td className="py-2 text-right">
                    {row.suit ? (
                      <div className="flex flex-col items-end">
                        <span className="font-medium">
                          {SUIT_LABELS[row.suit.type as keyof typeof SUIT_LABELS]}
                        </span>
                        {row.suit.notes && (
                          <span className="text-xs text-muted-foreground">
                            {row.suit.notes.split(' - ')[0]}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Aggregate Recommendation */}
        {stats && (
          <div className="mt-6 p-4 bg-accent/50 rounded-lg border">
            <h3 className="text-sm font-semibold mb-3">
              Overall Recommendation
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Temperature:</span>
                <span className="text-sm font-semibold">
                  {stats.mean.toFixed(1)}°C
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Temperature Range:</span>
                <span className="text-sm font-semibold">
                  {stats.min.toFixed(1)}°C - {stats.max.toFixed(1)}°C
                </span>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm mb-2">
                  Recommended Suit:
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="text-base font-bold">
                      {SUIT_LABELS[suitForTemp(stats.mean).type]}
                    </div>
                    {suitForTemp(stats.mean).notes && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {suitForTemp(stats.mean).notes}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-3">
                  Based on average temperature over historical and forecast data.
                  Consider bringing backup options for temperature extremes.
                </div>
                <Link
                  to="/store"
                  search={{ category: 'Wetsuits' }}
                  className="mt-4 inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Shop for Suits
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  )
}
