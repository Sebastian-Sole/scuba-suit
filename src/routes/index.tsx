import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { Calendar, MapPin, Thermometer } from 'lucide-react'
import { SearchBar } from '@/components/SearchBar'
import { getTodayISO } from '@/lib/dates'

export const Route = createFileRoute('/')({
  component: LandingPage,
  head: () => ({
    meta: [
      {
        title: 'Dive Intel - Plan Your Scuba Diving Trip with Temperature Data',
      },
      {
        name: 'description',
        content:
          'Find the perfect wetsuit for your next dive. Get real-time ocean temperature data, historical trends, and forecasts for scuba diving locations worldwide.',
      },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Dive Intel',
          description:
            'Scuba diving trip planner with ocean temperature data and wetsuit recommendations',
          applicationCategory: 'UtilityApplication',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          featureList: [
            'Ocean temperature data',
            'Wetsuit recommendations',
            'Dive site search',
            'Historical temperature trends',
            'Temperature forecasts',
          ],
        }),
      },
    ],
  }),
})

function LandingPage() {
  const navigate = useNavigate()
  const [selectedDateTime, setSelectedDateTime] = useState(() => {
    const today = getTodayISO()
    return `${today}T12:00:00`
  })
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number; display: string } | null>(null)

  const handleSelectLocation = useCallback((lat: number, lon: number, display: string) => {
    // Just set the location, don't navigate yet
    setSelectedLocation({ lat, lon, display })
  }, [])

  const handleSearch = useCallback((location?: { lat: number; lon: number; display: string }) => {
    // Use the passed location or fall back to the stored selectedLocation
    const locationToUse = location || selectedLocation
    if (!locationToUse) return

    // Navigate to map with location
    navigate({
      to: '/map',
      search: { lat: locationToUse.lat, lon: locationToUse.lon, datetime: selectedDateTime }
    })
  }, [navigate, selectedLocation, selectedDateTime])

  const handleDateTimeChange = useCallback((datetime: string) => {
    setSelectedDateTime(datetime)
  }, [])

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-cyan-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-[url('/ocean-pattern.svg')] opacity-10" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Plan Your Perfect Scuba Diving Trip
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-cyan-50">
              Get real ocean temperature data and wetsuit recommendations for any dive location worldwide
            </p>

            {/* Search Input CTA */}
            <div className="bg-card text-card-foreground rounded-xl shadow-2xl p-6 max-w-2xl mx-auto border">
              <label className="block text-left font-medium mb-4">
                Where and when are you diving?
              </label>
              <SearchBar
                onSelectLocation={handleSelectLocation}
                selectedDateTime={selectedDateTime}
                onDateTimeChange={handleDateTimeChange}
                onSearch={handleSearch}
                displayText={selectedLocation?.display || ''}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Everything You Need to Plan Your Dive
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-100 text-cyan-600 mb-4">
                <Thermometer className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Accurate Temperature Data</h3>
              <p className="text-muted-foreground">
                Access historical ocean temperature data for any location worldwide. See 7-year trends and 7-day forecasts to plan the perfect dive.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Global Dive Site Coverage</h3>
              <p className="text-muted-foreground">
                Search any dive location, from tropical reefs to cold water wrecks. Get precise temperature data for your exact coordinates.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-600 mb-4">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Trip Planning</h3>
              <p className="text-muted-foreground">
                Compare temperatures across different dates and times. Find the best season for your scuba diving adventure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Choose the Right Wetsuit for Your Dive
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              Water temperature is crucial for scuba diving comfort and safety. Whether you're planning a tropical dive vacation or exploring local cold-water sites, knowing the exact ocean temperature helps you pack the right gear.
            </p>
            <p className="text-lg text-muted-foreground mb-6">
              Dive Intel provides accurate sea surface temperature data from NOAA satellites, giving you reliable information for wetsuit selection, drysuit planning, and overall dive preparation. Our tool shows both historical temperature trends and upcoming forecasts, so you can plan your scuba diving trips with confidence.
            </p>
            <div className="bg-background rounded-lg p-6 border">
              <h3 className="text-xl font-semibold mb-4">Common Wetsuit Thickness Guidelines</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong>Above 80°F (27°C):</strong> Shorty wetsuit or rash guard</li>
                <li><strong>75-80°F (24-27°C):</strong> 3mm full wetsuit</li>
                <li><strong>65-75°F (18-24°C):</strong> 5mm wetsuit</li>
                <li><strong>50-65°F (10-18°C):</strong> 7mm wetsuit or semi-dry suit</li>
                <li><strong>Below 50°F (10°C):</strong> Drysuit recommended</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-cyan-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Plan Your Next Dive?
          </h2>
          <p className="text-xl mb-8 text-cyan-50 max-w-2xl mx-auto">
            Get instant temperature data and gear recommendations for any dive location
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-8 py-4 bg-white text-cyan-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
          >
            Search Dive Locations
          </button>
        </div>
      </section>
    </div>
  )
}
