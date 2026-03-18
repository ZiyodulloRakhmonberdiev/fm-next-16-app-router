"use client"

import * as React from "react"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, Eye, Facebook, Heart, Link2, Linkedin, MessageSquare, Share2, Twitter } from "lucide-react"
import { Button } from "@/shared/common/components/ui/button"
import { formatDate, formatDateISO, formatDateTimeLocale } from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { RelatedNews } from "@/shared/common/components/news-sections"
import { Send } from "lucide-react"
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
  DropdownMenuTrigger,
} from "@/shared/common/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/common/components/ui/tooltip"
import { SOCIAL_ICONS } from "@/shared/common/components/ui/social-media-buttons"
import { getCategoryName } from "@/shared/common/lib/seed-helpers"

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
  const [copyDone, setCopyDone] = React.useState(false)
  const [reactionTotal, setReactionTotal] = React.useState(0)
  const [commentTotal, setCommentTotal] = React.useState(0)
  const newsRef = newsId ?? news.slug

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
      setCopyDone(true)
      setTimeout(() => setCopyDone(false), 2000)
    } catch { }
  }, [shareUrl])

  const categoryLabel = React.useMemo(() => {
    const name = getCategoryName(categorySlug, locale)
    return name ? name.charAt(0).toUpperCase() + name.slice(1) : name
  }, [categorySlug, locale])

  const openShare = React.useCallback(
    (type: "telegram" | "facebook" | "twitter" | "whatsapp" | "linkedin") => {
      const u = encodeURIComponent(shareUrl)
      const t = encodeURIComponent(news.title ?? "")
      const urls: Record<typeof type, string> = {
        telegram: `https://t.me/share/url?url=${u}&text=${t}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
        twitter: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
        whatsapp: `https://wa.me/?text=${t}%20${u}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      }
      window.open(urls[type], "_blank", "noopener,noreferrer")
    },
    [shareUrl, news.title]
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
    <div className="px-4 md:px-6">
      <article className="pb-8 overflow-hidden">
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
            <div className="flex flex-wrap items-center gap-x-0 gap-y-1">

              {/* <span aria-hidden className="select-none px-2">·</span> */}
              <time dateTime={formatDateISO(news.publishedAt)} className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" /> <span>{formatDateTimeLocale(news.publishedAt, locale)}</span>
              </time>
              <span aria-hidden className="select-none px-2">·</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex cursor-default items-center gap-1 px-1">
                    <Clock className="h-4 w-4 shrink-0" />
                    {news.minutes}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{t("min_read")}</TooltipContent>
              </Tooltip>
              <span aria-hidden className="select-none px-2">·</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex cursor-default items-center gap-1 px-1">
                    <Eye className="h-4 w-4 shrink-0" />
                    {news.views}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{t("views")}</TooltipContent>
              </Tooltip>
              <span aria-hidden className="select-none px-2">·</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex cursor-default items-center gap-1 px-1">
                    <Heart className="h-4 w-4 shrink-0" />
                    {reactionTotal}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{t("reactions")}</TooltipContent>
              </Tooltip>
              <span aria-hidden className="select-none px-2">·</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex cursor-default items-center gap-1 px-1">
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    {commentTotal}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{t("comments")}</TooltipContent>
              </Tooltip>
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
              <Tooltip open={copyDone ? true : undefined}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                    onClick={copyLink}
                  >
                    <Link2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{copyDone ? t("copied") : t("copy")}</TooltipContent>
              </Tooltip>
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
                <DropdownMenuContent align="end" className="min-w-40">
                  <DropdownMenuItem
                    onSelect={() => openShare("telegram")}
                    className="flex items-center gap-2"
                  >
                    <div className="p-2 bg-foreground rounded-full mr-2">
                      <Send className="h-4 w-4 text-background" />
                    </div>
                    Telegram
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => openShare("facebook")}
                    className="flex items-center gap-2"
                  >
                    <div className="p-2 bg-foreground rounded-full mr-2">
                      <Facebook className="h-4 w-4 text-background" />
                    </div>
                    Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => openShare("twitter")}
                    className="flex items-center gap-2"
                  >
                    <div className="p-2 bg-foreground rounded-full mr-2">
                      <Twitter className="h-4 w-4 text-background" />
                    </div>
                    X (Twitter)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => openShare("whatsapp")}
                    className="flex items-center gap-2"
                  >
                    <div className="p-2 bg-foreground rounded-full mr-2">
                      <MessageSquare className="h-4 w-4 text-background" />
                    </div>
                    WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => openShare("linkedin")}
                    className="flex items-center gap-2"
                  >
                    <div className="p-2 bg-foreground rounded-full mr-2">
                      <Linkedin className="h-4 w-4 text-background" />
                    </div>
                    LinkedIn
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
          <p className="mb-6 text-muted-foreground leading-relaxed">
            {news.description}
          </p>
        )}
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

        {/* Pastdagi statistika — yozuvlar va separatorlar */}
        {/* <div className="mb-6 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-0">
              <span className="inline-flex items-center gap-2 text-foreground">
                <span className="text-sm text-muted-foreground">{t("views")}</span>
                <span className="font-semibold tabular-nums">{news.views}</span>
              </span>
              <span aria-hidden className="select-none px-3 text-muted-foreground/60">|</span>
              <span className="inline-flex items-center gap-2 text-foreground">
                <span className="text-sm text-muted-foreground">{t("reactions")}</span>
                <span className="font-semibold tabular-nums">{reactionTotal}</span>
              </span>
              <span aria-hidden className="select-none px-3 text-muted-foreground/60">|</span>
              <span className="inline-flex items-center gap-2 text-foreground">
                <span className="text-sm text-muted-foreground">{t("comments")}</span>
                <span className="font-semibold tabular-nums">{commentTotal}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="default"
                size="sm"
                className=""
                onClick={copyLink}
              >
                <Link2 className="h-4 w-4" />
                {copyDone ? t("copied") : t("copy_link")}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className=""
                    onClick={copyLink}
                  >
                    <Share2 className="h-4 w-4" />
                    {t("share")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-40">
                  <DropdownMenuItem
                    onSelect={() => openShare("telegram")}
                    className="flex items-center gap-2"
                  >
                    <div className="p-2 bg-foreground rounded-full mr-2">
                      <Send className="h-4 w-4 text-white" />
                    </div>
                    Telegram
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => openShare("facebook")}
                    className="flex items-center gap-2"
                  >
                    <div className="p-2 bg-foreground rounded-full mr-2">
                      <Facebook className="h-4 w-4 text-white" />
                    </div>
                    Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => openShare("twitter")}
                    className="flex items-center gap-2"
                  >
                    <div className="p-2 bg-foreground rounded-full mr-2">
                      <Twitter className="h-4 w-4 text-white" />
                    </div>
                    X (Twitter)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => openShare("whatsapp")}
                    className="flex items-center gap-2"
                  >
                    <div className="p-2 bg-foreground rounded-full mr-2">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => openShare("linkedin")}
                    className="flex items-center gap-2"
                  >
                    <div className="p-2 bg-foreground rounded-full mr-2">
                      <Linkedin className="h-4 w-4 text-white" />
                    </div>
                    LinkedIn
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div> */}
   
      
        <div className="my-6" />


        <NewsEngagement slug={news.slug} newsId={newsId} />
        <section className="my-8">
          <div className="rounded-lg border border-border px-4 py-3 md:px-6 md:py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Image src="/images/icons/telegram.png" alt="Telegram" width={48} height={48} />
              <p className="text-sm md:text-base leading-snug">
                So&apos;nggi yangiliklarni o&apos;tkazib yubormaslik uchun bizning{" "}
                <a
                  href={settings?.socialMedia?.find((s) => s.slug === "telegram")?.href ?? ""}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold  text-[#229ED9] underline-offset-2"
                >
                  Telegram
                </a>{" "}
                kanalga a&apos;zo bo&apos;ling.
              </p>
            </div>
            <div className="flex justify-start md:justify-end">
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
        <RelatedNews categorySlug={news.categorySlug} excludeSlug={news.slug} />
      </article>
    </div>
  )
}
