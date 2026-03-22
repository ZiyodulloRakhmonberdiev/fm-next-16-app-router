"use client"

type NewsListingSkeletonProps = {
  pageSize: number
}

export function NewsListingSkeleton({ pageSize }: NewsListingSkeletonProps) {
  return (
    <>
      {Array.from({ length: pageSize }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg border bg-background p-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="h-44 w-full rounded-md bg-muted sm:h-28 sm:basis-1/3" />
            <div className="flex-1 space-y-3">
              <div className="h-3 w-2/3 rounded bg-muted" />
              <div className="h-4 w-5/6 rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-5/6 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
