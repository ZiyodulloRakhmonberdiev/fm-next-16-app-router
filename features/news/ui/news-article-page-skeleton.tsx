"use client"

import { Skeleton } from "@/shared/common/components/ui/skeleton"
import { useTranslations } from "next-intl"

function LeftNavSkeleton() {
  return (
    <aside className="hidden lg:flex lg:col-span-1 lg:flex-col lg:gap-4 lg:self-start">
      <div className="px-4">
        <nav className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-full max-w-[140px] rounded-md" />
          ))}
        </nav>
      </div>
      <div className="border-t border-b border-border py-4">
        <div className="space-y-3 px-4">
          <Skeleton className="h-5 w-24" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full max-w-[120px]" />
          ))}
        </div>
      </div>
      <div className="px-4">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-28" />
          ))}
        </div>
      </div>
    </aside>
  )
}

function ArticleBodySkeleton() {
  return (
    <article className="min-w-0 overflow-hidden">
      <div className="mb-4 rounded-sm bg-muted p-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Skeleton className="h-5 w-48 md:w-64" />
          <div className="flex gap-2">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>
      </div>

      <Skeleton className="mb-3 h-9 w-full max-w-[95%] md:h-10" />
      <Skeleton className="mb-2 h-9 w-full max-w-[80%] md:h-10" />
      <Skeleton className="mb-4 h-5 w-32" />

      <div className="mb-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full max-w-[92%]" />
      </div>

      <div className="mb-6 flex flex-wrap gap-3 text-sm">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28" />
      </div>

      <Skeleton className="mb-8 aspect-16/10 w-full rounded-lg md:aspect-21/9" />

      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className={
              i % 3 === 2 ? "h-4 w-full max-w-[70%]" : "h-4 w-full"
            }
          />
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6">
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>
    </article>
  )
}

function LatestSidebarSkeleton() {
  return (
    <aside className="mt-8 flex w-full flex-col gap-6 lg:col-span-2 lg:mt-0">
      <div>
        <Skeleton className="mb-4 h-7 w-40" />
        <ul className="flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="flex gap-3 border-b border-border/60 pb-4 last:border-0 last:pb-0">
              <Skeleton className="size-20 shrink-0 rounded-md sm:size-24" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

export function NewsArticlePageSkeleton() {
  const t = useTranslations("common")
  return (
    <div
      className="mx-auto grid min-h-[40vh] max-w-7xl grid-cols-1 gap-6 lg:grid-cols-7 lg:items-start"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">{t("loading")}</span>
      <LeftNavSkeleton />
      <div className="min-w-0 lg:col-span-4">
        <ArticleBodySkeleton />
      </div>
      <LatestSidebarSkeleton />
    </div>
  )
}
