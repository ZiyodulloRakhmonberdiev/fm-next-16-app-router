"use client"

import { usePathname } from "next/navigation"
import { Skeleton } from "@/shared/common/components/ui/skeleton"
import { useTranslations } from "next-intl"
import { NewsListingSkeleton } from "@/features/news/ui/news-listing/news-listing-skeleton"

function ToolbarSkeleton() {
  return (
    <div className="my-6 space-y-4">
      <Skeleton className="h-9 w-44 md:h-10 md:w-56" />
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="ml-auto h-9 w-36 rounded-md sm:ml-0" />
      </div>
    </div>
  )
}

function AuthorsChoiceSidebarSkeleton() {
  return (
    <aside className="mt-6 h-fit w-full lg:sticky lg:top-20 lg:col-span-1 lg:mt-4 lg:self-start">
      <div className="flex w-full flex-col gap-4">
        <Skeleton className="h-7 w-44" />
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex gap-3 rounded-lg border border-border/40 p-2">
              <Skeleton className="size-20 shrink-0 rounded-md sm:size-24" />
              <div className="min-w-0 flex-1 space-y-2 py-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

function VideoGridSkeleton() {
  return (
    <ul className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 sm:gap-4 md:grid-cols-2">
      {Array.from({ length: 9 }).map((_, i) => (
        <li
          key={i}
          className="flex flex-col overflow-hidden rounded-md border border-border/60"
        >
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </li>
      ))}
    </ul>
  )
}

function isVideoListingPath(pathname: string | null) {
  if (!pathname) return false
  return /\/news\/video\/?$/.test(pathname)
}

export function NewsListingRouteSkeleton() {
  const t = useTranslations("common")
  const pathname = usePathname()
  const videoLayout = isVideoListingPath(pathname)
  const pageSize = videoLayout ? 9 : 6

  return (
    <section
      className="w-full min-h-[40vh] px-4 pb-4 md:px-6"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">{t("loading")}</span>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:items-start">
        <div className="lg:col-span-2">
          <ToolbarSkeleton />
          <div className="grid grid-cols-1 gap-4">
            {videoLayout ? (
              <VideoGridSkeleton />
            ) : (
              <NewsListingSkeleton pageSize={pageSize} />
            )}
          </div>
          <div className="mt-5">
            <Skeleton className="h-10 w-36 rounded-md" />
          </div>
        </div>
        <AuthorsChoiceSidebarSkeleton />
      </div>
    </section>
  )
}
