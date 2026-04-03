"use client"

import { Button } from "@/shared/common/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/common/components/ui/dialog"
import { Link } from "@/i18n/navigation"
import type { NewsItem } from "@/features/news/model"
import { getYoutubeEmbedUrl, getYoutubeThumbnailUrl } from "@/features/news/lib/youtube"
import { getCloudinaryVideoPosterUrl } from "@/shared/infra/cloudinary"
import { useTranslations } from "next-intl"
import { XIcon } from "lucide-react"
import { cn } from "@/shared/common/lib/utils"
import { FaCirclePlay } from "react-icons/fa6"

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
  const hasVideo = !!(item && item.videoUrl)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
      }}
    >
      <DialogContent
        showCloseButton={false}
        overlayClassName="z-50 bg-black/80 backdrop-blur-[2px]"
        className={cn(
          "flex w-[min(100vw-1rem,28rem)] max-w-[min(100vw-1rem,28rem)] flex-col items-center gap-0 border-0 bg-transparent p-0 shadow-none md:max-w-xl md:min-w-[min(100vw-2rem,36rem)]",
          "left-1/2 -translate-x-1/2",
          "max-h-[min(92dvh,calc(100vh-5rem))] max-sm:top-[max(1rem,env(safe-area-inset-top))] max-sm:translate-y-0",
          "sm:top-1/2 sm:-translate-y-1/2"
        )}
      >
        {hasVideo && item && (() => {
          const youtubeEmbed = getYoutubeEmbedUrl(item.videoUrl ?? "")
          return (
            <div className="relative w-full">
              {/* Desktop: yopish — modal kartochka tashqarisida, o‘ng-yuqori */}
              <DialogClose
                className={cn(
                  "absolute z-60 hidden md:inline-flex",
                  "-right-12 -top-12 size-13 items-center justify-center rounded-full",
                  "bg-background text-foreground shadow-lg",
                  "ring-2 ring-background transition-colors hover:bg-muted",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                )}
              >
                <XIcon className="size-5" />
                <span className="sr-only">Close</span>
              </DialogClose>

              <div
                className={cn(
                  "relative w-full overflow-hidden rounded-3xl border bg-background shadow-lg",
                  "max-h-[min(85dvh,calc(100vh-6rem))] overflow-y-auto"
                )}
              >
                <div className="relative aspect-video w-full rounded-t-3xl p-2.5">
                  {youtubeEmbed ? (
                    <div className="relative aspect-video w-full rounded-xl p-3">
                      <iframe
                        src={youtubeEmbed}
                        title={item.title}
                        className="absolute inset-0 h-full w-full rounded-xl"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <video
                      key={item.videoUrl}
                      src={getVideoSrc(item.videoUrl)}
                      controls
                      controlsList="nodownload"
                      disablePictureInPicture
                      onContextMenu={(e) => e.preventDefault()}
                      className="h-full w-full rounded-xl object-cover"
                      poster={getVideoPoster(item) || undefined}
                    >
                      {t("your_browser_does_not_support_the_video_tag")}
                    </video>
                  )}
                </div>

                <div className="space-y-3 px-4 pb-4 pt-1">
                  <DialogHeader className="text-start sm:text-left">
                    <DialogTitle className="mt-2 line-clamp-4 text-start text-base leading-snug md:line-clamp-5">
                      {item.title}
                    </DialogTitle>
                    {item.description ? (
                      <DialogDescription className="mt-1 line-clamp-8 text-start text-xs text-muted-foreground">
                        {item.description}
                      </DialogDescription>
                    ) : null}
                  </DialogHeader>
                  <div className="pt-1">
                    <Button variant="secondary" className="h-auto w-full rounded-full bg-foreground/10 py-3 md:w-auto">
                      <Link href={`/news/${item.slug}`} className="flex w-full items-center justify-between px-2 md:px-1">
                        <div className="flex items-center gap-4">
                          <FaCirclePlay className="size-6 text-muted-foreground" />
                          <span>{t("read_article")}</span>
                        </div>
                        <FaCirclePlay className="size-6 text-muted-foreground md:hidden" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Mobil: yopish — kartochka ostida */}
              <DialogClose
                className={cn(
                  "mx-auto mt-3 flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-background",
                  "text-foreground shadow-md transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "md:hidden"
                )}
              >
                <XIcon className="size-5" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </div>
          )
        })()}
      </DialogContent>
    </Dialog>
  )
}
