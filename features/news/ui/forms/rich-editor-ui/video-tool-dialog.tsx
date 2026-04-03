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

type VideoToolDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mediaSource: "url" | "local"
  onMediaSourceChange: (value: "url" | "local") => void
  videoUrl: string
  onVideoUrlChange: (value: string) => void
  videoCaption: string
  onVideoCaptionChange: (value: string) => void
  onAddVideoUrl: () => void
  onLocalVideosChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export function VideoToolDialog({
  open,
  onOpenChange,
  mediaSource,
  onMediaSourceChange,
  videoUrl,
  onVideoUrlChange,
  videoCaption,
  onVideoCaptionChange,
  onAddVideoUrl,
  onLocalVideosChange,
}: VideoToolDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Video qo&apos;shish</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <MediaSourceToggle value={mediaSource} onChange={onMediaSourceChange} />
          {mediaSource === "url" ? (
            <div className="space-y-2">
              <Label className="text-xs">Video manzili (yoki YouTube link)</Label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => onVideoUrlChange(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="flex-1 rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button type="button" size="sm" onClick={onAddVideoUrl} disabled={!videoUrl.trim()}>
                  Qo&apos;shish
                </Button>
              </div>
              <MediaCaptionField
                value={videoCaption}
                onChange={onVideoCaptionChange}
                placeholder="Video uchun qisqa izoh..."
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-xs">Fayl tanlang</Label>
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={onLocalVideosChange}
                className="w-full text-sm"
              />
              <MediaCaptionField
                value={videoCaption}
                onChange={onVideoCaptionChange}
                placeholder="Video uchun qisqa izoh..."
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
