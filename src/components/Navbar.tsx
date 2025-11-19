import { Link, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
import { Home, Info, MapPin, Menu, ShoppingBag } from 'lucide-react'
import { useNavbarContent } from './NavbarContext'
import { ThemeToggle } from './ThemeToggle'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/map', label: 'Map', icon: MapPin },
  { to: '/about', label: 'About', icon: Info },
  { to: '/store', label: 'Store', icon: ShoppingBag },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { navbarContent } = useNavbarContent()
  const routerState = useRouterState()

  // Only show navbar content on /map route
  const showNavbarContent = routerState.location.pathname === '/map'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-none flex h-16 items-center gap-2 md:gap-4 px-3 md:px-8">
        {/* Mobile Menu - Show on <md normally, but on map page show on <lg */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className={showNavbarContent ? "lg:hidden ml-auto order-last" : "md:hidden ml-auto order-last"}>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Open menu">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 font-bold text-xl"
                >
                  Dive Intel
                </Link>
              </SheetTitle>
            </SheetHeader>

            <nav className="flex flex-col gap-4 mt-6">
              {navItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                  activeProps={{
                    className:
                      'flex items-center gap-3 p-3 rounded-lg bg-primary text-primary-foreground transition-colors',
                  }}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 px-3">
                  <span className="text-sm font-medium">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Brand Name */}
        <Link to="/" className="font-bold text-lg md:text-xl shrink-0">
          Dive Intel
        </Link>

        {/* Desktop Navigation - Different layouts for map vs other pages */}
        {showNavbarContent ? (
          // Map page: Show inputs at md+, nav links at lg+ only
          <>
            {/* Nav Links - only show at lg+ on map page */}
            <NavigationMenu className="hidden lg:flex ml-6">
              <NavigationMenuList>
                {navItems.map(({ to, label }) => (
                  <NavigationMenuItem key={to}>
                    <NavigationMenuLink asChild>
                      <Link
                        to={to}
                        className={navigationMenuTriggerStyle()}
                        activeProps={{ 'data-active': 'true' }}
                      >
                        {label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            {/* SearchBar - show at sm+ (640px and above) */}
            <div className="hidden sm:flex sm:flex-1 sm:mx-4 md:mx-6">{navbarContent}</div>

            {/* Theme Toggle */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
          </>
        ) : (
          // Other pages: Normal layout at md+
          <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
            {/* Left: Nav Links */}
            <NavigationMenu className="ml-6">
              <NavigationMenuList>
                {navItems.map(({ to, label }) => (
                  <NavigationMenuItem key={to}>
                    <NavigationMenuLink asChild>
                      <Link
                        to={to}
                        className={navigationMenuTriggerStyle()}
                        activeProps={{ 'data-active': 'true' }}
                      >
                        {label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Right: Theme Toggle */}
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
