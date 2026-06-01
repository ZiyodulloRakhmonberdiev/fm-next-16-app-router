"use client"

import { useQuery } from "@tanstack/react-query"
import { publicCategoriesQueryKey } from "@/shared/common/lib/public-query-keys"
import { usePublicSiteSettingsQuery } from "@/shared/server/public-site-settings-query"
import { sortCategoriesByPriority, type PublicCategory } from "../lib/category-utils"
import { usePublicCategoriesInitial } from "./public-categories-initial"

export type { PublicCategory }

const PUBLIC_CATEGORIES_STALE_MS = 300_000

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

export function usePublicCategoriesQuery() {
  const initialCategories = usePublicCategoriesInitial()
  const { data: settings } = usePublicSiteSettingsQuery()
  const enabled =
    (settings?.clientDelivery.mode ?? "normal") !== "server-off" &&
    (settings?.clientDelivery.models.categories ?? true)

  return useQuery({
    queryKey: publicCategoriesQueryKey,
    queryFn: fetchPublicCategories,
    staleTime: PUBLIC_CATEGORIES_STALE_MS,
    enabled,
    initialData: initialCategories,
    placeholderData: initialCategories ?? [],
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}
