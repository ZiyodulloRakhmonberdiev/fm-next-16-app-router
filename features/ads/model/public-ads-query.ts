"use client"

import { useQuery } from "@tanstack/react-query"

export type PublicAd = {
  _id: string
  type: "content" | "image"
  placement?: "header_top_full" | "sidebar_widget" | "home_bottom_full" | "article_bottom_full"
  placements?: Array<"header_top_full" | "sidebar_widget" | "home_bottom_full" | "article_bottom_full">
  media?: string | string[]
  mediaMobile?: string | string[]
  logo?: string
  siteName?: string
  title?: string
  description?: string
  links?: Array<{
    label: string
    href: string
  }>
  adUrl?: string
  advertiserUrl?: string
  adInfoUrl?: string
  advertiseWithUsUrl?: string
  active: boolean
  priority: number
  displaySeconds?: number
}

export function usePublicAdsQuery(placement?: NonNullable<PublicAd["placement"]>) {
  return useQuery({
    queryKey: ["public-ads", placement],
    queryFn: async () => {
      const qs = placement ? `&placement=${placement}` : ""
      const res = await fetch(`/api/ads?public=1${qs}`)
      if (!res.ok) throw new Error("Ads fetch failed")
      return (await res.json()) as PublicAd[]
    },
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
    retry: 1,
    placeholderData: [],
  })
}
