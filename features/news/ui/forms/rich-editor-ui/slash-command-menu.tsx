"use client"

import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  CaptionsIcon,
  Code2Icon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/shared/common/lib/utils"

type SlashCommand = {
  id: string
  label: string
}

type SlashCommandMenuProps = {
  open: boolean
  top: number
  left: number
  query: string
  activeIndex: number
  commands: SlashCommand[]
  onQueryChange: (next: string) => void
  onActiveIndexChange: (idx: number) => void
  onExecute: (idx: number) => void
}

export function SlashCommandMenu({
  open,
  top,
  left,
  query,
  activeIndex,
  commands,
  onQueryChange,
  onActiveIndexChange,
  onExecute,
}: SlashCommandMenuProps) {
  if (!open) return null

  const iconById: Record<string, LucideIcon> = {
    h1: Heading1Icon,
    h2: Heading2Icon,
    h3: Heading3Icon,
    quote: QuoteIcon,
    bullet: ListIcon,
    numbered: ListOrderedIcon,
    strike: StrikethroughIcon,
    sub: SubscriptIcon,
    sup: SuperscriptIcon,
    code: Code2Icon,
    left: AlignLeftIcon,
    center: AlignCenterIcon,
    right: AlignRightIcon,
    caption: CaptionsIcon,
  }

  return (
    <div
      className="absolute z-30 w-[280px] rounded-md border bg-background p-2 shadow-lg"
      style={{ top, left }}
    >
      <div className="mb-1 px-1 text-xs text-muted-foreground">/ Buyruqlar</div>
      <input
        value={query}
        onChange={(e) => {
          onQueryChange(e.target.value)
          onActiveIndexChange(0)
        }}
        placeholder="Qidirish..."
        className="mb-2 w-full rounded-md border bg-background px-2 py-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="max-h-60 space-y-1 overflow-y-auto">
        {commands.length === 0 ? (
          <div className="rounded-md border px-2 py-1 text-xs text-muted-foreground">Topilmadi</div>
        ) : (
          commands.map((cmd, idx) => {
            const Icon = iconById[cmd.id]
            return (
              <button
                key={cmd.id}
                type="button"
                className={cn(
                  "w-full rounded-md border px-2 py-1 text-left text-xs hover:bg-muted",
                  idx === activeIndex && "bg-muted"
                )}
                onMouseEnter={() => onActiveIndexChange(idx)}
                onClick={() => onExecute(idx)}
              >
                <span className="inline-flex items-center gap-2">
                  {Icon ? <Icon className="size-3.5 text-muted-foreground" /> : null}
                  <span>{cmd.label}</span>
                </span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
