"use client"

import * as React from "react"
import { seedNews } from "@/scripts/seed-news"
import { Card } from "@/shared/common/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/common/components/ui/carousel"
import type { CarouselApi } from "@/shared/common/components/ui/carousel"
import { formatDate, formatDateISO } from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { TruncateExpand } from "@/shared/common/components/ui/truncate-expand"
import { Button } from "@/shared/common/components/ui/button"
import { ArrowRightIcon } from "lucide-react"

type NewsItem = (typeof seedNews.news)[number]

type CategoryWithSlideProps = {
  category?: string
  categorySlug?: string
}

function slugFromCategory(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-")
}

export default function CategoryWithSlide({
  category = "Sports",
  categorySlug,
}: CategoryWithSlideProps) {
  const locale = useLocale() as AppLocale
  const [api, setApi] = React.useState<CarouselApi | null>(null)
  const t = useTranslations("common")

  const slug = categorySlug ?? slugFromCategory(category)

  const items = React.useMemo(
    () =>
      [...seedNews.news]
        .filter((n) => n.category === category)
        .sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
        ),
    [category]
  )

  if (items.length === 0) return null

  return (
    <section className="w-full space-y-4 my-4 px-4 md:px-6">
      <div className="border-t-2 border-border">
        <Carousel setApi={setApi} opts={{ align: "start", loop: false }} className="w-full">
          <div className="flex flex-wrap items-center justify-between gap-3 my-4">
            <h2 className="text-lg font-semibold">{category}</h2>
            <div className="flex items-center gap-2">
              <CarouselPrevious
                className="static size-9 translate-y-0 rounded-sm"
                variant="outline"
              />
              <CarouselNext
                className="static size-9 translate-y-0 rounded-sm"
                variant="outline"
              />
              <Button variant="ghost" asChild className="text-brand">
                <Link href={`/category/${slug}`}>{t("view_all")} {">>"}</Link>
              </Button>
            </div>
          </div>

          <CarouselContent className="-ml-3">
            {items.map((item: NewsItem) => (
              <CarouselItem
                key={item.slug}
                className="pl-3 basis-full sm:basis-[50%] md:basis-[33.333%] lg:basis-[25%]"
              >
                <Link href={`/news/${item.slug}`} className="block h-full">
                  <Card className="h-full overflow-hidden rounded-sm border gap-0 p-0 shadow-none transition-shadow hover:shadow-md bg-background">
                    <div className="relative aspect-video w-full">
                      <Image
                        src={item.images[0]}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-2 p-2">
                      <time
                        dateTime={formatDateISO(item.publishedAt)}
                        className="text-xs text-muted-foreground"
                      >
                        {formatDate(item.publishedAt, locale)}
                      </time>
                      <h3 className="text-sm line-clamp-3 font-semibold leading-tight hover:underline">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {item.description}
                      </p>
                    </div>
                  </Card>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  )
}

