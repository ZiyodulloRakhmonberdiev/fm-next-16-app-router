"use client"
import { Button } from "@/shared/common/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/common/components/ui/dialog"
import { Link } from "@/i18n/navigation"
import type { NewsItem } from "@/features/news/model"
import { getYoutubeEmbedUrl } from "@/shared/common/lib/youtube"
import { getCloudinaryVideoPosterUrl } from "@/shared/common/lib/cloudinary"
import { getYoutubeThumbnailUrl } from "@/shared/common/lib/youtube"
import { useLocale, useTranslations } from "next-intl"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { useCategoryLabel } from "@/features/category/model/use-category-label"
import { ChevronRight } from "lucide-react"
import { formatDate } from "../../lib/formatter"

function getSafeImageSrc(raw?: string): string {
  if (!raw?.trim()) return ""
  return raw.startsWith("http") || raw.startsWith("/") ? raw : `/uploads/images/${raw}`
}

function getVideoPoster(item: NewsItem): string {
  const img = getSafeImageSrc(item.images?.[0])
  if (img) return img
  if (getYoutubeEmbedUrl(item.videoUrl ?? "")) return getYoutubeThumbnailUrl(item.videoUrl) || ""
  return getCloudinaryVideoPosterUrl(item.videoUrl) || ""
}

function getVideoSrc(url?: string | null): string {
  const u = url?.trim()
  if (!u) return ""
  return u.startsWith("http") || u.startsWith("/") ? u : `/${u}`
}

type VideoNewsModalProps = {
  item: NewsItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function VideoNewsModal({ item, open, onOpenChange }: VideoNewsModalProps) {
  const t = useTranslations("common")
  const locale = useLocale() as AppLocale
  const categoryLabel = useCategoryLabel(
    item?.categorySlug ?? "",
    locale,
    item?.category
  )
  const hasVideo = !!(item && item.videoSource && item.videoUrl)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-w-[100vw - 2rem]  w-full p-0 overflow-hidden mx-auto my-4 sm:mx-auto sm:my-6">
        {hasVideo && item && (() => {
          const youtubeEmbed = getYoutubeEmbedUrl(item.videoUrl ?? "")
          return (
            <>
              <div className="relative aspect-video w-full bg-muted">
                {youtubeEmbed ? (
                  <iframe
                    src={youtubeEmbed}
                    title={item.title}
                    className="absolute inset-0 h-full w-full rounded-md"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    key={item.videoUrl}
                    src={getVideoSrc(item.videoUrl)}
                    controls
                    controlsList="nodownload"
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                    className="h-full w-full object-cover rounded-md"
                    poster={getVideoPoster(item) || undefined}
                  >
                    {t("your_browser_does_not_support_the_video_tag")}
                  </video>
                )}
              </div>
              <div className="space-y-3 px-4 pb-4">
                <div className="flex items-center gap-2 mb-4 border-b pb-3">
                  <Link href={`/category/${item.categorySlug}`} className="flex items-center gap-2 hover:underline">
                    <span className="block w-2 h-2 bg-brand rounded-full"></span>
                    <span className="text-xs capitalize">{categoryLabel}</span>
                  </Link>
                  <span className="text-muted-foreground text-xs">/</span>
                  <time dateTime={formatDate(item.publishedAt)} className="text-xs text-muted-foreground">
                    {formatDate(item.publishedAt)}
                  </time>
                </div>
                <DialogHeader className="">
                  <DialogTitle className="text-start line-clamp-2 md:line-clamp-3 leading-snug">{item.title}</DialogTitle>
                  {item.description && (
                    <DialogDescription className="mt-1 text-start line-clamp-2 md:line-clamp-3">
                      {item.description}
                    </DialogDescription>
                  )}
                </DialogHeader>
                <div className="flex justify-start">
                  <Link href={`/news/${item.slug}`} className="flex items-center gap-2 py-2">
                    <Button variant="ghost" className="h-auto py-2 bg-foreground/10">
                      <ChevronRight className="size-7 bg-foreground text-background rounded-full p-1" />
                      <span>{t("read_article")}</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )
        })()}
      </DialogContent>
    </Dialog>
  )
}

