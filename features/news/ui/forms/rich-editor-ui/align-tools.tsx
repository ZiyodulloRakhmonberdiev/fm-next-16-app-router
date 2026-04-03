"use client"

import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from "lucide-react"
import { ToolbarActionButton } from "./toolbar-action-button"
import type { EditorToolId } from "./types"

type AlignToolsProps = {
  isToolEnabled: (tool: EditorToolId) => boolean
  onLeft: () => void
  onCenter: () => void
  onRight: () => void
}

export function AlignTools({ isToolEnabled, onLeft, onCenter, onRight }: AlignToolsProps) {
  return (
    <>
      <ToolbarActionButton
        title="Align left"
        onClick={onLeft}
        hidden={!isToolEnabled("alignLeft")}
        className="gap-1"
      >
        <AlignLeftIcon className="size-3.5" />
      </ToolbarActionButton>
      <ToolbarActionButton
        title="Align center"
        onClick={onCenter}
        hidden={!isToolEnabled("alignCenter")}
        className="gap-1"
      >
        <AlignCenterIcon className="size-3.5" />
      </ToolbarActionButton>
      <ToolbarActionButton
        title="Align end"
        onClick={onRight}
        hidden={!isToolEnabled("alignRight")}
        className="gap-1"
      >
        <AlignRightIcon className="size-3.5" />
      </ToolbarActionButton>
    </>
  )
}
