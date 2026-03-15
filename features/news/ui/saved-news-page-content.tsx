"use client"

import { useEffect, useState } from "react"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { SavedNewsActions } from "@/features/news/ui/saved-news-actions"
import { formatDateISO, formatDateTimeLocale } from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { useLocale } from "next-intl"
import { Button } from "@/shared/common/components/ui/button"
import { Card } from "@/shared/common/components/ui/card"
import { RelatedNews } from "@/shared/common/components/molecules"

type Props = { title: string }

export function SavedNewsPageContent({ title }: Props) {
  const locale = useLocale() as AppLocale
  const [items, setItems] = useState<
    Array<{
      _id: string
      newsId?: string
      newsSlug?: string
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
        newsId?: string
        newsSlug?: string
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

  const getSafeImageSrc = (raw?: string) => {
    if (!raw) return ""
    const candidate =
      raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")
        ? raw
        : `/uploads/images/${raw}`
    try {
      new URL(candidate, "http://localhost")
      return candidate
    } catch {
      return ""
    }
  }

  const slugOrEmpty = (item: (typeof items)[0]) => item.news?.slug ?? item.newsSlug ?? ""
  const titleText = (item: (typeof items)[0]) =>
    item.news?.title?.[locale] ?? item.news?.title?.uz ?? item.newsSlug ?? ""

  return (
    <div className="space-y-4 px-4 md:px-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <ul className="grid grid-cols-1 justify-items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const thumbSrc = getSafeImageSrc(item.news?.images?.[0])
          const href = `/news/${slugOrEmpty(item)}`
          return (
            <li key={item._id} className="w-full max-w-xl">
              <Card className="overflow-hidden p-0 rounded-sm shadow-none">
                <div className="flex gap-3">
                  <Link href={href} className="relative block h-20 w-28 shrink-0 overflow-hidden rounded-xs md:h-24 md:w-32">
                    {thumbSrc ? (
                      <Image
                        src={thumbSrc}
                        alt={titleText(item)}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-1 text-[10px] text-muted-foreground text-center">
                        Rasmni yuklab bo&apos;lmadi
                      </div>
                    )}
                    <div className="absolute right-1 top-1">
                      <SavedNewsActions slug={slugOrEmpty(item)} newsId={item.newsId} overlay />
                    </div>
                  </Link>
                  <div className="flex min-w-0 py-2 px-1 flex-col flex-1 justify-center gap-3">
                    <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                      <time dateTime={item.news?.publishedAt ? formatDateISO(item.news.publishedAt) : undefined}>
                        {item.news?.publishedAt ? formatDateTimeLocale(item.news.publishedAt, locale) : "-"}
                      </time>
                    </div>
                    <Link href={href} className="line-clamp-2 text-sm font-medium leading-tight hover:underline">
                      {titleText(item)}
                    </Link>
                  </div>
                </div>
              </Card>
            </li>
          )
        })}
      </ul>
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

      <RelatedNews latestLimit={12} />
    </div>
  )
}
