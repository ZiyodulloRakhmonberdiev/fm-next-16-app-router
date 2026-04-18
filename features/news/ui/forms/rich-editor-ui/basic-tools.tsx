"use client"

import {
  BoldIcon,
  Code2Icon,
  ItalicIcon,
  Redo2Icon,
  StrikethroughIcon,
  Undo2Icon,
} from "lucide-react"
import { ToolbarActionButton } from "./toolbar-action-button"
import type { EditorToolId } from "./types"

type BasicToolsProps = {
  canUndo: boolean
  canRedo: boolean
  isToolEnabled: (tool: EditorToolId) => boolean
  onUndo: () => void
  onRedo: () => void
  onBold: () => void
  onItalic: () => void
  onUnderline: () => void
  onStrike: () => void
  onSub: () => void
  onSup: () => void
  onCode: () => void
  onH1: () => void
  onH2: () => void
  onH3: () => void
}

export function BasicTools({
  canUndo,
  canRedo,
  isToolEnabled,
  onUndo,
  onRedo,
  onBold,
  onItalic,
  onUnderline,
  onStrike,
  onSub,
  onSup,
  onCode,
  onH1,
  onH2,
  onH3,
}: BasicToolsProps) {
  return (
    <>
      <ToolbarActionButton title="Undo" onClick={onUndo} disabled={!canUndo} hidden={!isToolEnabled("undo")}>
        <Undo2Icon className="size-3.5" />
      </ToolbarActionButton>
      <ToolbarActionButton title="Redo" onClick={onRedo} disabled={!canRedo} hidden={!isToolEnabled("redo")}>
        <Redo2Icon className="size-3.5" />
      </ToolbarActionButton>
      <ToolbarActionButton title="Qalin" onClick={onBold} hidden={!isToolEnabled("bold")}>
        <BoldIcon className="size-3.5" />
      </ToolbarActionButton>
      <ToolbarActionButton title="Kursiv" onClick={onItalic} hidden={!isToolEnabled("italic")}>
        <ItalicIcon className="size-3.5" />
      </ToolbarActionButton>
      <ToolbarActionButton title="Pastki chiziq" onClick={onUnderline} hidden={!isToolEnabled("underline")}>
        <span className="text-xs font-semibold underline">U</span>
      </ToolbarActionButton>
      {/* <ToolbarActionButton title="Strikethrough" onClick={onStrike} hidden={!isToolEnabled("strike")}>
        <StrikethroughIcon className="size-3.5" />
      </ToolbarActionButton> */}
      {/* <ToolbarActionButton title="Subscript" onClick={onSub} hidden={!isToolEnabled("sub")}>
        x₂
      </ToolbarActionButton> */}
      {/* <ToolbarActionButton title="Superscript" onClick={onSup} hidden={!isToolEnabled("sup")}>
        x²
      </ToolbarActionButton> */}
      {/* <ToolbarActionButton title="Code block" onClick={onCode} hidden={!isToolEnabled("code")}>
        <Code2Icon className="size-3.5" />
      </ToolbarActionButton> */}
      <ToolbarActionButton title="H1" onClick={onH1} hidden={!isToolEnabled("h1")}>
        <span className="text-xs font-semibold">H1</span>
      </ToolbarActionButton>
      <ToolbarActionButton title="H2" onClick={onH2} hidden={!isToolEnabled("h2")}>
        <span className="text-xs font-semibold">H2</span>
      </ToolbarActionButton>
      <ToolbarActionButton title="H3" onClick={onH3} hidden={!isToolEnabled("h3")}>
        <span className="text-xs font-semibold">H3</span>
      </ToolbarActionButton>
    </>
  )
}
