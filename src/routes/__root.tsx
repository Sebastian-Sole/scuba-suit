import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Navbar from '../components/Navbar'
import { ThemeProvider } from '../components/ThemeProvider'
import { NavbarProvider } from '../components/NavbarContext'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Dive Intel - Scuba Diving Temperature Data & Wetsuit Recommendations',
      },
      {
        name: 'description',
        content:
          'Plan your scuba diving trips with accurate ocean temperature data and wetsuit recommendations for dive sites worldwide. Get historical trends and forecasts for perfect dive planning.',
      },
      {
        name: 'keywords',
        content:
          'scuba diving, ocean temperature, wetsuit recommendations, dive planning, sea temperature, dive sites, scuba gear, diving trip planner, water temperature forecast, diving suit guide',
      },
      // Open Graph tags
      {
        property: 'og:title',
        content: 'Dive Intel - Scuba Diving Temperature Data & Wetsuit Recommendations',
      },
      {
        property: 'og:description',
        content:
          'Get accurate ocean temperature data and wetsuit recommendations for any dive location worldwide. Plan your perfect scuba diving trip.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      // Twitter Card tags
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'Dive Intel - Scuba Diving Temperature Data',
      },
      {
        name: 'twitter:description',
        content:
          'Get accurate ocean temperature data and wetsuit recommendations for dive sites worldwide.',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  component: RootComponent,
  shellComponent: RootDocument,
})

function RootComponent() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="dive-intel-theme">
      <NavbarProvider>
        <div className="h-screen bg-background flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
          <footer className="border-t px-4 py-2 text-xs text-muted-foreground text-center">
            Geocoding by{' '}
            <a
              href="https://www.geoapify.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              Geoapify
            </a>
          </footer>
        </div>
      </NavbarProvider>
    </ThemeProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          key="theme-script"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{const stored=localStorage.getItem('dive-intel-theme');const validThemes=['light','dark','system'];const theme=validThemes.includes(stored)?stored:'system';const root=document.documentElement;if(theme==='system'){root.className=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}else{root.className=theme;}}catch(e){}})();`,
          }}
        />
        <HeadContent />
      </head>
      <body>
        {children}
        {import.meta.env.DEV && (
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        )}
        <Scripts />
      </body>
    </html>
  )
}
