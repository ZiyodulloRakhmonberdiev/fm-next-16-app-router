"use client"

import * as React from "react"
import { Button } from "@/shared/common/components/ui/button"
import type { AppLocale } from "@/shared/common/lib/formatter"
import RelatedNews from "@/entities/news/lists/related-news"
import { CreatedBy } from "@/entities/news/slug/_components/atoms"
import { useLocale, useTranslations } from "next-intl"
import type { NewsItem } from "@/features/news/model"
import { NewsEngagement } from "@/features/news/ui/news-engagement"
import { usePublicSiteSettingsQuery } from "@/shared/server/public-site-settings-query"
import { useCategoryLabel } from "@/features/category/model/use-category-label"
import type { LocaleMap } from "@/shared/common/lib/locale-types"
import { AdSlot } from "@/features/ads/ui/ad-slot"
import { usePublicAdsQuery } from "@/features/ads/model/public-ads-query"
import { FaTelegram } from "react-icons/fa6"
import { TagsForMobile } from "@/entities/news/slug/_components/atoms"
import { VideoSection } from "./molecules/video-section"
import { ImageSection } from "./molecules/image-section"
import { AudioSection } from "./molecules/audio-section"
import { ContentSection } from "./molecules/content-section"
import { CategoryStats } from "./molecules/category-stats"

export type { NewsItem }

export type NewsPageContentProps = {
  news: NewsItem
  newsId?: string
}

