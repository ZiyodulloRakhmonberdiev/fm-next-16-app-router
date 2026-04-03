"use client"

import { PaintBucketIcon, PaletteIcon } from "lucide-react"
import { Button } from "@/shared/common/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/shared/common/components/ui/dropdown-menu"
import { cn } from "@/shared/common/lib/utils"
import type { EditorToolId, RichTextBg, RichTextColor } from "./types"

type ColorBgToolsProps = {
  isToolEnabled: (tool: EditorToolId) => boolean
  activeColor: RichTextColor
  activeBg: RichTextBg
  onColor: (value: Exclude<RichTextColor, "">) => void
  onBg: (value: Exclude<RichTextBg, "">) => void
}

const colorMap: Record<Exclude<RichTextColor, "">, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  orange: "#f97316",
  purple: "#a855f7",
  gray: "#6b7280",
}

const colorKeys = Object.keys(colorMap) as Exclude<RichTextColor, "">[]

const bgMap: Record<Exclude<RichTextBg, "">, string> = {
  yellow: "#fef08a",
  cyan: "#a5f3fc",
  green: "#bbf7d0",
  pink: "#fbcfe8",
  gray: "#e5e7eb",
  none: "transparent",
}

const bgKeys = Object.keys(bgMap) as Exclude<RichTextBg, "">[]

export function ColorBgTools({
  isToolEnabled,
  activeColor,
  activeBg,
  onColor,
  onBg,
}: ColorBgToolsProps) {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            
            title="Matn rangi"
            className={cn(!isToolEnabled("color") && "hidden")}
          >
            <PaletteIcon className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-40">
          <DropdownMenuRadioGroup
            value={activeColor || undefined}
            onValueChange={(v) => onColor(v as Exclude<RichTextColor, "">)}
          >
            {colorKeys.map((key) => (
              <DropdownMenuRadioItem
                key={key}
                value={key}
                className="gap-2 text-xs"
              >
                <span className="font-medium" style={{ color: colorMap[key] }}>
                  Aa
                </span>
                <span className="capitalize text-muted-foreground">{key}</span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            title="Bo&apos;yash"
            className={cn(!isToolEnabled("bg") && "hidden")}
          >
            <PaintBucketIcon className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-40">
          <DropdownMenuLabel className="text-xs">Bo&apos;yash</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={activeBg || undefined}
            onValueChange={(v) => onBg(v as Exclude<RichTextBg, "">)}
          >
            {bgKeys.map((key) => (
              <DropdownMenuRadioItem
                key={key}
                value={key}
                className="gap-2 text-xs"
              >
                <span
                  className="rounded px-1.5 py-0.5 font-medium"
                  style={{
                    backgroundColor: bgMap[key],
                    color: key === "none" ? "inherit" : undefined,
                  }}
                >
                  Aa
                </span>
                <span className="capitalize text-muted-foreground">
                  {key === "none" ? "Yo&apos;q" : key}
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
