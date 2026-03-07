"use client"

import * as React from "react"
import { getTruncateParts } from "@/shared/common/lib/truncate"
import { cn } from "@/shared/common/lib/utils"

const DEFAULT_MAX_LENGTH = 128

type TruncateExpandProps = {
  text: string
  maxLength?: number
  className?: string
  /** Wrapper element for visible text */
  as?: "span" | "p" | "div"
}

export function TruncateExpand({
  text,
  maxLength = DEFAULT_MAX_LENGTH,
  className,
  as: Wrapper = "span",
}: TruncateExpandProps) {
  const [expanded, setExpanded] = React.useState(false)
  const { visible, isTruncated } = React.useMemo(
    () => getTruncateParts(text, maxLength),
    [text, maxLength]
  )

  if (!text) return null

  if (!isTruncated || expanded) {
    return <Wrapper className={cn(className)}>{text}</Wrapper>
  }

  const handleExpand = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setExpanded(true)
  }

  return (
    <Wrapper className={cn("inline", className)}>
      {visible}
      <button
        type="button"
        onClick={handleExpand}
        onMouseDown={(e) => e.stopPropagation()}
        className="ml-0.5 inline-flex cursor-pointer items-center rounded border border-current px-1 py-0 align-baseline text-inherit opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
        aria-label="Show full text"
      >
        ...
      </button>
    </Wrapper>
  )
}
