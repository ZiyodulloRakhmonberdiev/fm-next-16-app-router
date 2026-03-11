"use client"

import { useEffect, useState } from "react"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { CalendarDays } from "lucide-react"
import { SavedNewsActions } from "@/features/news/ui/saved-news-actions"
import { formatDate } from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { useLocale } from "next-intl"
import { Button } from "@/shared/common/components/ui/button"

type Props = { title: string }

export function SavedNewsPageContent({ title }: Props) {
  const locale = useLocale() as AppLocale
  const [items, setItems] = useState<
    Array<{
      _id: string
      newsSlug: string
      news?: {
        slug: string
        title?: Record<string, string>
        images?: string[]
        publishedAt?: string
      }
    }>
  >([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  async function load(nextPage = 1) {
    const res = await fetch(`/api/me/saved-news?page=${nextPage}&limit=30`, { cache: "no-store" })
    if (!res.ok) return
    const payload = (await res.json()) as {
      data?: Array<{
        _id: string
        newsSlug: string
        news?: {
          slug: string
          title?: Record<string, string>
          images?: string[]
          publishedAt?: string
        }
      }>
      meta?: { totalPages?: number }
    }
    setItems(payload.data ?? [])
    setTotalPages(Math.max(1, payload.meta?.totalPages ?? 1))
    setPage(nextPage)
  }

  useEffect(() => {
    void (async () => {
      await load(1)
    })()
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item._id} className="rounded-md border p-3 hover:bg-muted/40">
            <div className="relative mb-2 aspect-video overflow-hidden rounded bg-muted">
              {item.news?.images?.[0] ? <Image src={item.news.images[0]} alt={item.newsSlug} fill className="object-cover" /> : null}
              <div className="absolute right-2 top-2">
                <SavedNewsActions slug={item.newsSlug} overlay />
              </div>
            </div>
            <Link href={`/news/${item.newsSlug}`} className="font-medium line-clamp-2 hover:underline">
              {item.news?.title?.[locale] ?? item.news?.title?.uz ?? item.newsSlug}
            </Link>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="size-3" />
              <span>{item.news?.publishedAt ? formatDate(item.news.publishedAt, locale) : "-"}</span>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 ? <p className="text-sm text-muted-foreground">Hozircha saqlangan yangiliklar yo&apos;q.</p> : null}
      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => void load(page - 1)}>
            Oldingi
          </Button>
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => void load(page + 1)}>
            Keyingi
          </Button>
        </div>
      ) : null}
    </div>
  )
}
