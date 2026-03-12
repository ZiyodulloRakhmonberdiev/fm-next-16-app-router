"use client"

import { useQuery } from "@tanstack/react-query"
import type { RawNewsItem } from "./types"
import { usePublicSiteSettingsQuery } from "@/shared/common/lib/public-site-settings-query"

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
  return (item.status ?? "published") === "published"
}

async function fetchPublishedNews(): Promise<RawNewsItem[]> {
  const pageSize = 100
  let page = 1
  let totalPages = 1
  const all: RawNewsItem[] = []

  while (page <= totalPages) {
    const res = await fetch(`/api/news?page=${page}&limit=${pageSize}`)
    if (!res.ok) {
      throw new Error("Published news fetch failed")
    }

    const json = (await res.json()) as NewsListResponse
    const list = Array.isArray(json.data) ? (json.data as RawNewsItemApi[]) : []
    all.push(...list.map(normalizeNews))

    totalPages = Math.max(1, json.meta?.totalPages ?? 1)
    page += 1
  }

  return all
    .filter(isPublishedForPublic)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

export const publicNewsQueryKey = ["public-news"] as const

export function usePublicNewsQuery() {
  const { data: settings } = usePublicSiteSettingsQuery()
  const enabled =
    (settings?.clientDelivery.mode ?? "normal") !== "server-off" &&
    (settings?.clientDelivery.models.news ?? true)

  return useQuery({
    queryKey: publicNewsQueryKey,
    queryFn: fetchPublishedNews,
    staleTime: 30_000,
    retry: 1,
    enabled,
    placeholderData: [],
  })
}
