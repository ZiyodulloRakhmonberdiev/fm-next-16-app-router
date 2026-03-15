"use client"

import * as React from "react"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/shared/common/components/ui/button"
import { formatDate, formatDateISO } from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { RelatedNews, CreatedBy } from "@/shared/common/components/molecules"
import { useLocale, useTranslations } from "next-intl"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/common/components/ui/carousel"
import { getYoutubeEmbedUrl } from "@/shared/common/lib/youtube"
import { getCloudinaryVideoPosterUrl } from "@/shared/common/lib/cloudinary"
import { getYoutubeThumbnailUrl } from "@/shared/common/lib/youtube"
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
  newsId?: string
}

export function NewsPageContent({ news, newsId }: NewsPageContentProps) {
  const router = useRouter()
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")
  const categorySlug = news.categorySlug
  const parsedRichFromString =
    typeof news.content === "string" ? parseRichContentString(news.content) : null
  const { data: settings } = usePublicSiteSettingsQuery()
  const tagsEnabled = settings?.clientDelivery.models.tags ?? true

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

  const getVideoSrc = (url?: string | null) => {
    const u = url?.trim()
    if (!u) return ""
    if (u.startsWith("http://") || u.startsWith("https://")) return u
    if (u.startsWith("/")) return u
    return `/${u}`
  }

  const videoPoster =
    getSafeImageSrc(news.images?.[0]) ||
    (getYoutubeEmbedUrl(news.videoUrl ?? "") ? getYoutubeThumbnailUrl(news.videoUrl) : getCloudinaryVideoPosterUrl(news.videoUrl)) ||
    undefined

  const displayImages = React.useMemo(
    () => (news.images?.filter((s): s is string => typeof s === "string" && s.trim() !== "") ?? []),
    [news.images]
  )

  const hasVideo = Boolean(news.videoUrl?.trim())

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
    }).catch(() => { })
  }, [news.slug])

  return (
    <div className="px-4 md:px-6">
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
        {hasVideo && (() => {
          const youtubeEmbed = getYoutubeEmbedUrl(news.videoUrl ?? "")
          return (
          <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-lg bg-muted">
            {youtubeEmbed ? (
              <iframe
                src={youtubeEmbed}
                title={news.title}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                key={news.videoUrl ?? "video"}
                src={getVideoSrc(news.videoUrl)}
                controls
                controlsList="nodownload"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
                className="h-full w-full object-contain"
                poster={videoPoster}
              >
                {t("your_browser_does_not_support_the_video_tag")}
              </video>
            )}
            <div className="absolute right-3 top-3 z-10">
              <SavedNewsActions slug={news.slug} newsId={newsId} overlay />
            </div>
          </div>
          )
        })()}

        {!hasVideo && displayImages.length === 1 && (
          <div className="relative mb-6 w-full">
            {getSafeImageSrc(displayImages[0]) ? (
              <>
                <img
                  src={getSafeImageSrc(displayImages[0])}
                  alt={news.title}
                  className="block w-full h-auto rounded-lg"
                />
                <div className="absolute right-3 top-3 z-10">
                  <SavedNewsActions slug={news.slug} newsId={newsId} overlay />
                </div>
              </>
            ) : (
              <div className="flex min-h-[200px] w-full items-center justify-center rounded-lg bg-muted px-2 text-sm text-muted-foreground text-center">
                Rasmni yuklab bo&apos;lmadi
              </div>
            )}
          </div>
        )}
        {!hasVideo && displayImages.length > 1 && (
          <div className="relative mb-6 w-full">
            {/* Mobile: carousel */}
            <div className="md:hidden">
              <Carousel opts={{ align: "start", loop: true }} className="w-full">
                <CarouselContent className="ml-0">
                  {displayImages.map((src, i) => (
                    <CarouselItem key={src} className="pl-0">
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
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
                            <SavedNewsActions slug={news.slug} newsId={newsId} overlay />
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
            {/* Desktop: 2 ustun */}
            <div className="hidden md:grid md:grid-cols-2 gap-3">
              {displayImages.map((src, i) => (
                <div
                  key={src || i}
                  className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted"
                >
                  {getSafeImageSrc(src) ? (
                    <Image
                      src={getSafeImageSrc(src)}
                      alt={`${news.title} — ${i + 1}`}
                      fill
                      className="object-cover"
                      priority={i === 0}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center px-2 text-xs text-muted-foreground text-center">
                      Rasmni yuklab bo&apos;lmadi
                    </div>
                  )}
                  {i === 0 ? (
                    <div className="absolute right-3 top-3 z-10">
                      <SavedNewsActions slug={news.slug} newsId={newsId} overlay />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}

        {news.description != null && news.description !== "" && (
          <p className="mb-6 text-muted-foreground leading-relaxed">
            {news.description}
          </p>
        )}

        {hasVideo && displayImages.length > 0 && (
          <div className="mb-6 w-full">
            <p className="mb-3 text-sm font-medium text-muted-foreground">{t("images")}</p>
            {displayImages.length === 1 ? (
              getSafeImageSrc(displayImages[0]) ? (
                <img
                  src={getSafeImageSrc(displayImages[0])}
                  alt={`${news.title} — 1`}
                  className="block w-full h-auto rounded-lg"
                />
              ) : (
                <div className="flex min-h-[200px] w-full items-center justify-center rounded-lg bg-muted px-2 text-sm text-muted-foreground text-center">
                  Rasmni yuklab bo&apos;lmadi
                </div>
              )
            ) : (
              <div className="grid grid-cols-2 gap-3 w-full">
                {displayImages.map((src, i) => (
                  <div
                    key={src || i}
                    className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted"
                  >
                    {getSafeImageSrc(src) ? (
                      <Image
                        src={getSafeImageSrc(src)}
                        alt={`${news.title} — ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 50vw"
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
          {tagsEnabled && news.tags && news.tags.length > 0 && news.tags.map((tag) => (
            <span key={tag} className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-xs">
              #{" "}{tag}
            </span>
          ))}
        </div>
        <div className="my-6">
        </div>
        <NewsEngagement slug={news.slug} newsId={newsId} />

        <RelatedNews categorySlug={news.categorySlug} excludeSlug={news.slug} />
      </article>
    </div>
  )
}
