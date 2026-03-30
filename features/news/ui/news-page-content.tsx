"use client"

import * as React from "react"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, ChevronLeft, Clock, Eye, EyeOff, Heart, MessageSquare, Send, Share2, Volume2 } from "lucide-react"
import { Button } from "@/shared/common/components/ui/button"
import { formatDateISO, formatDateTime, formatDateTimeDotSlash, formatDateTimeLocale } from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { RelatedNews } from "@/shared/common/components/news-sections"
import { toast } from "sonner"
import CreatedBy from "./created-by"
import { useLocale, useTranslations } from "next-intl"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/common/components/ui/carousel"
import { getYoutubeEmbedUrl, getYoutubeThumbnailUrl } from "@/features/news/lib/youtube"
import { getCloudinaryVideoPosterUrl } from "@/shared/infra/cloudinary"
import type { NewsItem } from "@/features/news/model"
import { isRichContent, parseRichContentString } from "@/features/news/model"
import { RichContentBlocks } from "@/features/news/ui/rich-content-blocks"
import { TextContentRenderer } from "@/features/news/ui/text-content-renderer"
import { NewsEngagement } from "@/features/news/ui/news-engagement"
import { SavedNewsActions } from "@/features/news/ui/saved-news-actions"
import { usePublicSiteSettingsQuery } from "@/shared/server/public-site-settings-query"
import { useCategoryLabel } from "@/features/category/model/use-category-label"
import type { LocaleMap } from "@/shared/common/lib/locale-types"
import { AdSlot } from "@/features/ads/ui/ad-slot"
import { useThemeLabel } from "@/features/theme/model/use-theme-label"
import { usePublicThemesQuery } from "@/features/theme/model/public-themes-query"

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
  const themeId = news.themeId ?? ""
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
  const hasManyImages = displayImages.length > 1

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

    // Clear old widget iframe/script when toggling or switching posts.
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
  const { data: themes = [] } = usePublicThemesQuery()
  const themeLabel = useThemeLabel(themeId, locale, themeId)
  const themeSlug = React.useMemo(
    () => themes.find((th) => th._id === themeId)?.slug ?? "",
    [themeId, themes]
  )

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

  const handleShare = React.useCallback(async () => {
    if (typeof window === "undefined") return
    const pathParts = window.location.pathname.split("/").filter(Boolean)
    const localeFromPath = pathParts[0] || locale || "uz"
    const shareUrl = `${window.location.origin}/${localeFromPath}/news/${news.slug}`
    const shareText = `${news.title}\n${shareUrl}`
    try {
      if (navigator.share) {
        await navigator.share({
          title: news.title,
          text: news.title,
          url: shareUrl,
        })
        return
      }
      await navigator.clipboard.writeText(shareText)
      toast.success(t("copied"), { position: "bottom-center" })
    } catch {
      toast.error(t("copy_failed"))
    }
  }, [locale, news.slug, news.title, t])

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
    <div className="bg-background">
         <div className="md:hidden mb-4">
              <AdSlot placement="sidebar_widget" />
            </div>
      <div className="relative isolate px-4 md:px-6 ">
        {/* Reklama viewport markazida qotib turadi; kontent ustidan scroll bo‘ladi, oraliqda “deraza” orqali ko‘rinadi. */}
        {/* <div className="pointer-events-none flex fixed md:inset-0 md:z-0 md:items-center md:justify-center md:px-4">
          <div className="pointer-events-auto w-full max-w-xl">
            <AdSlot placement="sidebar_widget" />
          </div>
        </div> */}

        <article className="overflow-x-hidden">
          <div className="relative z-10 bg-background">
            <div className="my-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-2 text-sm text-muted-foreground rounded-sm shadow-sm md:shadow-none border-b pb-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2 bg-foreground/10 text-muted-foreground hover:text-foreground"
                onClick={() => router.back()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>


              <div className="flex items-center gap-1">
                <SavedNewsActions
                  slug={news.slug}
                  newsId={newsId}
                  overlay
                  unauthAction="toast"
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={() => void handleShare()}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
         
            {news.ad ? (
              <div className="mt-2 mb-2">
                <span className="inline-flex rounded-sm bg-amber-500/20 px-2 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  {adBadgeLabel}
                </span>
              </div>
            ) : null}
            <h1 className="text-2xl font-bold leading-tight md:text-3xl">
              {news.title}
            </h1>
            <div className="flex flex-wrap items-center  bg-background justify-between gap-x-2 gap-y-1">
              <div className="flex items-center gap-2">
                <Link
                  href={`/category/${categorySlug}`}
                  className="font-medium block my-2 hover:underline"
                >
                  {categoryLabel}
                </Link>
                {themeId && themeSlug ? (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <Link
                      href={`/theme/${themeSlug}`}
                      className="font-medium block my-2 text-foreground/80 hover:underline"
                    >
                      #{themeLabel}
                    </Link>
                  </>
                ) : null}
              </div>
              <time dateTime={formatDateTime(news.publishedAt)} className="text-sm text-muted-foreground items-center gap-2 hidden">
                <Calendar className="h-4 w-4 hidden md:block shrink-0" /> <span>{formatDateTimeDotSlash(news.publishedAt)}</span>
              </time>
            </div>
            {news.description != null && news.description !== "" && (
              <p className="leading-relaxed">
                {news.description}
              </p>
            )}
            <div className="my-4 flex items-center gap-2 text-muted-foreground text-sm">
              <time dateTime={formatDateTime(news.publishedAt)} className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" /> <span>{formatDateTimeDotSlash(news.publishedAt)}</span>
              </time>
              <span aria-hidden className="select-none px-1 md:px-2">·</span>
              <div className="inline-flex items-center gap-2 md:px-1">
                <Clock className="h-4 w-4" />
                <span>{news.minutes}</span> <span className="hidden md:inline-block">{t("min_read")}</span>
              </div>
              <span aria-hidden className="select-none px-1 md:px-2">·</span>
              <div className="inline-flex items-center gap-2 md:px-1">
                <Eye className="h-4 w-4" />
                {news.views} <span className="hidden md:inline-block">{t("views")}</span>
              </div>
              {/* <span aria-hidden className="select-none px-1 md:px-2">·</span> */}
              {/* <div className="inline-flex items-center gap-2 md:px-1">
            <MessageSquare className="h-4 w-4" />
            {commentTotal} <span className="hidden md:inline-block">{t("comments")}</span>
            <span aria-hidden className="select-none px-1 md:px-2">·</span>
            <div className="inline-flex items-center gap-2 md:px-1">
              <Heart className="h-4 w-4" />
              {reactionTotal} <span className="hidden md:inline-block">{t("reactions")}</span>
            </div>
          </div> */}
            </div>


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
                      className="h-full w-full object-cover"
                      poster={videoPoster}
                    >
                      {t("your_browser_does_not_support_the_video_tag")}
                    </video>
                  )}
                  {/* <div className="absolute right-3 top-3 z-10">
                <SavedNewsActions slug={news.slug} newsId={newsId} overlay />
              </div> */}
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
                    {/* <div className="absolute right-3 top-3 z-10">
                  <SavedNewsActions slug={news.slug} newsId={newsId} overlay />
                </div> */}
                  </>
                ) : (
                  <div className="flex min-h-[200px] w-full items-center justify-center rounded-lg bg-muted px-2 text-sm text-muted-foreground text-center">
                    Rasmni yuklab bo&apos;lmadi
                  </div>
                )}
              </div>
            )}
            {!hasVideo && hasManyImages && (
              <div className="relative mb-6 w-full">
                <Carousel opts={{ align: "start", loop: true }} className="w-full">
                  <CarouselContent className="ml-0">
                    {displayImages.map((src, i) => (
                      <CarouselItem key={`${src}-${i}`} className="pl-0">
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
                  <Carousel opts={{ align: "start", loop: true }} className="w-full">
                    <CarouselContent className="ml-0">
                      {displayImages.map((src, i) => (
                        <CarouselItem key={`${src}-${i}`} className="pl-0">
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
                )}
              </div>
            )}
            {news.audioUrl && (
              <div className="mb-6 rounded-xl border bg-foreground/10 p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Volume2 className="size-4" />
                  <span>Audio xabarni tinglang</span>
                </div>
                <audio
                  src={news.audioUrl}
                  controls
                  className="w-full"
                >
                  Brauzeringiz audio qo'llab-quvvatlamaydi.
                </audio>
              </div>
            )}
          </div>

          {/* <div
            className="relative z-10 hidden min-h-[min(50vh,380px)] w-full shrink-0 bg-transparent md:block"
            aria-hidden
          /> */}

          <div className="relative z-10 bg-background">
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
            <div className="flex flex-wrap gap-2 mt-4 bg-foreground/5 p-2 w-full">
              {tagsEnabled && localizedTags.length > 0 && localizedTags.map((tag) => (
                <div key={tag} className="text-sm bg-white dark:bg-foreground/10 px-2 py-1 rounded-xs">
                  <span>#</span>{" "}{tag}
                </div>
              ))}
            </div>


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
                    <Send className="size-4" />
                    <span>Telegram Post</span>
                    {/* {showTelegramPost ? <Eye /> : <EyeOff />} */}
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
            {/* <section className="my-8">
          <div className="rounded-lg border border-border px-4 py-3 md:px-6 md:py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Image src="/images/icons/telegram.png" alt="Telegram" width={48} height={48} />
              <p className="text-sm md:text-base leading-snug">
                {t.rich("news_telegram_card_text", {
                  telegram: (chunks) => (
                    <a
                      href={settings?.socialMedia?.find((s) => s.slug === "telegram")?.href ?? ""}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-[#229ED9] underline-offset-2"
                    >
                      {chunks}
                    </a>
                  ),
                })}
              </p>
            </div>
            <div className="flex justify-end">
              <Button
                asChild
                variant="secondary"
                className="mt-1 md:mt-0 text-white hover:bg-[#229ED9]/90 bg-[#229ED9] rounded-sm "
              >
                <a href={settings?.socialMedia?.find((s) => s.slug === "telegram")?.href ?? ""} target="_blank" rel="noreferrer">
                  {t("follow")}
                </a>
              </Button>
            </div>
          </div>
        </section> */}
            <div className="mt-6">
              <AdSlot placement="article_bottom_full" />
            </div>
          </div>
        </article>
      </div>
      <div className="relative z-10 bg-background px-4 md:px-6">
        <RelatedNews categorySlug={news.categorySlug} excludeSlug={news.slug} />
      </div>
    </div>
  )
}
