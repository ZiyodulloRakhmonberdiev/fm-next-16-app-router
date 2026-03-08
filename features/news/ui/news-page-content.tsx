"use client"

import * as React from "react"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/shared/common/components/ui/button"
import { slugFromCategory } from "@/shared/common/lib/category"
import { formatDate, formatDateISO } from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { RelatedNews, CreatedBy, Tags } from "@/shared/common/components/molecules"
import { useLocale } from "next-intl"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/common/components/ui/carousel"
import { getYoutubeEmbedUrl } from "@/shared/common/lib/youtube"
import type { NewsContent } from "@/features/news/model/content"
import { isRichContent } from "@/features/news/model/content"
import { RichContent } from "@/features/news/ui/rich-content"

type NewsItem = {
  slug: string
  title: string
  description: string
  content: NewsContent
  images: string[]
  category: string
  tags: string[]
  publishedAt: Date
  minutes: number
  views: number
  author: string
  /** "youtube" — videoUrl = YouTube link; "local" — videoUrl = /videos/news/... */
  videoSource?: "youtube" | "local"
  videoUrl?: string
}

type NewsPageContentProps = {
  news: NewsItem
}

export function NewsPageContent({ news }: NewsPageContentProps) {
  const router = useRouter()
  const locale = useLocale() as AppLocale
  const categorySlug = slugFromCategory(news.category)

  return (
    <article className="pb-8">
      <div className="mb-6 flex flex-col gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit gap-1.5 -ml-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        <Link
          href={`/category/${categorySlug}`}
          className="font-medium text-brand hover:underline"
        >
          {news.category}
        </Link>
        <span aria-hidden className="select-none">·</span>
        <time dateTime={formatDateISO(news.publishedAt)}>
          {formatDate(news.publishedAt, locale)}
        </time>
        <span aria-hidden className="select-none">·</span>
        <span>{news.minutes} min read</span>
        <span aria-hidden className="select-none">·</span>
        <span>{news.views} views</span>
      </div>

      <h1 className="mb-4 text-2xl font-bold leading-tight md:text-3xl">
        {news.title}
      </h1>


      {news.videoSource && news.videoUrl && (
        <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-lg bg-muted">
          {news.videoSource === "youtube" ? (
            (() => {
              const embedUrl = getYoutubeEmbedUrl(news.videoUrl)
              if (!embedUrl) return null
              return (
                <iframe
                  src={embedUrl}
                  title={news.title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )
            })()
          ) : (
            <video
              src={news.videoUrl}
              controls
              className="h-full w-full object-contain"
              poster={news.images?.[0]}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      )}

      {!news.videoSource && news.images?.length === 1 && (
        <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-lg bg-muted">
          <Image
            src={news.images[0]}
            alt={news.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
     {!news.videoSource && news.images && news.images.length > 1 && (
        <div className="relative mb-6 w-full">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="ml-0">
              {news.images.map((src, i) => (
                <CarouselItem key={src} className="pl-0">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={src}
                      alt={`${news.title} — ${i + 1}`}
                      fill
                      className="object-cover"
                      priority={i === 0}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="absolute right-2 top-2 z-10 flex translate-y-0 gap-2">
              <CarouselPrevious className="static size-10 translate-x-0 translate-y-0 rounded-sm border-none bg-background/90 hover:bg-background" />
              <CarouselNext className="static size-10 translate-x-0 translate-y-0 rounded-sm border-none bg-background/90 hover:bg-background" />
            </div>
          </Carousel>
        </div>
      )}

      <p className="mb-6 text-muted-foreground leading-relaxed">
        {news.description}
      </p>

      {news.videoSource && news.videoUrl && news.images && news.images.length > 0 && (
        <div className="mb-6">
          <p className="mb-3 text-sm font-medium text-muted-foreground">Rasmlar</p>
          {news.images.length === 1 ? (
            <div className="flex justify-center">
              <div className="relative w-full max-w-[70%] aspect-video overflow-hidden rounded-lg bg-muted">
                <Image
                  src={news.images[0]}
                  alt={`${news.title} — 1`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ) : (
            <>
              {/* Mobile: carousel (2 va undan ko‘p rasm) */}
              <div className="relative w-full md:hidden">
                <Carousel opts={{ align: "start", loop: true }} className="w-full">
                  <CarouselContent className="ml-0">
                    {news.images.map((src, i) => (
                      <CarouselItem key={src} className="pl-0">
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={src}
                            alt={`${news.title} — ${i + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="absolute right-2 top-2 z-10 flex translate-y-0 gap-2">
                    <CarouselPrevious className="static size-10 translate-x-0 translate-y-0 rounded-sm border-none bg-background/90 hover:bg-background" />
                    <CarouselNext className="static size-10 translate-x-0 translate-y-0 rounded-sm border-none bg-background/90 hover:bg-background" />
                  </div>
                </Carousel>
              </div>
              {/* Desktop: 2 ta 50%, 3+ ustun */}
              {news.images.length === 2 ? (
                <div className="hidden justify-center md:flex">
                  <div className="grid w-full max-w-[50%] grid-cols-2 gap-3">
                    {news.images.map((src, i) => (
                      <div
                        key={src}
                        className="relative aspect-video overflow-hidden rounded-lg bg-muted"
                      >
                        <Image
                          src={src}
                          alt={`${news.title} — ${i + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="hidden grid-cols-3 gap-3 md:grid">
                  {news.images.map((src, i) => (
                    <div
                      key={src}
                      className="relative aspect-video overflow-hidden rounded-lg bg-muted"
                    >
                      <Image
                        src={src}
                        alt={`${news.title} — ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {isRichContent(news.content) ? (
        <RichContent blocks={news.content} />
      ) : (
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {news.content}
        </div>
      )}

      {/* Author */}
      <div className="my-6 w-full flex md:flex-row flex-col gap-2">
        <CreatedBy author={news.author} />
        <Tags tags={news.tags} />
      </div>

      {/* Related news */}
      <RelatedNews category={news.category} excludeSlug={news.slug} />
    </article>
  )
}
