"use client"

import { usePublicSiteSettingsQuery } from "@/shared/server/public-site-settings-query"
import { sortCategoriesByPriority, type PublicCategory } from "../lib/category-utils"

export type { PublicCategory }

async function fetchPublicCategories(): Promise<PublicCategory[]> {
  const res = await fetch("/api/categories")
  if (!res.ok) {
    throw new Error("Categories fetch failed")
  }

  const data = (await res.json()) as PublicCategory[]
  if (!Array.isArray(data)) return []
  return sortCategoriesByPriority(data)
}

export { getCategoryNameFromApi } from "../lib/category-utils"

import { useQuery } from "@tanstack/react-query"

export function usePublicCategoriesQuery() {
  const { data: settings } = usePublicSiteSettingsQuery()
  const enabled =
    (settings?.clientDelivery.mode ?? "normal") !== "server-off" &&
    (settings?.clientDelivery.models.categories ?? true)

  return useQuery({
    queryKey: ["public-categories"],
    queryFn: fetchPublicCategories,
    staleTime: 60_000,
    enabled,
    placeholderData: [],
  })
}
