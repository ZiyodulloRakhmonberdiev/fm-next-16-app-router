"use client"

import { useMemo } from "react"
import type { AppLocale } from "@/shared/common/lib/locale-api"
import {
  getCategoryNameFromApi,
  usePublicCategoriesQuery,
  type PublicCategory,
} from "./public-categories-query"

/**
 * Tanlangan locale bo‘yicha kategoriya nomi (`/api/categories` dan).
 * Yuklanish / bo‘sh ro‘yxatda `fallback` (odatda `item.category`).
 */
export function useCategoryLabel(
  categorySlug: string,
  locale: AppLocale,
  fallback?: string
): string {
  const { data: categories = [], isPending } = usePublicCategoriesQuery()
  return useMemo(() => {
    const fb = fallback ?? categorySlug
    if (isPending) return fb
    if (categories.length === 0) return fb
    return getCategoryNameFromApi(categories, categorySlug, locale)
  }, [isPending, categories, categorySlug, locale, fallback])
}

/** Ro‘yxat ichida `.map` uchun — hookni har elementda chaqirib bo‘lmaydi. */
export function getCategoryLabelForNewsItem(
  categories: PublicCategory[],
  isPending: boolean,
  item: { categorySlug: string; category: string },
  locale: AppLocale
): string {
  if (isPending) return item.category
  if (categories.length === 0) return item.category
  return getCategoryNameFromApi(categories, item.categorySlug, locale)
}
