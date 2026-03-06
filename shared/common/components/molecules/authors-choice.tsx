"use client"

import { seedNews } from "@/scripts/seed-news"
import { Card } from "@/shared/common/components/ui/card"
import {
  formatDate,
  formatDateISO,
  formatDateTimeLocale,
} from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { useLocale } from "next-intl"
import { truncate } from "../../lib/truncate"

type NewsItem = (typeof seedNews.news)[number]

export default function AuthorsChoice() {
  const locale = useLocale() as AppLocale

  const items = [...seedNews.news]
    .filter((item) => item.authorsChoice)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )   
    .slice(0, 4)

  const [featured, ...rightItems] = items

  return (
    <div className="w-full">
      <h2 className="mb-4 text-sm font-semibold">Authors choice</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {featured && (
          <div className="md:col-span-1 h-full">
            <Card className="overflow-hidden rounded-sm border-none p-0 shadow-none">
              <Link href={`/news/${featured.slug}`} className="block">
                <div className="relative aspect-video w-full">
                  <Image
                    src={featured.image}
                    alt={featured.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>
              <div className="flex flex-col gap-2 p-4">
                <h3 className="text-lg font-semibold leading-tight">
                  <Link
                    href={`/news/${featured.slug}`}
                    className="hover:underline"
                  >
                    {truncate(featured.title)}
                  </Link>
                </h3>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {truncate(featured.description)}
                </p>
                <time
                  dateTime={formatDateISO(featured.publishedAt)}
                  className="text-xs text-muted-foreground"
                >
                  {formatDateTimeLocale(featured.publishedAt, locale)}
                </time>
              </div>
            </Card>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {rightItems.map((item: NewsItem) => (
            <Card
              key={item.slug}
              className="flex flex-col gap-2 rounded-sm border-none p-4 shadow-none"
            >
              <h4 className="text-sm font-semibold leading-tight">
                <Link
                  href={`/news/${item.slug}`}
                  className="hover:underline"
                >
                  {truncate(item.title)}
                </Link>
              </h4>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {truncate(item.description)}
              </p>
              <time
                dateTime={formatDateISO(item.createdAt)}
                className="mt-auto text-xs text-muted-foreground"
              >
                {formatDate(item.createdAt, locale)}
              </time>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
