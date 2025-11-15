import { createFileRoute } from '@tanstack/react-router'
import { Waves, Database, Heart } from 'lucide-react'

export const Route = createFileRoute('/about')({
  component: AboutPage,
  head: () => ({
    meta: [
      {
        title: 'About Dive Intel - Free Scuba Diving Trip Planner & Ocean Temperature Tool',
      },
      {
        name: 'description',
        content:
          'Learn about Dive Intel, the free scuba diving trip planner. Access ocean temperature data, dive site information, wetsuit recommendations, and dive planning tools for divers worldwide. NOAA satellite data for accurate dive trip planning.',
      },
      {
        name: 'keywords',
        content:
          'scuba diving planner, dive trip planner, ocean temperature, dive site temperature, wetsuit recommendations, scuba diving tool, dive planning, NOAA ocean data, sea temperature, scuba gear planning, dive vacation planner, dive site search, underwater temperature, diving conditions, scuba trip organizer',
      },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'About Dive Intel',
          description:
            'Dive Intel is a free scuba diving trip planning tool that provides ocean temperature data, wetsuit recommendations, and dive site information for scuba divers worldwide.',
          mainEntity: {
            '@type': 'Organization',
            name: 'Dive Intel',
            description:
              'Free scuba diving trip planner with ocean temperature data and dive site information',
            url: 'https://diveintel.com',
            logo: 'https://diveintel.com/logo.png',
            sameAs: [],
            knowsAbout: [
              'Scuba Diving',
              'Ocean Temperature',
              'Dive Trip Planning',
              'Wetsuit Selection',
              'Dive Sites',
              'Underwater Exploration',
              'Marine Weather',
              'Dive Safety',
            ],
            areaServed: {
              '@type': 'Place',
              name: 'Worldwide',
            },
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              description: 'Free ocean temperature data and dive planning tools',
            },
          },
        }),
      },
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What is Dive Intel?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Dive Intel is a free scuba diving trip planner that provides accurate ocean temperature data from NOAA satellites, helping divers plan their dive trips and choose the right wetsuit for any dive location worldwide.',
              },
            },
            {
              '@type': 'Question',
              name: 'How accurate is the ocean temperature data?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Dive Intel uses NOAA satellite-derived sea surface temperature data at 0.05-degree resolution, updated daily. This provides highly accurate temperature readings for dive planning and wetsuit selection.',
              },
            },
            {
              '@type': 'Question',
              name: 'Is Dive Intel free to use?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes, Dive Intel is completely free for all scuba divers. We provide unlimited access to ocean temperature data, historical trends, forecasts, and dive site information at no cost.',
              },
            },
            {
              '@type': 'Question',
              name: 'What dive sites does Dive Intel cover?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Dive Intel provides ocean temperature data for dive sites worldwide, from tropical reefs to cold water wrecks. You can search any coordinates globally to get temperature information for your scuba diving trip.',
              },
            },
          ],
        }),
      },
    ],
  }),
})

function AboutPage() {
  return (
    <div className="h-full overflow-y-auto">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-600 to-blue-800 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About Dive Intel - Your Free Scuba Diving Trip Planner
            </h1>
            <p className="text-xl text-cyan-50">
              Professional ocean temperature data and dive planning tools for scuba divers worldwide
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Helping Scuba Divers Plan Better Dive Trips</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Dive Intel was created to help scuba divers make informed decisions about their dive trips and dive vacations.
              We believe that accurate, accessible ocean temperature data and dive site information should be available to every diver,
              whether you're planning a tropical scuba diving vacation, a cold water wreck dive, or exploring your local dive sites.
              Our dive trip planning tool helps you choose the right wetsuit, plan your diving schedule, and prepare for optimal diving conditions.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Essential Tools for Scuba Diving Trip Planning</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-background rounded-lg p-6 border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-100 text-cyan-600 mb-4">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Accurate Ocean Temperature Data</h3>
              <p className="text-muted-foreground">
                Our sea surface temperature data comes from NOAA satellite observations, providing scuba divers with accurate
                and up-to-date ocean conditions for any dive site worldwide. Perfect for dive trip planning and wetsuit selection.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-background rounded-lg p-6 border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                <Waves className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Worldwide Dive Site Information</h3>
              <p className="text-muted-foreground">
                From tropical coral reef diving at the Great Barrier Reef to cold water kelp forest dives in California,
                access comprehensive temperature data for scuba diving sites across the entire globe.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-background rounded-lg p-6 border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 text-teal-600 mb-4">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Free Dive Planning Tool</h3>
              <p className="text-muted-foreground">
                Dive Intel is completely free for all divers. We're passionate about making professional dive trip planning tools accessible
                to everyone in the scuba diving and underwater exploration community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Source Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">Professional-Grade Ocean Data for Scuba Diving</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground mb-4">
              Dive Intel uses sea surface temperature data from the National Oceanic and Atmospheric
              Administration (NOAA). This satellite-derived ocean temperature data provides accurate readings
              at a 0.05-degree resolution, updated daily for optimal dive trip planning.
            </p>
            <p className="text-lg text-muted-foreground mb-6">
              We provide scuba divers with access to 7 years of historical temperature data and 7-day forecasts,
              allowing you to understand seasonal diving trends, plan dive vacations, and choose the perfect
              wetsuit or drysuit for your underwater adventures.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Perfect for All Types of Scuba Diving</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-background rounded-lg p-6 border">
              <h3 className="text-lg font-semibold mb-3">Recreational Scuba Diving</h3>
              <p className="text-muted-foreground">
                Plan your recreational dive trips with accurate water temperature data. Choose the right wetsuit
                thickness for tropical reef diving, temperate wreck exploration, or cold water diving adventures.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 border">
              <h3 className="text-lg font-semibold mb-3">Dive Vacation Planning</h3>
              <p className="text-muted-foreground">
                Planning a scuba diving vacation? Compare ocean temperatures across different destinations and
                seasons to find the best time for your dive trip to the Caribbean, Red Sea, Pacific, or anywhere worldwide.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 border">
              <h3 className="text-lg font-semibold mb-3">Technical Diving Expeditions</h3>
              <p className="text-muted-foreground">
                Technical divers need precise environmental data. Our detailed temperature information helps you
                prepare for deep dives, cave diving, and wreck penetration with the appropriate thermal protection.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 border">
              <h3 className="text-lg font-semibold mb-3">Dive Shop & Liveaboard Planning</h3>
              <p className="text-muted-foreground">
                Dive professionals, liveaboard operators, and dive centers can use our data to advise customers
                on wetsuit rentals and help divers prepare for their underwater experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Keywords Section for SEO */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">Why Divers Trust Dive Intel</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground mb-4">
              Whether you're a beginner diver planning your first open water dive, an experienced recreational diver
              organizing a dive vacation, or a technical diver preparing for challenging underwater exploration,
              Dive Intel provides the ocean temperature information you need.
            </p>
            <p className="text-lg text-muted-foreground mb-4">
              Our dive planning tool helps with wetsuit selection, drysuit planning, dive site research, and
              understanding seasonal water temperature variations. From tropical scuba diving destinations to
              cold water dive sites, wreck diving locations to coral reef exploration, we provide accurate
              sea temperature data for every type of diving adventure.
            </p>
            <p className="text-lg text-muted-foreground">
              Join thousands of scuba divers worldwide who use Dive Intel to plan safer, more comfortable dive trips.
              Start planning your next underwater adventure with confidence using our free ocean temperature data and
              dive site information tools.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
