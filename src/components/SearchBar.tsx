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
  onSearch?: (location?: { lat: number; lon: number; display: string }) => void // Optional callback when search button is clicked
}

export const SearchBar = memo(function SearchBar({ onSelectLocation, selectedDateTime, onDateTimeChange, displayText, onSearch }: SearchBarProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // If a result is selected via keyboard, use that
    if (selectedIndex >= 0 && selectedIndex < results.length) {
      const result = results[selectedIndex]
      onSelectLocation(result.lat, result.lon, result.display)
      setShowResults(false)
      setResults([])
      setSelectedIndex(-1)
      setIsUserTyping(false)
      // If onSearch is provided, call it with the location data
      if (onSearch) {
        onSearch({ lat: result.lat, lon: result.lon, display: result.display })
      }
    } else if (query.trim()) {
      // Infer location from query: fetch results and auto-select first match
      setIsSearching(true)
      try {
        const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
        if (!response.ok) throw new Error('Search failed')

        const data = await response.json()
        const locations = data.locations || []

        if (locations.length > 0) {
          // Auto-select the first/best result
          const firstResult = locations[0]
          onSelectLocation(firstResult.lat, firstResult.lon, firstResult.display)
          setQuery(firstResult.display)
          setShowResults(false)
          setResults([])
          setSelectedIndex(-1)
          setIsUserTyping(false)

          // If onSearch is provided (landing page), call it with the location data
          if (onSearch) {
            onSearch({ lat: firstResult.lat, lon: firstResult.lon, display: firstResult.display })
          }
        } else {
          // No results found
          setResults([])
          setShowResults(false)
        }
      } catch (err) {
        console.error('Search error:', err)
        setResults([])
        setShowResults(false)
      } finally {
        setIsSearching(false)
      }
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
          className="w-full sm:flex-1 px-3 py-1.5 text-sm md:text-base rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px] md:min-h-[40px]"
        />
        {selectedDateTime && onDateTimeChange && (
          <div className="flex gap-2">
            <DateTimePicker
              value={selectedDateTime}
              onChange={onDateTimeChange}
            />
          </div>
        )}
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="w-full sm:w-auto px-3 py-1.5 text-sm md:text-base bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] md:min-h-[40px] md:min-w-[100px]"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
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
                setQuery(result.display)
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
