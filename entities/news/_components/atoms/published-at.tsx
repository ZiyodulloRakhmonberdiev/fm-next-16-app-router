"use client"

import { formatDateISO, formatDateTimeDotSlash } from "@/shared/common/lib/formatter"
import { cn } from "@/shared/common/lib/utils"
import { Calendar } from "lucide-react"
import { FaCalendar } from "react-icons/fa"

type PublishedAtProps = {
  publishedAt: string | Date | number
  className?: string
  hasCalendar?: boolean
}

export function PublishedAt({ publishedAt, className, hasCalendar = true }: PublishedAtProps) {
  return (
    <div className="flex items-center gap-1">
      {hasCalendar ? <FaCalendar className="size-3 text-muted-foreground" /> : null}
      <time dateTime={formatDateISO(publishedAt)} className={cn("text-xs text-muted-foreground font-semibold", className)}>
        {formatDateTimeDotSlash(publishedAt)}
      </time>
    </div>
  )
}