"use client"

import { Link } from "@/i18n/navigation"
import { IoPlayCircle } from "react-icons/io5"
import { cn } from "@/shared/common/lib/utils"

type CategoryNameProps = {
  categorySlug: string
  categoryLabel: string
  hasVideo?: boolean
  className?: string
}

export function CategoryName({
  categorySlug,
  categoryLabel,
  hasVideo = false,
  className,
}: CategoryNameProps) {
  return (
    <div
      // href={`/category/${categorySlug}`}
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold capitalize text-muted-foreground select-none pointer-events-none",
        className
      )}
    >
      {hasVideo ? (
        <IoPlayCircle className="size-4 fill-current text-brand" aria-label="Video" />
      ) : (
        <span className="block size-2 rounded-full bg-brand" />
      )}
      <span>{categoryLabel}</span>
    </div>
  )
}
