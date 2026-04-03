"use client"

import { LinkIcon, ListIcon, ListOrderedIcon, QuoteIcon } from "lucide-react"
import { ToolbarActionButton } from "./toolbar-action-button"
import type { EditorToolId } from "./types"

type QuoteLinkListToolsProps = {
  isToolEnabled: (tool: EditorToolId) => boolean
  onLink: () => void
  onQuote: () => void
  onBullet: () => void
  onNumbered: () => void
}

export function QuoteLinkListTools({
  isToolEnabled,
  onLink,
  onQuote,
  onBullet,
  onNumbered,
}: QuoteLinkListToolsProps) {
  return (
    <>
      <ToolbarActionButton title="Havola" onClick={onLink} hidden={!isToolEnabled("link")}>
        <LinkIcon className="size-3.5" />
      </ToolbarActionButton>
      <ToolbarActionButton title="Qo'shtirnoq" onClick={onQuote} hidden={!isToolEnabled("quote")}>
        <QuoteIcon className="size-3.5" />
      </ToolbarActionButton>
      <ToolbarActionButton title="Nuqtali ro'yxat" onClick={onBullet} hidden={!isToolEnabled("bullet")}>
        <ListIcon className="size-3.5" />
      </ToolbarActionButton>
      <ToolbarActionButton
        title="Raqamli ro'yxat"
        onClick={onNumbered}
        hidden={!isToolEnabled("numbered")}
      >
        <ListOrderedIcon className="size-3.5" />
      </ToolbarActionButton>
    </>
  )
}