export default function NewsSlugPageContent({ news, newsId }: NewsPageContentProps) {
  // const router = useRouter()
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")
  const categorySlug = news.categorySlug
  const { data: settings } = usePublicSiteSettingsQuery()
  const { data: articleBottomAds = [] } = usePublicAdsQuery("article_bottom_full")
  const hasArticleBottomAd =
    settings?.clientDelivery?.models?.ads !== false && articleBottomAds.length > 0

  const displayImages = React.useMemo(
    () => (news.images?.filter((s): s is string => typeof s === "string" && s.trim() !== "") ?? []),
    [news.images]
  )

  const hasVideo = Boolean(news.videoUrl?.trim())
  const imageCaption = news.imageCaption?.trim()
  const videoCaption = news.videoCaption?.trim()
  const audioCaption = news.audioCaption?.trim()

  const [reactionTotal, setReactionTotal] = React.useState(0)
  const [commentTotal, setCommentTotal] = React.useState(0)
  const [tagsCatalog, setTagsCatalog] = React.useState<Array<{ slug: string; name: LocaleMap }>>([])
  const [showTelegramPost, setShowTelegramPost] = React.useState(false)
  const newsRef = newsId ?? news.slug
  const telegramWidgetPost = React.useMemo(() => {
    if (!news.telegramMessageLink) return null
    try {
      const u = new URL(news.telegramMessageLink)
      const parts = u.pathname.split("/").filter(Boolean)
      if (parts.length < 2) return null
      return parts.join("/")
    } catch {
      return null
    }
  }, [news.telegramMessageLink])
  const telegramWidgetHostRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!showTelegramPost || !telegramWidgetPost) return
    const host = telegramWidgetHostRef.current
    if (!host) return

    host.innerHTML = ""
    const script = document.createElement("script")
    script.async = true
    script.src = "https://telegram.org/js/telegram-widget.js?4"
    script.dataset.telegramPost = telegramWidgetPost
    script.dataset.width = "100%"
    host.appendChild(script)
  }, [showTelegramPost, telegramWidgetPost])

  React.useEffect(() => {
    let cancelled = false
    void fetch("/api/tags")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => {
        if (cancelled) return
        const list = Array.isArray(rows) ? rows : []
        setTagsCatalog(
          list
            .map((row) => {
              const r = row as { slug?: unknown; name?: unknown }
              const slug = typeof r.slug === "string" ? r.slug : ""
              const name = (r.name ?? {}) as LocaleMap
              return slug ? { slug, name } : null
            })
            .filter((x): x is { slug: string; name: LocaleMap } => x !== null)
        )
      })
      .catch(() => {
        if (!cancelled) setTagsCatalog([])
      })

    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    if (!newsRef) return
    const ac = new AbortController()
    Promise.all([
      fetch(`/api/news/${newsRef}/reactions`, { signal: ac.signal }).then((r) => r.ok ? r.json() : { counts: {} }),
      fetch(`/api/news/${newsRef}/comments?limit=1&offset=0`, { signal: ac.signal }).then((r) => r.ok ? r.json() : { totalPublic: 0 }),
    ]).then(([reactions, comments]) => {
      const counts = (reactions?.counts ?? {}) as Record<string, number>
      const total = Object.values(counts).reduce((a: number, b) => a + Number(b), 0)
      setReactionTotal(total)
      setCommentTotal(Number((comments as { totalPublic?: number })?.totalPublic ?? 0))
    }).catch(() => { })
    return () => ac.abort()
  }, [newsRef])

  const categoryLabelRaw = useCategoryLabel(categorySlug, locale, news.category)
  const categoryLabel = React.useMemo(() => {
    const name = categoryLabelRaw
    return name ? name.charAt(0).toUpperCase() + name.slice(1) : name
  }, [categoryLabelRaw])

  const localizedTags = React.useMemo(() => {
    if (!Array.isArray(news.tags) || news.tags.length === 0) return []
    if (tagsCatalog.length === 0) return news.tags

    const allLocales: AppLocale[] = ["uz", "uzb", "ru", "en"]
    return news.tags.map((raw) => {
      const normalized = String(raw ?? "").trim()
      if (!normalized) return normalized
      const bySlug = tagsCatalog.find((t) => t.slug === normalized)
      if (bySlug) {
        return bySlug.name[locale] || bySlug.name.uz || bySlug.slug
      }
      const byAnyName = tagsCatalog.find((t) =>
        allLocales.some((loc) => (t.name?.[loc] ?? "").trim() === normalized)
      )
      if (byAnyName) {
        return byAnyName.name[locale] || byAnyName.name.uz || normalized
      }
      return normalized
    })
  }, [locale, news.tags, tagsCatalog])

  const adBadgeLabel = React.useMemo(() => {
    const map: Record<AppLocale, string> = {
      uz: "Reklama",
      uzb: "Реклама",
      ru: "Реклама",
      en: "Advertisement",
    }
    return map[locale]
  }, [locale])

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
    <div className="pt-12 md:pt-0">
      <div className="relative">

        <div className="md:hidden min-h-[185px]">
          <AdSlot placement='sidebar_widget' />
        </div>
        {hasArticleBottomAd ? (
          <div className="pointer-events-none fixed inset-0 flex items-center justify-center px-0 md:hidden">
            <AdSlot placement='article_bottom_full' />
          </div>
        ) : null}
        <article className="overflow-x-hidden">
          <div className="relative z-10 bg-transparent">
            <div className="px-4 md:px-6 bg-background pt-4 md:pt-0 pb-2">
              <div className="hidden md:block">
                <CategoryStats
                  categorySlug={categorySlug}
                  categoryLabel={categoryLabel}
                  publishedAt={news.publishedAt}
                  views={news.views}
                  minutes={news.minutes}
                  isAd={Boolean(news.ad)}
                  adBadgeLabel={adBadgeLabel}
                  minReadLabel={t("min_read")}
                />
              </div>
              <h1 className="text-2xl font-bold leading-tight md:text-3xl ">
                {news.title}
              </h1>
              <div className="md:hidden">
                <CategoryStats
                  categorySlug={categorySlug}
                  categoryLabel={categoryLabel}
                  publishedAt={news.publishedAt}
                  views={news.views}
                  minutes={news.minutes}
                  isAd={Boolean(news.ad)}
                  adBadgeLabel={adBadgeLabel}
                  minReadLabel={t("min_read")}
                />
              </div>

              {news.description != null && news.description !== "" && (
                <p className="leading-relaxed my-3 text-lg font-semibold">
                  {news.description}
                </p>
              )}
              <VideoSection
                videoUrl={news.videoUrl}
                title={news.title}
                images={news.images}
                videoCaption={videoCaption}
                unsupportedText={t("your_browser_does_not_support_the_video_tag")}
              />
              <ImageSection
                hasVideo={hasVideo}
                displayImages={displayImages}
                title={news.title}
                imageCaption={imageCaption}
                imagesLabel={t("images")}
              />
              <AudioSection audioUrl={news.audioUrl} audioCaption={audioCaption} />

            </div>
            {hasArticleBottomAd ? (
              <div className="relative z-0 -mx-4 min-h-screen md:min-h-0 bg-transparent md:hidden" aria-hidden />
            ) : null}
          </div>

          <div className="relative z-10 bg-background px-4 md:px-6 py-4">
            {hasArticleBottomAd ? (
              <div className="mb-6 hidden md:block">
                <AdSlot placement="article_bottom_full" />
              </div>
            ) : null}
            <ContentSection content={news.content} />
            <div className="my-4 md:my-6 w-full flex md:flex-row flex-col gap-2">
              <CreatedBy author={news.author} authorId={news.authorId} authorImage={news.authorImage} />
            </div>
            <TagsForMobile tags={localizedTags} />
            <div className="my-6" />
            {telegramWidgetPost ? (
              <div className="mt-4 w-full">
                <div className="flex items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowTelegramPost((p) => !p)}
                    className="flex items-center gap-2 justify-center h-auto py-2"
                  >
                    <FaTelegram className="size-4" />
                    <span>Telegram Post</span>
                  </Button>
                </div>
                {showTelegramPost ? (
                  <div className="mt-3 rounded-xl border bg-background p-3 pt-4 shadow-sm">
                    <div ref={telegramWidgetHostRef} className="w-full" />
                  </div>
                ) : null}
              </div>
            ) : null}
            <NewsEngagement slug={news.slug} newsId={newsId} />
          </div>
        </article>
      </div>
      <div className="relative z-10 bg-background px-4 md:px-6">
        <RelatedNews categorySlug={news.categorySlug} excludeSlug={news.slug} />
      </div>
    </div>
  )
}
