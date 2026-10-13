"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useLocale } from "next-intl"
import type { NewsItem } from "@/features/news/model/types"
import LatestNews from "./latest-news"

export default function ArticleLatestNews({ initialItems, excludeSlug }: { initialItems: NewsItem[]; excludeSlug: string }) {
  const locale = useLocale()
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)")
    const update = () => setVisible(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  const { data } = useQuery<NewsItem[]>({
    queryKey: ["article-sidebar", locale],
    queryFn: async () => {
      const response = await fetch(`/api/news/sidebar/${locale}`)
      if (!response.ok) throw new Error("Sidebar unavailable")
      const rows = await response.json() as NewsItem[]
      return rows.map((item) => ({ ...item, publishedAt: new Date(item.publishedAt) }))
    },
    enabled: visible,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  })
  // Failed/offline requests retain the server-rendered cards. No interval polling.
  const items = data ? data.filter((item) => item.slug !== excludeSlug).slice(0, 10) : initialItems
  return <LatestNews items={items} />
}
