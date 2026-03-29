"use client"

import { useQuery } from "@tanstack/react-query"
import { usePublicSiteSettingsQuery } from "@/shared/server/public-site-settings-query"
import type { PublicTheme } from "../lib/theme-utils"

async function fetchPublicThemes(): Promise<PublicTheme[]> {
  const res = await fetch("/api/themes")
  if (!res.ok) {
    throw new Error("Themes fetch failed")
  }
  const data = (await res.json()) as PublicTheme[]
  if (!Array.isArray(data)) return []
  return data
}

export {
  getThemeListingHeading,
  getThemeNameByIdFromApi,
  getThemeBySlug,
} from "../lib/theme-utils"
export type { ThemeListingHeading } from "../lib/theme-utils"
export type { PublicTheme }

export function usePublicThemesQuery() {
  const { data: settings } = usePublicSiteSettingsQuery()
  const enabled = (settings?.clientDelivery.mode ?? "normal") !== "server-off"

  return useQuery({
    queryKey: ["public-themes"],
    queryFn: fetchPublicThemes,
    staleTime: 60_000,
    enabled,
    placeholderData: [],
  })
}

