"use client"

import type { ReactNode } from "react"
import { cn } from "@/shared/common/lib/utils"

type ToolbarActionButtonProps = {
  title: string
  onClick: () => void
  children: ReactNode
  hidden?: boolean
  disabled?: boolean
  className?: string
}

export function ToolbarActionButton({
  title,
  onClick,
  children,
  hidden,
  disabled,
  className,
}: ToolbarActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted disabled:opacity-50",
        hidden && "hidden",
        className
      )}
    >
      {children}
    </button>
  )
}
