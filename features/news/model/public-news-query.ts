"use client"

import { useQuery } from "@tanstack/react-query"
import type { RawNewsItem } from "./types"
import { usePublicSiteSettingsQuery } from "@/shared/server/public-site-settings-query"
import { usePublicNewsInitial } from "./public-news-initial"
import { publicNewsQueryKey } from "@/shared/common/lib/public-query-keys"

type NewsListResponse = {
  data: RawNewsItem[]
  meta?: {
    page: number
    limit: number
    totalPages: number
  }
}

type RawNewsItemApi = Omit<RawNewsItem, "publishedAt" | "createdAt" | "updatedAt" | "pushedToTelegramAt" | "telegramLastAttemptAt"> & {
  publishedAt: string | Date
  createdAt?: string | Date
  updatedAt?: string | Date
  pushedToTelegramAt?: string | Date
  telegramLastAttemptAt?: string | Date
}

/** Bosh sahifa server cache bilan mos: ortiqcha pagination yo'q */
const PUBLIC_FEED_LIMIT = 120

const PUBLIC_NEWS_STALE_MS = 300_000

function toDate(value?: string | Date): Date | undefined {
  if (!value) return undefined
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function normalizeNews(item: RawNewsItemApi): RawNewsItem {
  return {
    ...item,
    publishedAt: toDate(item.publishedAt) ?? new Date(0),
    createdAt: toDate(item.createdAt),
    updatedAt: toDate(item.updatedAt),
    pushedToTelegramAt: toDate(item.pushedToTelegramAt),
    telegramLastAttemptAt: toDate(item.telegramLastAttemptAt),
  }
}

function isPublishedForPublic(item: RawNewsItem): boolean {
  return (item.status ?? "published") === "published" && item.ad !== true && item.stats !== true
}

async function fetchPublishedNewsFeed(): Promise<RawNewsItem[]> {
  const res = await fetch(
    `/api/news?status=published&page=1&limit=${PUBLIC_FEED_LIMIT}`
  )
  if (!res.ok) {
    throw new Error("Published news fetch failed")
  }

  const json = (await res.json()) as NewsListResponse
  const list = Array.isArray(json.data) ? (json.data as RawNewsItemApi[]) : []

  return list
    .map(normalizeNews)
    .filter(isPublishedForPublic)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

export { publicNewsQueryKey } from "@/shared/common/lib/public-query-keys"

export function usePublicNewsQuery() {
  const initialNews = usePublicNewsInitial()
  const hasServerInitial = Array.isArray(initialNews) && initialNews.length > 0
  const { data: settings } = usePublicSiteSettingsQuery()
  const clientDeliveryEnabled =
    (settings?.clientDelivery.mode ?? "normal") !== "server-off" &&
    (settings?.clientDelivery.models.news ?? true)

  return useQuery({
    queryKey: publicNewsQueryKey,
    queryFn: fetchPublishedNewsFeed,
    staleTime: PUBLIC_NEWS_STALE_MS,
    retry: 1,
    enabled: clientDeliveryEnabled,
    initialData: hasServerInitial ? initialNews : undefined,
    placeholderData: initialNews ?? [],
    refetchOnWindowFocus: false,
    /** O‘zgarish bo‘lmaganda qayta fetch qilmaslik; invalidateQueries chaqirilganda darhol yangilanadi */
    refetchOnMount: false,
  })
}
