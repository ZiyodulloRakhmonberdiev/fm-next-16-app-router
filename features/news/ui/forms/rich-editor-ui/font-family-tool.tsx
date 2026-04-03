"use client"

import type { CSSProperties } from "react"
import { TypeIcon } from "lucide-react"
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
import type { EditorToolId, RichTextFont } from "./types"

type FontFamilyToolProps = {
  isToolEnabled: (tool: EditorToolId) => boolean
  activeFont: RichTextFont
  onChange: (value: Exclude<RichTextFont, "">) => void
}

const fonts: { value: Exclude<RichTextFont, "">; label: string; style: CSSProperties }[] = [
  { value: "sans", label: "Sans", style: { fontFamily: "system-ui, sans-serif" } },
  { value: "serif", label: "Serif", style: { fontFamily: "serif" } },
  { value: "mono", label: "Mono", style: { fontFamily: "monospace" } },
  { value: "inter", label: "Inter", style: { fontFamily: "Inter, sans-serif" } },
  { value: "georgia", label: "Georgia", style: { fontFamily: "Georgia, serif" } },
  { value: "display", label: "Display", style: { fontFamily: "ui-rounded, system-ui, sans-serif" } },
]

export function FontFamilyTool({ isToolEnabled, activeFont, onChange }: FontFamilyToolProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          title="Shrift"
          className={cn(!isToolEnabled("font") && "hidden")}
        >
          <TypeIcon className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-40">
        <DropdownMenuLabel className="text-xs">Shrift</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={activeFont || undefined}
          onValueChange={(v) => onChange(v as Exclude<RichTextFont, "">)}
        >
          {fonts.map(({ value, label, style }) => (
            <DropdownMenuRadioItem key={value} value={value} className="gap-2 text-xs">
              <span style={style}>{label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
