"use client"

import * as React from "react"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Eye, Facebook, Heart, Link2, MessageSquare, Send, Share2 } from "lucide-react"
import { Button } from "@/shared/common/components/ui/button"
import { formatDateISO, formatDateTimeLocale } from "@/shared/common/lib/formatter"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/common/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/common/components/ui/tooltip"
import { SOCIAL_ICONS } from "@/shared/common/components/ui/social-media-buttons"
import { useCategoryLabel } from "@/features/category/model/use-category-label"

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

  const [shareUrl, setShareUrl] = React.useState("")
  const [reactionTotal, setReactionTotal] = React.useState(0)
  const [commentTotal, setCommentTotal] = React.useState(0)
  const [showTelegramPost, setShowTelegramPost] = React.useState(false)
  const newsRef = newsId ?? news.slug
  const telegramWidgetPost = React.useMemo(() => {
    if (!news.telegramMessageLink) return null
    try {
      const u = new URL(news.telegramMessageLink)
      const parts = u.pathname.split("/").filter(Boolean)
      if (parts.length < 2) return null
      // Telegram widget "data-telegram-post" expects something like: channel/POST_ID
      // For private channels it often looks like: c/CHANNEL_ID/POST_ID.
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
    if (typeof window !== "undefined") setShareUrl(window.location.href)
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

  const copyLink = React.useCallback(async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success(t("copied"), { position: "bottom-center" })
    } catch {
      toast.error(t("copy_failed"))
    }
  }, [shareUrl, t])

  const categoryLabelRaw = useCategoryLabel(categorySlug, locale, news.category)
  const categoryLabel = React.useMemo(() => {
    const name = categoryLabelRaw
    return name ? name.charAt(0).toUpperCase() + name.slice(1) : name
  }, [categoryLabelRaw])

  const openShare = React.useCallback(
    async (type: "telegram" | "facebook" | "whatsapp" | "instagram") => {
      const u = encodeURIComponent(shareUrl)
      const titleEnc = encodeURIComponent(news.title ?? "")
      if (type === "instagram") {
        try {
          await navigator.clipboard.writeText(shareUrl)
          toast.success(t("copied"), {
            position: "bottom-center",
            description: t("instagram_share_hint"),
          })
        } catch {
          toast.error(t("copy_failed"))
        }
        window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer")
        return
      }
      const urls = {
        telegram: `https://t.me/share/url?url=${u}&text=${titleEnc}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
        whatsapp: `https://wa.me/?text=${titleEnc}%20${u}`,
      } as const
      window.open(urls[type], "_blank", "noopener,noreferrer")
    },
    [shareUrl, news.title, t]
  )

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
    <div className="">
      <article className="overflow-hidden">
        {/* <div className="mb-6 flex flex-col gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit gap-1.5 -ml-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Button>
        </div> */}

        <TooltipProvider>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-x-2 gap-y-2 text-sm text-muted-foreground bg-muted p-2 rounded-sm">
            <div className="flex flex-wrap items-center justify-start gap-x-0 gap-y-1">
              <time dateTime={formatDateISO(news.publishedAt)} className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" /> <span>{formatDateTimeLocale(news.publishedAt, locale)}</span>
              </time>
            </div>

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
              <DropdownMenu>
                <Tooltip>
                  <DropdownMenuTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                  </DropdownMenuTrigger>
                  <TooltipContent>{t("share")}</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="min-w-50">
                  <DropdownMenuItem
                    onSelect={() => void openShare("telegram")}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border [&_svg]:size-3">
                      <Send className="size-4" aria-hidden />
                    </span>
                    Telegram
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => void openShare("whatsapp")}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border [&_svg]:size-3">
                      <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </span>
                    WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => void openShare("instagram")}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border [&_svg]:size-3">
                      {SOCIAL_ICONS.instagram.icon}
                    </span>
                    Instagram
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => void openShare("facebook")}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border">
                      <Facebook className="size-4" aria-hidden />
                    </span>
                    Facebook
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => void copyLink()}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                      <Link2 className="size-4" aria-hidden />
                    </span>
                    {t("copy_link")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </TooltipProvider>

        <h1 className="text-2xl font-bold leading-tight md:text-3xl">
          {news.title}
        </h1>
        <Link
          href={`/category/${categorySlug}`}
          className="font-medium block my-2 text-brand hover:underline"
        >
          {categoryLabel}
        </Link>
        {news.description != null && news.description !== "" && (
          <p className="leading-relaxed">
            {news.description}
          </p>
        )}
        <div className="my-4 flex items-center gap-2 text-muted-foreground text-sm">
          <div className="inline-flex items-center gap-2 md:px-1">
            <Clock className="h-4 w-4" />
            <span>{news.minutes}</span> <span className="hidden md:inline-block">{t("min_read")}</span>
          </div>
          <span aria-hidden className="select-none px-1 md:px-2">·</span>
          <div className="inline-flex items-center gap-2 md:px-1">
            <Eye className="h-4 w-4" />
            {news.views} <span className="hidden md:inline-block">{t("views")}</span>
          </div>
          <span aria-hidden className="select-none px-1 md:px-2">·</span>
          <div className="inline-flex items-center gap-2 md:px-1">
            <MessageSquare className="h-4 w-4" />
            {commentTotal} <span className="hidden md:inline-block">{t("comments")}</span>
          <span aria-hidden className="select-none px-1 md:px-2">·</span>
          <div className="inline-flex items-center gap-2 md:px-1">
            <Heart className="h-4 w-4" />
            {reactionTotal} <span className="hidden md:inline-block">{t("reactions")}</span>
          </div>
          </div>
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
                        {/* {i === 0 ? (
                          <div className="absolute right-3 top-3 z-10">
                            <SavedNewsActions slug={news.slug} newsId={newsId} overlay />
                          </div>
                        ) : null} */}
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
                      Rasmni yuklab bo'lmadi
                    </div>
                  )}
                  {/* {i === 0 ? (
                    <div className="absolute right-3 top-3 z-10">
                      <SavedNewsActions slug={news.slug} newsId={newsId} overlay />
                    </div>
                  ) : null} */}
                </div>
              ))}
            </div>
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
        <div className="flex flex-wrap gap-2 mt-4">
          {tagsEnabled && news.tags && news.tags.length > 0 && news.tags.map((tag) => (
            <span key={tag} className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-xs">
              #{" "}{tag}
            </span>
          ))}
        </div>
        <div className="my-6 w-full flex md:flex-row flex-col gap-2">
          <CreatedBy author={news.author} />
        </div>

      
        <div className="my-6" />


        {telegramWidgetPost ? (
          <div className="mt-4 w-full">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium">Telegram</div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTelegramPost((p) => !p)}
                className="shrink-0"
              >
                {showTelegramPost ? "Postni yashirish" : "Telegram postni ko‘rsatish"}
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
        <section className="my-8">
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
        </section>
      </article>
      <RelatedNews categorySlug={news.categorySlug} excludeSlug={news.slug} />
    </div>
  )
}
