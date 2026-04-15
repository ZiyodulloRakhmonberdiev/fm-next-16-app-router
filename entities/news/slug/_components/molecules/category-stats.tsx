"use client"

import { Link } from "@/i18n/navigation"
import { Calendar } from "lucide-react"
import { formatDateTimeDotSlash } from "@/shared/common/lib/formatter"
import { IoEyeSharp } from "react-icons/io5"
import { MdTimer } from "react-icons/md"

type CategoryStatsProps = {
  categorySlug: string
  categoryLabel?: string
  publishedAt?: string | Date
  views?: number
  minutes?: number
  isAd?: boolean
  adBadgeLabel: string
  minReadLabel: string
}

export function CategoryStats({
  categorySlug,
  categoryLabel,
  publishedAt,
  views,
  minutes,
  isAd,
  adBadgeLabel,
  minReadLabel,
}: CategoryStatsProps) {
  return (
    <div className="flex flex-wrap items-center my-3 bg-background justify-between md:justify-start gap-x-3 gap-y-1">
      <div className="flex items-center gap-2 text-muted-foreground font-bold">
        <Link
          href={`/category/${categorySlug}`}
          className="font-medium hover:underline hidden md:block"
        >
          {categoryLabel}
        </Link>
        <span aria-hidden className="select-none hidden md:block">|</span>
        <div className="flex items-center gap-3 text-xs">
          {publishedAt ? (
            <time dateTime={formatDateTimeDotSlash(publishedAt)} className="text-xs flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0 md:hidden" />
              <span>{formatDateTimeDotSlash(publishedAt)}</span>
            </time>
          ) : null}
          <div className="inline-flex items-center gap-1 md:px-1">
            <IoEyeSharp className="h-4 w-4" />
            {views ?? 0}
          </div>
          <div className="hidden md:inline-flex items-center gap-1 md:px-1">
            <MdTimer className="h-4 w-4" />
            <span>{minutes ?? 0}</span>
            <span className="hidden md:inline-block">{minReadLabel}</span>
          </div>
        </div>
      </div>
      <div>
        {isAd ? (
          <div>
            <span className="inline-flex rounded-full bg-brand/5 px-2 py-0.5 text-xs font-semibold text-brand dark:text-white dark:bg-brand/30">
              {adBadgeLabel}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )
}