"use client"

import Image from "next/image"
import { Clock, Eye, Pause, Play } from "lucide-react"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { formatDate, formatDateISO, formatDateTime, formatDateTimeDotSlash, formatDateTimeLocale } from "@/shared/common/lib/formatter"
import type { NewsItem } from "@/features/news/model"
import { useCategoryLabel } from "@/features/category/model/use-category-label"
import { getSafeImageSrc } from "./news-listing-utils"
import { cn } from "@/shared/common/lib/utils"

type AudioListingCardProps = {
  item: NewsItem
  locale: AppLocale
  isActive: boolean
  isPlaying: boolean
  onPlay: (item: NewsItem) => void
}

/** Animated equalizer bars — playing animatsiyasi uchun */
function EqualizerBars({ playing }: { playing: boolean }) {
  return (
    <span className="inline-flex items-end gap-[2px] h-4" aria-hidden>
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={cn(
            "w-[3px] rounded-full bg-white origin-bottom",
            playing ? "animate-equalizer" : ""
          )}
          style={{
            height: playing ? undefined : `${[8, 12, 6, 10][i - 1]}px`,
            animationDelay: `${(i - 1) * 0.12}s`,
          }}
        />
      ))}
    </span>
  )
}

export function AudioListingCard({
  item,
  locale,
  isActive,
  isPlaying,
  onPlay,
}: AudioListingCardProps) {
  const categoryLabel = useCategoryLabel(item.categorySlug, locale, item.category)
  const thumbSrc = getSafeImageSrc(item.images?.[0])

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Audio: ${item.title}`}
      onClick={() => onPlay(item)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onPlay(item)}
      className={cn(
        "group relative flex gap-0 overflow-hidden rounded-sm border transition-all duration-200 cursor-pointer outline-none",
        isActive
          ? ""
          : "border-border/60 bg-card hover:border-brand/20 hover:shadow-sm hover:bg-card/80"
      )}
    >
      {/* Active left accent bar */}
      {/* <span
        className={cn(
          "absolute left-0 inset-y-0 w-[3px] rounded-r-full transition-all duration-300",
          isActive ? "bg-brand opacity-100" : "opacity-0"
        )}
        aria-hidden
      /> */}

      <div className="flex w-full gap-0 sm:gap-0">
        {/* Thumbnail */}

        <div className="relative md:w-24 md:h-24 w-16 h-16 shrink-0 overflow-hidden rounded-sm bg-muted">
          {thumbSrc ? (
            <>
              <Image
                src={thumbSrc}
                alt={item.title}
                fill
                className={cn(
                  "object-cover transition-all duration-500",
                  isActive ? "" : ""
                )}
              />
              {/* Gradient overlay */}
              {/* <div
                className={cn(
                  "absolute inset-0 transition-opacity duration-300",
                  isActive ? "bg-linear-to-t from-brand/60 via-brand/10 to-transparent opacity-100" : "opacity-0 group-hover:opacity-60"
                )}
              /> */}
            </>
          ) : (
            <div
              className={cn(
                "flex h-full w-full items-center justify-center transition-colors duration-300",
                isActive ? "bg-brand/20" : "bg-muted group-hover:bg-brand/10"
              )}
            >
              {/* Sound wave illustration */}
              {/* <span className="inline-flex items-end gap-[3px] h-8" aria-hidden>
                {[5, 10, 7, 14, 9, 12, 6].map((h, i) => (
                  <span
                    key={i}
                    className={cn(
                      "w-[3px] rounded-full transition-colors duration-300",
                      isActive ? "bg-brand" : "bg-muted-foreground/30 group-hover:bg-brand/40"
                    )}
                    style={{ height: `${h}px` }}
                  />
                ))}
              </span> */}
            </div>
          )}


        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-between px-3 py-1 md:p-4">
          {/* Header row */}
          <div className="hidden md:flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              {/* AUDIO badge */}
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase transition-colors duration-200",
                  isActive
                    ? "bg-brand text-white"
                    : "bg-brand/10 text-brand group-hover:bg-brand/20"
                )}
              >
                {isActive && isPlaying ? (
                  <EqualizerBars playing />
                ) : (
                  <span className="inline-flex items-end gap-[1.5px] h-2.5" aria-hidden>
                    {[3, 5, 4, 6, 3].map((h, i) => (
                      <span
                        key={i}
                        className={cn(
                          "w-[1.5px] rounded-full",
                          isActive ? "bg-white" : "bg-brand"
                        )}
                        style={{ height: `${h}px` }}
                      />
                    ))}
                  </span>
                )}
                Audio
              </span>

              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground capitalize">
                <span
                  className={cn(
                    "block h-1.5 w-1.5 rounded-full transition-colors",
                    isActive ? "bg-brand" : "bg-muted-foreground/40"
                  )}
                />
                {categoryLabel}
              </span>
            </div>


          </div>

          {/* Title */}
          <p
            className={cn(
              "text-sm font-semibold leading-snug line-clamp-2 lg:line-clamp-4 transition-colors duration-200",
              isActive ? "" : ""
            )}
          >
            {item.title ?? ""}
          </p>

          {/* Footer stats */}
          <div className="md:pt-2 flex items-center justify-between">
            <div className="inline-flex items-center gap-3 text-xs text-muted-foreground">
              <time
                dateTime={formatDateISO(item.publishedAt)}
                className="text-[11px] text-muted-foreground"
              >
                {formatDateTimeDotSlash(item.publishedAt)}
              </time>
              <span aria-hidden className="text-border hidden md:inline-block">|</span>
              <span className="hidden md:inline-flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {item.views}
              </span>

            </div>

            {isActive ? (
              <span
                className={cn(
                  "text-[11px] font-medium transition-colors",
                  isPlaying ? "text-brand" : "text-muted-foreground"
                )}
              >
                {isPlaying ? "Ijro etilmoqda…" : "Pauza"}
              </span>
            ) : (
              null
            )}
          </div>
        </div>

      </div>
      <button
        type="button"
        aria-label={isActive && isPlaying ? "Pause" : "Play"}
        className={cn(
          "hidden md:flex items-center justify-center p-4 pr-2 transition-all duration-200 mx-4",
          isActive ? "opacity-100" : "group-hover:opacity-100"
        )}
      >
        <span
          className={cn(
            "inline-flex size-10 items-center justify-center rounded-full shadow-lg ring-2 transition-all duration-200",
            isActive
              ? "bg-brand text-white"
              : "bg-background/90 text-brand scale-90 group-hover:scale-100"
          )}
        >
          {isActive && isPlaying ? (
            <EqualizerBars playing />
          ) : isActive ? (
            <Play className="size-4 fill-current ml-0.5" />
          ) : (
            <Play className="size-4 fill-current ml-0.5" />
          )}
        </span>
      </button>
    </article>
  )
}
