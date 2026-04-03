"use client"

import { Label } from "@/shared/common/components/ui/label"

type MediaCaptionFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
}

export function MediaCaptionField({ value, onChange, placeholder }: MediaCaptionFieldProps) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">Caption (ixtiyoriy)</Label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  )
}
