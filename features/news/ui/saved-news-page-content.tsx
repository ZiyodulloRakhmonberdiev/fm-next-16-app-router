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
import { RelatedNews } from "@/shared/common/components/news-sections"
import { getCloudinaryVideoPosterUrl } from "@/shared/common/lib/cloudinary"
import { getYoutubeThumbnailUrl, getYoutubeEmbedUrl } from "@/shared/common/lib/youtube"

type Props = { title: string }

type SavedItem = {
  _id: string
  newsId?: string
  newsSlug?: string
  news?: {
    slug: string
    title?: Record<string, string>
    images?: string[]
    publishedAt?: string
    videoUrl?: string | null
    videoSource?: string | null
  }
}

export function SavedNewsPageContent({ title }: Props) {
  const locale = useLocale() as AppLocale
  const [items, setItems] = useState<SavedItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  async function load(nextPage = 1) {
    const res = await fetch(`/api/me/saved-news?page=${nextPage}&limit=30`, { cache: "no-store" })
    if (!res.ok) return
    const payload = (await res.json()) as {
      data?: SavedItem[]
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
    if (!raw?.trim()) return ""
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

  /** Media: avval rasm, keyin YouTube thumbnail, keyin Cloudinary poster */
  const getCardImageSrc = (item: SavedItem) => {
    const img = getSafeImageSrc(item.news?.images?.[0])
    if (img) return img
    if (getYoutubeEmbedUrl(item.news?.videoUrl ?? "")) return getYoutubeThumbnailUrl(item.news?.videoUrl) || ""
    return getCloudinaryVideoPosterUrl(item.news?.videoUrl) || ""
  }

  const slugOrEmpty = (item: SavedItem) => item.news?.slug ?? item.newsSlug ?? ""
  const titleText = (item: SavedItem) =>
    item.news?.title?.[locale] ?? item.news?.title?.uz ?? item.newsSlug ?? ""

  return (
    <div className="space-y-4 px-4 md:px-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <ul className="grid grid-cols-1 justify-items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const thumbSrc = getCardImageSrc(item)
          const href = `/news/${slugOrEmpty(item)}`
          return (
            <li key={item._id} className="w-full max-w-xl">
              <Card className="overflow-hidden p-0 rounded-sm shadow-none">
                <Link href={href} className="relative block aspect-video w-full overflow-hidden rounded-t-sm bg-muted">
                  {thumbSrc ? (
                    <Image
                      src={thumbSrc}
                      alt={titleText(item)}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center px-2 text-xs text-muted-foreground text-center">
                      Rasmni yuklab bo&apos;lmadi
                    </div>
                  )}
                  <div className="absolute right-2 top-2">
                    <SavedNewsActions slug={slugOrEmpty(item)} newsId={item.newsId} overlay />
                  </div>
                </Link>
                <div className="flex min-w-0 flex-col gap-2 p-3">
                  <time dateTime={item.news?.publishedAt ? formatDateISO(item.news.publishedAt) : undefined} className="text-xs text-muted-foreground">
                    {item.news?.publishedAt ? formatDateTimeLocale(item.news.publishedAt, locale) : "-"}
                  </time>
                  <Link href={href} className="line-clamp-2 text-sm font-medium leading-tight hover:underline">
                    {titleText(item)}
                  </Link>
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
