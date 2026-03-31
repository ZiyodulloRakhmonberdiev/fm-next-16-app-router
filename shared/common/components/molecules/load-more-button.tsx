"use client"

import * as React from "react"
import { ChevronRight, RefreshCw } from "lucide-react"
import { Button } from "@/shared/common/components/ui/button"
import { cn } from "@/shared/common/lib/utils"

export type LoadMoreButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "children"
> & {
  label: string
  showChevron?: boolean
  loading?: boolean
}

export function LoadMoreButton({
  label,
  showChevron = true,
  loading = false,
  className,
  type = "button",
  ...props
}: LoadMoreButtonProps) {
  return (
    <Button
      type={type}
      variant="outline"
      className={cn(
        "mt-2 md:mt-4 group transition rounded-full cursor-pointer h-auto py-3 mx-auto px-6 bg-foreground/5",
        className
      )}
      disabled={props.disabled ?? loading}
      {...props}
    >
      {showChevron ? (
        <RefreshCw
          className={cn(
            "ml-6 block size-8 stroke-1 shrink-0 text-foreground rounded-full p-1 transition duration-200",
            loading ? "animate-spin" : ""
          )}
          aria-hidden
        />
      ) : null}
      <span className="mr-6 text-md font-medium">{label}</span>
      {/* {showChevron ? (
        <ChevronRight className="hidden group-hover:block size-7 shrink-0 bg-background text-foreground rounded-full p-1" aria-hidden />
      ) : null} */}
    </Button>
  )
}
