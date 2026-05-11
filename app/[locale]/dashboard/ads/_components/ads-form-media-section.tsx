"use client"

import type { RefObject } from "react"
import { Button } from "@/shared/common/components/ui/button"
import { Input } from "@/shared/common/components/ui/input"
import { Label } from "@/shared/common/components/ui/label"
import { Trash2, Upload } from "lucide-react"
import type { AdFormState } from "./ads-dashboard-types"

type AdsFormMediaSectionProps = {
  form: AdFormState
  setForm: React.Dispatch<React.SetStateAction<AdFormState>>
  mediaUploading: boolean
  mediaFileRef: RefObject<HTMLInputElement | null>
  handleMediaFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function AdsFormMediaSection({
  form,
  setForm,
  mediaUploading,
  mediaFileRef,
  handleMediaFileChange,
}: AdsFormMediaSectionProps) {
  const mediaUrl = form.media[0] ?? ""

  return (
    <div className="space-y-2 md:col-span-2">
      <Label>Reklama media (1 ta) *</Label>
      <p className="text-xs text-muted-foreground">
        {/* Hozircha bitta media ishlatiladi. */}
      </p>
      <p className="text-xs text-muted-foreground">(470×210: Rasm va Matn format / 1300x200: Web format / 375x185: Mobile format)</p>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              value={mediaUrl}
              onChange={(e) => setForm((p) => ({ ...p, media: [e.target.value] }))}
              placeholder="Media URL"
              className="min-w-0 flex-1"
            />
            <input
              ref={mediaFileRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(ev) => handleMediaFileChange(ev)}
            />
            <div className="flex shrink-0 gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-10 shrink-0 sm:size-9"
                disabled={mediaUploading}
                onClick={() => mediaFileRef.current?.click()}
                title="Yuklash"
              >
                <Upload className="size-4" />
              </Button>
              {mediaUrl.trim() ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-10 shrink-0 sm:size-9"
                  onClick={() => setForm((p) => ({ ...p, media: [""] }))}
                  title="O'chirish"
                >
                  <Trash2 className="size-4" />
                </Button>
              ) : null}
            </div>
          </div>
          {mediaUrl.trim() ? (
            <div className="w-full max-w-full overflow-hidden rounded-md border bg-muted">
              {/\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(mediaUrl.trim()) ? (
                <video src={mediaUrl.trim()} className="h-full w-full object-cover" muted playsInline />
              ) : (
                <img src={mediaUrl.trim()} alt="" className="h-full w-full object-cover" />
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
