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
      <div className="container flex min-h-16 items-center gap-4 py-3 px-4 md:px-8">
        {/* Mobile Menu - Always on the right on mobile */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden ml-auto order-last">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
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

            {/* Mobile search bar - only on map route */}
            {showNavbarContent && navbarContent && (
              <div className="mt-6 pb-4 border-b">{navbarContent}</div>
            )}

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
        <Link to="/" className="font-bold text-xl shrink-0">
          Dive Intel
        </Link>

        {/* Desktop Navigation - Full width layout */}
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
          {/* Left: Nav Links */}
          <NavigationMenu className="ml-6">
            <NavigationMenuList>
              {navItems.map(({ to, label }) => (
                <NavigationMenuItem key={to}>
                  <Link to={to}>
                    {({ isActive }) => (
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                        active={isActive}
                      >
                        {label}
                      </NavigationMenuLink>
                    )}
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Center: SearchBar - only on map route */}
          {showNavbarContent && navbarContent && (
            <div className="flex-1 max-w-2xl mx-6">{navbarContent}</div>
          )}

          {/* Right: Theme Toggle */}
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
