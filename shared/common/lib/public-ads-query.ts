"use client"

import { useQuery } from "@tanstack/react-query"

export type PublicAd = {
  _id: string
  type: "content" | "image"
  placement: "header_top_full" | "sidebar_widget" | "home_bottom_full" | "article_bottom_full"
  media?: string
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

export function usePublicAdsQuery(placement: PublicAd["placement"]) {
  return useQuery({
    queryKey: ["public-ads", placement],
    queryFn: async () => {
      const res = await fetch(`/api/ads?public=1&placement=${placement}`, { cache: "no-store" })
      if (!res.ok) throw new Error("Ads fetch failed")
      return (await res.json()) as PublicAd[]
    },
    staleTime: 30_000,
    retry: 1,
    placeholderData: [],
  })
}
