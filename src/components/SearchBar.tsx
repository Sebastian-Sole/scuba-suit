import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { DateTimePicker } from '@/components/DateTimePicker'

interface SearchResult {
  lat: number
  lon: number
  display: string
}

export interface SearchBarProps {
  onSelectLocation: (lat: number, lon: number, display: string) => void
  selectedDateTime?: string
  onDateTimeChange?: (datetime: string) => void
  displayText?: string
}

export const SearchBar = memo(function SearchBar({ onSelectLocation, selectedDateTime, onDateTimeChange, displayText }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Array<SearchResult>>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isUserTyping, setIsUserTyping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<Array<HTMLButtonElement | null>>([])

  // Update query when displayText changes, but only if user is not actively typing
  useEffect(() => {
    if (displayText !== undefined && !isUserTyping) {
      setQuery(displayText)
    }
  }, [displayText, isUserTyping])

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setShowResults(false)
      return
    }

    setIsSearching(true)

    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`)
      if (!response.ok) throw new Error('Search failed')

      const data = await response.json()
      setResults(data.locations || [])
      setShowResults(true)
    } catch (err) {
      console.error('Search error:', err)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounce search as user types (only when user is actively typing)
  useEffect(() => {
    if (!isUserTyping) return // Don't search when displayText updates the query

    const timer = setTimeout(() => {
      handleSearch(query)
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [query, handleSearch, isUserTyping])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // If a result is selected via keyboard, use that
    if (selectedIndex >= 0 && selectedIndex < results.length) {
      const result = results[selectedIndex]
      onSelectLocation(result.lat, result.lon, result.display)
      setShowResults(false)
      setResults([])
      setSelectedIndex(-1)
      setIsUserTyping(false)
    } else {
      handleSearch(query)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev,
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Escape':
        e.preventDefault()
        setShowResults(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Auto-scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current[selectedIndex]) {
      resultsRef.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      })
    }
  }, [selectedIndex])

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsUserTyping(true)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Search for a location..."
          aria-label="Search for a location"
          aria-autocomplete="list"
          aria-controls="search-results"
          aria-expanded={showResults && results.length > 0}
          className="flex-1 px-4 py-2 text-base rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]"
        />
        <div className="flex gap-2">
          {selectedDateTime && onDateTimeChange && (
            <DateTimePicker
              value={selectedDateTime}
              onChange={onDateTimeChange}
            />
          )}
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] min-w-[44px]"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Results dropdown */}
      {showResults && results.length > 0 && (
        <div
          id="search-results"
          role="listbox"
          className="absolute top-full mt-2 w-full bg-background rounded-lg shadow-lg border z-50 max-h-64 overflow-y-auto"
        >
          {results.map((result, i) => (
            <button
              key={i}
              ref={(el) => {
                resultsRef.current[i] = el
              }}
              role="option"
              aria-selected={i === selectedIndex}
              onClick={() => {
                onSelectLocation(result.lat, result.lon, result.display)
                setShowResults(false)
                setResults([])
                setSelectedIndex(-1)
                setIsUserTyping(false)
              }}
              className={`w-full px-4 py-3 text-left transition-colors border-b last:border-b-0 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary min-h-[44px] ${
                i === selectedIndex ? 'bg-accent' : 'hover:bg-accent/50'
              }`}
            >
              <div className="text-sm font-medium">{result.display}</div>
              <div className="text-xs text-muted-foreground">
                {result.lat.toFixed(4)}, {result.lon.toFixed(4)}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
})
