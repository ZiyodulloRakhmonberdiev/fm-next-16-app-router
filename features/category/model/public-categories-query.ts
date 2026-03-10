"use client"

import { useQuery } from "@tanstack/react-query"
import type { AppLocale } from "@/shared/common/lib/locale-api"
import type { LocaleMap } from "@/shared/common/lib/locale-types"

export type PublicCategory = {
  _id?: string
  slug: string
  href?: string
  name: LocaleMap
}

async function fetchPublicCategories(): Promise<PublicCategory[]> {
  const res = await fetch("/api/categories")
  if (!res.ok) {
    throw new Error("Categories fetch failed")
  }

  const data = (await res.json()) as PublicCategory[]
  return Array.isArray(data) ? data : []
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
  return useQuery({
    queryKey: ["public-categories"],
    queryFn: fetchPublicCategories,
    staleTime: 60_000,
  })
}
