import { Skeleton } from "@/shared/common/components/ui/skeleton"

export function TopNewsStripSkeleton() {
  return (
    <div className="mb-4 md:my-3">
      <div className="flex items-stretch gap-4 rounded-lg border border-border/40 bg-muted/30 px-4 py-3 md:gap-6">
        <div className="flex shrink-0 items-center gap-2 border-r border-border pr-4 md:pr-6">
          <Skeleton className="size-2 rounded-full" />
          <Skeleton className="hidden h-5 w-28 md:block" />
        </div>
        <div className="flex min-w-0 flex-1 gap-3 overflow-hidden py-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-14 w-[260px] shrink-0 rounded-lg md:w-[300px]"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function TopNewsCarouselSkeleton() {
  return (
    <Skeleton className="min-h-[420px] w-full rounded-xl md:min-h-[480px] lg:min-h-[520px]" />
  )
}

export function TopBannerSkeleton() {
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
