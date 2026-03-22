"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@/shared/common/components/ui/button"
import { cn } from "@/shared/common/lib/utils"

export type LoadMoreButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "children"
> & {
  label: string
  showChevron?: boolean
}

export function LoadMoreButton({
  label,
  showChevron = true,
  className,
  type = "button",
  ...props
}: LoadMoreButtonProps) {
  return (
    <Button
      type={type}
      className={cn(
        "mt-2 md:mt-4 group transition rounded-sm cursor-pointer h-auto py-2",
        className
      )}
      {...props}
    >
      {showChevron ? (
        <ChevronRight className="block size-6 shrink-0 bg-background text-foreground rounded-full p-1 transition duration-200" aria-hidden />
      ) : null}
      {label}
      {/* {showChevron ? (
        <ChevronRight className="hidden group-hover:block size-7 shrink-0 bg-background text-foreground rounded-full p-1" aria-hidden />
      ) : null} */}
    </Button>
  )
}
