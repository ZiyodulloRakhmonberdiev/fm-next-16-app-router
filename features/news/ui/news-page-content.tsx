"use client"

import * as React from "react"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/shared/common/components/ui/button"
import { formatDate, formatDateISO } from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { RelatedNews, CreatedBy, Tags, AdSlot } from "@/shared/common/components/molecules"
import { useLocale, useTranslations } from "next-intl"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/common/components/ui/carousel"
import { getYoutubeEmbedUrl } from "@/shared/common/lib/youtube"
import type { NewsItem } from "@/features/news/model"
import { isRichContent, parseRichContentString } from "@/features/news/model"
import { RichContentBlocks } from "@/features/news/ui/rich-content-blocks"
import { TextContentRenderer } from "@/features/news/ui/text-content-renderer"
import { NewsEngagement } from "@/features/news/ui/news-engagement"
import { SavedNewsActions } from "@/features/news/ui/saved-news-actions"
import { usePublicSiteSettingsQuery } from "@/shared/common/lib/public-site-settings-query"

export type { NewsItem }

export type NewsPageContentProps = {
  news: NewsItem
}

export function NewsPageContent({ news }: NewsPageContentProps) {
  const router = useRouter()
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")
  const categorySlug = news.categorySlug
  const parsedRichFromString =
    typeof news.content === "string" ? parseRichContentString(news.content) : null
  const { data: settings } = usePublicSiteSettingsQuery()
  const tagsEnabled = settings?.clientDelivery.models.tags ?? true

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

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const now = Date.now()
    const key = `news-view-sent:${news.slug}`
    const prevRaw = window.sessionStorage.getItem(key)
    const prev = prevRaw ? Number(prevRaw) : 0
    if (prev && now - prev < 10_000) return
    window.sessionStorage.setItem(key, String(now))
    void fetch("/api/news/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: news.slug }),
      keepalive: true,
    }).catch(() => {})
  }, [news.slug])

  return (
    <article className="pb-8 overflow-hidden">
      <div className="mb-6 flex flex-col gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit gap-1.5 -ml-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
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
        <span>{news.minutes} {t("min_read")}</span>
        <span aria-hidden className="select-none">·</span>
        <span>{news.views} {t("views")}</span>
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
              controlsList="nodownload"
              disablePictureInPicture
              onContextMenu={(e) => e.preventDefault()}
              className="h-full w-full object-contain"
              poster={news.images?.[0]}
            >
              {t("your_browser_does_not_support_the_video_tag")}
            </video>
          )}
          <div className="absolute right-3 top-3 z-10">
            <SavedNewsActions slug={news.slug} overlay />
          </div>
        </div>
      )}

      {!news.videoSource && news.images?.length === 1 && (
        <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-lg bg-muted">
          {getSafeImageSrc(news.images[0]) ? (
            <Image
              src={getSafeImageSrc(news.images[0])}
              alt={news.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-2 text-sm text-muted-foreground text-center">
              Rasmni yuklab bo&apos;lmadi
            </div>
          )}
          <div className="absolute right-3 top-3 z-10">
            <SavedNewsActions slug={news.slug} overlay />
          </div>
        </div>
      )}
      {!news.videoSource && news.images && news.images.length > 1 && (
        <div className="relative mb-6 w-full">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="ml-0">
              {news.images.map((src, i) => (
                <CarouselItem key={src} className="pl-0">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                    {getSafeImageSrc(src) ? (
                      <Image
                        src={getSafeImageSrc(src)}
                        alt={`${news.title} — ${i + 1}`}
                        fill
                        className="object-cover"
                        priority={i === 0}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-2 text-xs text-muted-foreground text-center">
                        Rasmni yuklab bo&apos;lmadi
                      </div>
                    )}
                    {i === 0 ? (
                      <div className="absolute right-3 top-3 z-10">
                        <SavedNewsActions slug={news.slug} overlay />
                      </div>
                    ) : null}
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

      {news.description != null && news.description !== "" && (
        <p className="mb-6 text-muted-foreground leading-relaxed">
          {news.description}
        </p>
      )}

      {news.videoSource && news.videoUrl && news.images && news.images.length > 0 && (
        <div className="mb-6">
          <p className="mb-3 text-sm font-medium text-muted-foreground">{t("images")}</p>
          {news.images.length === 1 ? (
            <div className="flex justify-center">
              <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-muted">
                {getSafeImageSrc(news.images[0]) ? (
                  <Image
                    src={getSafeImageSrc(news.images[0])}
                    alt={`${news.title} — 1`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-2 text-sm text-muted-foreground text-center">
                    Rasmni yuklab bo&apos;lmadi
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="relative w-full md:hidden">
                <Carousel opts={{ align: "start", loop: true }} className="w-full">
                  <CarouselContent className="ml-0">
                    {news.images.map((src, i) => (
                      <CarouselItem key={src} className="pl-0">
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                          {getSafeImageSrc(src) ? (
                            <Image
                              src={getSafeImageSrc(src)}
                              alt={`${news.title} — ${i + 1}`}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center px-2 text-xs text-muted-foreground text-center">
                              Rasmni yuklab bo&apos;lmadi
                            </div>
                          )}
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
              {news.images.length === 2 ? (
                <div className="hidden justify-center md:flex">
                  <div className="grid w-full max-w-[50%] grid-cols-2 gap-3">
                    {news.images.map((src, i) => (
                      <div
                        key={src}
                        className="relative aspect-video overflow-hidden rounded-lg bg-muted"
                      >
                        {getSafeImageSrc(src) ? (
                          <Image
                            src={getSafeImageSrc(src)}
                            alt={`${news.title} — ${i + 1}`}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center px-2 text-xs text-muted-foreground text-center">
                            Rasmni yuklab bo&apos;lmadi
                          </div>
                        )}
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
                      {getSafeImageSrc(src) ? (
                        <Image
                          src={getSafeImageSrc(src)}
                          alt={`${news.title} — ${i + 1}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center px-2 text-xs text-muted-foreground text-center">
                          Rasmni yuklab bo&apos;lmadi
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {news.content != null && news.content !== "" && (
        isRichContent(news.content) ? (
          <RichContentBlocks blocks={news.content} />
        ) : parsedRichFromString ? (
          <RichContentBlocks blocks={parsedRichFromString} />
        ) : (
          <TextContentRenderer content={news.content} />
        )
      )}

      <div className="my-6 w-full flex md:flex-row flex-col gap-2">
        <CreatedBy author={news.author} />
      </div>
      <div className="flex flex-wrap gap-2">
        {tagsEnabled && news.tags && news.tags.length > 0 &&  news.tags.map((tag) => (
          <span key={tag} className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-xs">
            #{" "}{tag}
          </span>
        ))}
      </div>
      <div className="my-6">
      </div>

      <RelatedNews categorySlug={news.categorySlug} excludeSlug={news.slug} />
      <NewsEngagement slug={news.slug} />
    </article>
  )
}
