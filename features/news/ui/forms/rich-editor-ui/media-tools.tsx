"use client"

import { AudioLinesIcon, ImageIcon, PlaySquareIcon } from "lucide-react"
import { CaptionsIcon } from "lucide-react"
import { ToolbarActionButton } from "./toolbar-action-button"
import type { EditorToolId } from "./types"

type MediaToolsProps = {
  isToolEnabled: (tool: EditorToolId) => boolean
  onImage: () => void
  onVideo: () => void
  onAudio: () => void
  onCaption: () => void
}

export function MediaTools({
  isToolEnabled,
  onImage,
  onVideo,
  onAudio,
  onCaption,
}: MediaToolsProps) {
  return (
    <>
      <ToolbarActionButton title="Rasm" onClick={onImage} hidden={!isToolEnabled("image")}>
        <ImageIcon className="size-3.5" />
      </ToolbarActionButton>
      <ToolbarActionButton title="Video" onClick={onVideo} hidden={!isToolEnabled("video")}>
        <PlaySquareIcon className="size-3.5" />
      </ToolbarActionButton>
      <ToolbarActionButton title="Audio" onClick={onAudio} hidden={!isToolEnabled("audio")}>
        <AudioLinesIcon className="size-3.5" />
      </ToolbarActionButton>
      <ToolbarActionButton title="Caption" onClick={onCaption} hidden={!isToolEnabled("caption")}>
        <CaptionsIcon className="size-3.5" />
      </ToolbarActionButton>
    </>
  )
}
