import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router'
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
        title: 'Dive Intel - Find the Right Wetsuit',
      },
      {
        name: 'description',
        content:
          'Get wetsuit and drysuit recommendations based on real ocean temperatures worldwide.',
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
          <main className="flex-1 overflow-hidden">
            <Outlet />
          </main>
        </div>
      </NavbarProvider>
    </ThemeProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
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
        <Scripts />
      </body>
    </html>
  )
}
