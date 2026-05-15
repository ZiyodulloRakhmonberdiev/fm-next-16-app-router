"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { RawNewsItem } from "./types"

const PublicNewsInitialContext = createContext<RawNewsItem[] | undefined>(
  undefined
)

export function PublicNewsInitialProvider({
  value,
  children,
}: {
  value: RawNewsItem[] | undefined
  children: ReactNode
}) {
  return (
    <PublicNewsInitialContext.Provider value={value}>
      {children}
    </PublicNewsInitialContext.Provider>
  )
}

export function usePublicNewsInitial() {
  return useContext(PublicNewsInitialContext)
}
