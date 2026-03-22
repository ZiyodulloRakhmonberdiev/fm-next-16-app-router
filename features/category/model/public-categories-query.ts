"use client"

import { useQuery } from "@tanstack/react-query"
import type { AppLocale } from "@/shared/common/lib/locale-api"
import type { LocaleMap } from "@/shared/common/lib/locale-types"
import { usePublicSiteSettingsQuery } from "@/shared/common/lib/public-site-settings-query"

export type PublicCategory = {
  _id?: string
  slug: string
  href?: string
  name: LocaleMap
  priority?: number
}

/** Yuqori `priority` birinchi (masalan bosh sahifa section tartibi). */
export function sortCategoriesByPriority(categories: PublicCategory[]): PublicCategory[] {
  return [...categories].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
}

async function fetchPublicCategories(): Promise<PublicCategory[]> {
  const res = await fetch("/api/categories")
  if (!res.ok) {
    throw new Error("Categories fetch failed")
  }

  const data = (await res.json()) as PublicCategory[]
  if (!Array.isArray(data)) return []
  return sortCategoriesByPriority(data)
}

export function getCategoryNameFromApi(
  categories: PublicCategory[],
  slug: string,
  locale: AppLocale
): string {
  const category = categories.find((item) => item.slug === slug)
  return category?.name?.[locale] ?? category?.name?.uz ?? slug
}

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
