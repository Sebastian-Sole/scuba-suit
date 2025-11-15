import {  createContext, useContext, useState } from 'react'
import type {ReactNode} from 'react';

interface NavbarContextType {
  navbarContent: ReactNode | null
  setNavbarContent: (content: ReactNode | null) => void
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined)

export function NavbarProvider({ children }: { children: ReactNode }) {
  const [navbarContent, setNavbarContent] = useState<ReactNode | null>(null)

  return (
    <NavbarContext.Provider value={{ navbarContent, setNavbarContent }}>
      {children}
    </NavbarContext.Provider>
  )
}

export function useNavbarContent() {
  const context = useContext(NavbarContext)
  if (context === undefined) {
    throw new Error('useNavbarContent must be used within a NavbarProvider')
  }
  return context
}
