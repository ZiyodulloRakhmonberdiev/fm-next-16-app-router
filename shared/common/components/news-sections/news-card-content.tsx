"use client"

import { Link } from "@/i18n/navigation"
import type { NewsItem } from "@/features/news/model"
import {
  formatDateISO,
  formatDateTimeLocale,
} from "@/shared/common/lib/formatter"
import type { AppLocale, DateInput } from "@/shared/common/lib/formatter"
import { cn } from "@/shared/common/lib/utils"
import { formatDateTimeDotSlash } from "@/shared/common/lib/formatter"
import { Video, Volume2 } from "lucide-react"
import { IoPlayCircle } from "react-icons/io5"
import { FaMicrophone } from "react-icons/fa6"

export type NewsCardContentVariant = "inline" | "stacked"
export type NewsCardDateVariant =
  | "dateTimeLocale"
  | "dateTimeSlash"
  | "dateOnly"
  | "timeAndShortDate"
  | "dateTimeSlashShort"

type NewsCardContentProps = {
  item: NewsItem
  locale: AppLocale
  categoryLabel: string
  variant?: NewsCardContentVariant
  dateVariant?: NewsCardDateVariant
  titleClassName?: string
  descriptionClassName?: string
  categoryClassName?: string
  titleLineClampClassName?: string
  descriptionLineClampClassName?: string
  showDescription?: boolean
  showCategory?: boolean
  showTime?: boolean
  showMediaIndicators?: boolean
}

// function formatDateByVariant(date: DateInput, locale: AppLocale, variant: NewsCardDateVariant): string {
//   const d = date instanceof Date ? date : new Date(date)
//   const pad = (n: number) => String(n).padStart(2, "0")
//   const day = pad(d.getDate())
//   const month = pad(d.getMonth() + 1)
//   const year = d.getFullYear()
//   const shortYear = String(year).slice(-2)
//   const hours = pad(d.getHours())
//   const minutes = pad(d.getMinutes())

//   if (variant === "dateOnly") return `${day}.${month}.${year}`
//   if (variant === "timeAndShortDate") return `${hours}:${minutes} / ${day}.${month}.${shortYear}`
//   if (variant === "dateTimeSlash") return `${day}.${month}.${year} /  ${hours}:${minutes}`
//   return formatDateTimeLocale(date, locale)
// }

export function NewsCardContent({
  item,
  locale,
  categoryLabel,
  variant = "inline",
  // dateVariant = "dateTimeLocale",
  titleClassName,
  descriptionClassName,
  categoryClassName,
  titleLineClampClassName,
  descriptionLineClampClassName,
  showDescription = true,
  showCategory = true,
  showTime = true,
  showMediaIndicators = false,
}: NewsCardContentProps) {
  // const dateText = formatDateByVariant(item.publishedAt, locale, dateVariant)
  const stackedMeta = (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      {showCategory ? (
        <>
          {showMediaIndicators && item.hasVideo ? (
            <IoPlayCircle className="size-5 fill-current text-brand" aria-label="Video" />
          ) : null}
          {showMediaIndicators && item.hasAudio ? (
            <FaMicrophone className="size-3 fill-current text-brand" aria-label="Audio" />
          ) : null}
          {!item.hasAudio && !item.hasVideo ? (
            <span className="block h-2 w-2 rounded-full bg-brand" />
          ) : null}
          <span className={cn("capitalize text-muted-foreground font-semibold", categoryClassName)}>
            {categoryLabel}
          </span>
        </>
      ) : null}
    </div>
  )

  return (
    <>
      {variant === "stacked" ? (
        stackedMeta
      ) : (
        <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
          {showCategory ? (
            <div className="flex items-center gap-1.5">
              <span className="block h-2 w-2 rounded-full bg-brand" />
              <span className={cn("capitalize text-muted-foreground", categoryClassName)}>
                {categoryLabel}
              </span>
              {showMediaIndicators && item.hasVideo ? (
                <Video className="size-3 text-muted-foreground" aria-label="Video" />
              ) : null}
              {showMediaIndicators && item.hasAudio ? (
                <Volume2 className="size-3 text-muted-foreground" aria-label="Audio" />
              ) : null}
            </div>
          ) : null}
          {showCategory && showTime ? (
            <span aria-hidden className="h-2 w-[0.5px] bg-foreground/30"></span>
          ) : null}
          {showTime ? (
            <time dateTime={formatDateTimeDotSlash(item.publishedAt)}>{formatDateTimeDotSlash(item.publishedAt)}</time>
          ) : null}
        </div>
      )}

      <h3 className={cn("font-semibold leading-tight", titleClassName)}>
        <Link href={`/news/${item.slug}`} className="hover:underline">
          <span className={titleLineClampClassName}>{item.title}</span>
        </Link>
      </h3>

      {showDescription ? (
        <p className={cn("text-sm text-muted-foreground", descriptionClassName)}>
          <span className={cn("line-clamp-3", descriptionLineClampClassName)}>
            {item.description ?? ""}
          </span>
        </p>
      ) : null}

      {variant === "stacked" && showTime ? (
        <time className="text-xs text-muted-foreground" dateTime={formatDateTimeDotSlash(item.publishedAt)}>
          {formatDateTimeDotSlash(item.publishedAt)}
        </time>
      ) : null}
    </>
  )
}

