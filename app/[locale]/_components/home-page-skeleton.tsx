"use client"

import { Skeleton } from "@/shared/common/components/ui/skeleton"
import { useTranslations } from "next-intl"

function TopNewsStripSkeleton() {
  return (
    <div className="mb-4 md:my-3">
      <div className="flex items-stretch gap-4 rounded-lg border border-border/40 bg-muted/30 px-4 py-3 md:gap-6">
        <div className="flex shrink-0 items-center gap-2 border-r border-border pr-4 md:pr-6">
          <Skeleton className="size-2 rounded-full" />
          <Skeleton className="hidden h-5 w-28 md:block" />
        </div>
        <div className="flex min-w-0 flex-1 gap-3 overflow-hidden py-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-[260px] shrink-0 rounded-lg md:w-[300px]" />
          ))}
        </div>
      </div>
    </div>
  )
}

function TopBannerSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-stretch">
      <div className="flex flex-col gap-4 lg:max-w-[70%] lg:flex-1">
        <Skeleton className="aspect-16/10 w-full rounded-xl md:aspect-21/9" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Skeleton className="h-36 rounded-lg" />
          <Skeleton className="h-36 rounded-lg" />
        </div>
      </div>
      <div className="flex w-full flex-col gap-3 lg:max-w-[30%] lg:min-w-[260px]">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-md" />
        ))}
      </div>
    </div>
  )
}

function BannerSectionSkeleton() {
  return (
    <div className="rounded-md px-0 py-4 md:px-0 md:py-6">
      <section className="w-full space-y-4 rounded-md border pb-4">
        <div className="flex items-center justify-between gap-4 px-4 pt-4 md:px-6">
          <Skeleton className="h-7 w-40 md:w-52" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
        <div className="grid grid-cols-1 gap-3 px-4 md:grid-cols-2 md:gap-4 md:px-6 lg:grid-cols-3">
          <div className="hidden flex-col gap-2 md:flex">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
          <Skeleton className="min-h-[280px] w-full rounded-xl md:min-h-[320px] lg:col-span-1" />
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function SlideSectionSkeleton() {
  return (
    <div className="w-full space-y-4 px-0 py-4 md:py-6">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  )
}

function TextSectionSkeleton() {
  return (
    <div className="w-full space-y-4 py-4 md:py-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="size-20 shrink-0 rounded-md" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VideoGridSkeleton() {
  return (
    <div className="w-full space-y-5 px-0 pt-4">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-8 w-36 md:w-48" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-md border border-border/60">
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RowSectionSkeleton() {
  return (
    <div className="w-full space-y-4 py-4 md:py-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="aspect-4/3 w-full rounded-lg" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  )
}

function ColumnSectionSkeleton() {
  return (
    <div className="w-full space-y-4 py-4 md:py-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3 border-b border-border/40 pb-4 last:border-0">
            <Skeleton className="size-24 shrink-0 rounded-md" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HomePageSkeleton() {
  const t = useTranslations("common")
  return (
    <div
      className="w-full min-h-[40vh] px-4 pb-4 md:px-6"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">{t("loading")}</span>
      <div className="w-full space-y-3 md:space-y-5">
        <TopNewsStripSkeleton />
        <TopBannerSkeleton />
        <BannerSectionSkeleton />
        <SlideSectionSkeleton />
        <TextSectionSkeleton />
        <VideoGridSkeleton />
        <RowSectionSkeleton />
        <SlideSectionSkeleton />
        <ColumnSectionSkeleton />
        <RowSectionSkeleton />
        <BannerSectionSkeleton />
        <SlideSectionSkeleton />
        <ColumnSectionSkeleton />
      </div>
    </div>
  )
}
