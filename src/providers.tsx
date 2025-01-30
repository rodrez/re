"use client"

import type React from "react"
import { useLocation } from "react-router"
import { CommandPaletteDialog } from "./components/command/dialog"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const location = useLocation()
  return (
    <>
      {children}
      {location.pathname !== "/" && <CommandPaletteDialog/>}
      
    </>
  )
}

