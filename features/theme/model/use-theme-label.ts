"use client"

import { useMemo } from "react"
import type { AppLocale } from "@/shared/common/lib/locale-api"
import {
  getThemeNameByIdFromApi,
  usePublicThemesQuery,
  type PublicTheme,
} from "./public-themes-query"

export function useThemeLabel(themeId: string, locale: AppLocale, fallback?: string): string {
  const { data: themes = [], isPending } = usePublicThemesQuery()
  return useMemo(() => {
    const fb = fallback ?? themeId
    if (!themeId) return ""
    if (isPending) return fb
    if (themes.length === 0) return fb
    return getThemeNameByIdFromApi(themes, themeId, locale)
  }, [fallback, isPending, locale, themeId, themes])
}

export function getThemeLabelForNewsItem(
  themes: PublicTheme[],
  isPending: boolean,
  item: { themeId?: string },
  locale: AppLocale
): string {
  if (!item.themeId) return ""
  if (isPending) return item.themeId
  if (themes.length === 0) return item.themeId
  return getThemeNameByIdFromApi(themes, item.themeId, locale)
}

