"use client"

import { getNewsListForLocale, isImageTypeRawNews, type NewsItem } from "@/features/news/model"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { Card } from "@/shared/common/components/ui/card"
import { formatDateISO, formatDateTimeLocale, type AppLocale } from "@/shared/common/lib/formatter"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { useLocale } from "next-intl"

export default function Yangiliklar() {
  const locale = useLocale() as AppLocale
  const { data: publicNews = [] } = usePublicNewsQuery()

  const raw = [...publicNews]
    .filter(isImageTypeRawNews)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 30)
  const items = getNewsListForLocale(raw, locale)

  if (items.length === 0) return null

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

  return (
    <section className="w-full space-y-4 px-4 md:px-6 pt-4">
      <div className="py-4 mt-4 border-border">
        <h2 className="mb-4 text-lg font-semibold">Yangiliklar</h2>
        <ul className="grid grid-cols-1 justify-items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item: NewsItem) => {
            const thumbSrc = getSafeImageSrc(item.images?.[0])
            return (
            <li key={item.slug} className="w-full max-w-xl">
              <Card className="overflow-hidden p-0 rounded-sm shadow-none">
                <div className="flex gap-3">
                  <Link
                    href={`/news/${item.slug}`}
                    className="relative block h-20 w-28 shrink-0 overflow-hidden rounded-xs md:h-24 md:w-32"
                  >
                    {thumbSrc ? (
                      <Image
                        src={thumbSrc}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-1 text-[10px] text-muted-foreground text-center">
                        Rasmni yuklab bo&apos;lmadi
                      </div>
                    )}
                  </Link>
                  <div className="flex min-w-0 py-2 px-1 flex-col flex-1 justify-center gap-3">
                    <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                      <span className="uppercase font-medium text-brand italic">{item.category}</span>
                      <span aria-hidden>/</span>
                      <time dateTime={formatDateISO(item.publishedAt)}>
                        {formatDateTimeLocale(item.publishedAt, locale)}
                      </time>
                    </div>
                    <Link
                      href={`/news/${item.slug}`}
                      className="line-clamp-2 text-sm font-medium leading-tight hover:underline"
                    >
                      {item.title}
                    </Link>
                  </div>
                </div>
              </Card>
            </li>
          )})}
        </ul>
      </div>
    </section>
  )
}
