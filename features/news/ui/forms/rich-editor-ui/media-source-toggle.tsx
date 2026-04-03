"use client"

import { cn } from "@/shared/common/lib/utils"

type MediaSourceToggleProps = {
  value: "url" | "local"
  onChange: (value: "url" | "local") => void
}

export function MediaSourceToggle({ value, onChange }: MediaSourceToggleProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange("url")}
        className={cn(
          "rounded-md border px-3 py-1.5 text-xs font-medium",
          value === "url"
            ? "bg-primary text-primary-foreground border-primary"
            : "hover:bg-muted"
        )}
      >
        URL
      </button>
      <button
        type="button"
        onClick={() => onChange("local")}
        className={cn(
          "rounded-md border px-3 py-1.5 text-xs font-medium",
          value === "local"
            ? "bg-primary text-primary-foreground border-primary"
            : "hover:bg-muted"
        )}
      >
        Local fayl
      </button>
    </div>
  )
}
