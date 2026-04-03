"use client"

import { cn } from "@/shared/common/lib/utils"
import type { MobileViewMode } from "./types"

type MobileViewToggleProps = {
  value: MobileViewMode
  onChange: (mode: MobileViewMode) => void
}

export function MobileViewToggle({ value, onChange }: MobileViewToggleProps) {
  return (
    <div className="md:hidden flex items-center gap-1 rounded-md border p-1">
      <button
        type="button"
        onClick={() => onChange("edit")}
        className={cn("rounded px-2 py-1 text-xs", value === "edit" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
      >
        Edit
      </button>
      <button
        type="button"
        onClick={() => onChange("preview")}
        className={cn("rounded px-2 py-1 text-xs", value === "preview" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
      >
        Preview
      </button>
      <button
        type="button"
        onClick={() => onChange("split")}
        className={cn("rounded px-2 py-1 text-xs", value === "split" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
      >
        Split
      </button>
    </div>
  )
}
