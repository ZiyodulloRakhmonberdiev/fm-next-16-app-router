"use client"

import type { ChangeEvent } from "react"
import { Button } from "@/shared/common/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/common/components/ui/dialog"
import { Label } from "@/shared/common/components/ui/label"
import { MediaCaptionField } from "./media-caption-field"
import { MediaSourceToggle } from "./media-source-toggle"

type AudioToolDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mediaSource: "url" | "local"
  onMediaSourceChange: (value: "url" | "local") => void
  audioUrl: string
  onAudioUrlChange: (value: string) => void
  audioCaption: string
  onAudioCaptionChange: (value: string) => void
  onAddAudioUrl: () => void
  onLocalAudiosChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export function AudioToolDialog({
  open,
  onOpenChange,
  mediaSource,
  onMediaSourceChange,
  audioUrl,
  onAudioUrlChange,
  audioCaption,
  onAudioCaptionChange,
  onAddAudioUrl,
  onLocalAudiosChange,
}: AudioToolDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Audio qo&apos;shish</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <MediaSourceToggle value={mediaSource} onChange={onMediaSourceChange} />
          {mediaSource === "url" ? (
            <div className="space-y-2">
              <Label className="text-xs">Audio manzili</Label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={audioUrl}
                  onChange={(e) => onAudioUrlChange(e.target.value)}
                  placeholder="https://example.com/audio.mp3"
                  className="flex-1 rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button type="button" size="sm" onClick={onAddAudioUrl} disabled={!audioUrl.trim()}>
                  Qo&apos;shish
                </Button>
              </div>
              <MediaCaptionField
                value={audioCaption}
                onChange={onAudioCaptionChange}
                placeholder="Audio uchun qisqa izoh..."
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-xs">Fayl tanlang</Label>
              <input
                type="file"
                accept="audio/*"
                multiple
                onChange={onLocalAudiosChange}
                className="w-full text-sm"
              />
              <MediaCaptionField
                value={audioCaption}
                onChange={onAudioCaptionChange}
                placeholder="Audio uchun qisqa izoh..."
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
