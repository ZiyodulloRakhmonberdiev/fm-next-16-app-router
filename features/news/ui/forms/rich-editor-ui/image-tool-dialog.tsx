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

type ImageToolDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mediaSource: "url" | "local"
  onMediaSourceChange: (value: "url" | "local") => void
  imageUrl: string
  onImageUrlChange: (value: string) => void
  imageCaption: string
  onImageCaptionChange: (value: string) => void
  onAddImageUrl: () => void
  onLocalImagesChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export function ImageToolDialog({
  open,
  onOpenChange,
  mediaSource,
  onMediaSourceChange,
  imageUrl,
  onImageUrlChange,
  imageCaption,
  onImageCaptionChange,
  onAddImageUrl,
  onLocalImagesChange,
}: ImageToolDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rasm qo&apos;shish</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <MediaSourceToggle value={mediaSource} onChange={onMediaSourceChange} />
          {mediaSource === "url" ? (
            <div className="space-y-2">
              <Label className="text-xs">Rasm manzili</Label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => onImageUrlChange(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button type="button" size="sm" onClick={onAddImageUrl} disabled={!imageUrl.trim()}>
                  Qo&apos;shish
                </Button>
              </div>
              <MediaCaptionField
                value={imageCaption}
                onChange={onImageCaptionChange}
                placeholder="Rasm uchun qisqa izoh..."
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-xs">Fayl tanlang</Label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={onLocalImagesChange}
                className="w-full text-sm"
              />
              <MediaCaptionField
                value={imageCaption}
                onChange={onImageCaptionChange}
                placeholder="Rasm uchun qisqa izoh..."
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
