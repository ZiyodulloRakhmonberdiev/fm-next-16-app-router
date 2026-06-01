"use client"

import { useQuery } from "@tanstack/react-query"
import { publicThemesQueryKey } from "@/shared/common/lib/public-query-keys"
import { usePublicSiteSettingsQuery } from "@/shared/server/public-site-settings-query"
import type { PublicTheme } from "../lib/theme-utils"

const PUBLIC_THEMES_STALE_MS = 300_000

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
    queryKey: publicThemesQueryKey,
    queryFn: fetchPublicThemes,
    staleTime: PUBLIC_THEMES_STALE_MS,
    enabled,
    placeholderData: [],
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}
