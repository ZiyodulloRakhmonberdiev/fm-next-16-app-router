"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { PublicCategory } from "../lib/category-utils"

const PublicCategoriesInitialContext = createContext<
  PublicCategory[] | undefined
>(undefined)

export function PublicCategoriesInitialProvider({
  value,
  children,
}: {
  value: PublicCategory[] | undefined
  children: ReactNode
}) {
  return (
    <PublicCategoriesInitialContext.Provider value={value}>
      {children}
    </PublicCategoriesInitialContext.Provider>
  )
}

export function usePublicCategoriesInitial() {
  return useContext(PublicCategoriesInitialContext)
}
