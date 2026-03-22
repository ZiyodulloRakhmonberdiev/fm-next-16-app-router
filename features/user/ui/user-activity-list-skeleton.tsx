"use client"

import { Skeleton } from "@/shared/common/components/ui/skeleton"
import { useTranslations } from "next-intl"

type Variant = "comments" | "reactions"

export function UserActivityListSkeleton({ variant }: { variant: Variant }) {
  const t = useTranslations("common")
  return (
    <div
      className="mx-auto min-h-[40vh] max-w-2xl space-y-6"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">{t("loading")}</span>
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      {variant === "reactions" ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-18 rounded-full" />
          ))}
        </div>
      ) : null}

      <ul className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="overflow-hidden rounded-lg border border-border/80">
            <div className="space-y-2 px-4 pt-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[85%]" />
            </div>
            {variant === "comments" ? (
              <div className="mt-2 space-y-2 bg-accent/50 px-4 py-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-accent/30 px-4 py-3">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-4 w-28" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
