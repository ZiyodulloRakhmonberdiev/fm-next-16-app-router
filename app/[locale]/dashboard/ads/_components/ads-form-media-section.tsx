"use client"

import type { RefObject } from "react"
import { Button } from "@/shared/common/components/ui/button"
import { Input } from "@/shared/common/components/ui/input"
import { Label } from "@/shared/common/components/ui/label"
import { Plus, Trash2, Upload } from "lucide-react"
import type { AdFormState } from "./ads-dashboard-types"

type AdsFormMediaSectionProps = {
  form: AdFormState
  setForm: React.Dispatch<React.SetStateAction<AdFormState>>
  mediaUploading: boolean
  mediaFileRef: RefObject<HTMLInputElement | null>
  handleMediaFileChange: (e: React.ChangeEvent<HTMLInputElement>, atIndex?: number) => void
}

export function AdsFormMediaSection({
  form,
  setForm,
  mediaUploading,
  mediaFileRef,
  handleMediaFileChange,
}: AdsFormMediaSectionProps) {
  return (
    <div className="space-y-2 md:col-span-2">
      <Label>Reklama media (1–10 ta) *</Label>
      <p className="text-xs text-muted-foreground">
        Davomiylik barcha rasmlar/videolar orasida teng bo&apos;lib taqsimlanadi.
      </p>
      <p className="text-xs text-muted-foreground">Tavsiya: 470×210 px yoki 16:9 nisbat</p>
      <div className="space-y-3">
        {form.media.map((url, index) => (
          <div key={index} className="space-y-1.5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                value={url}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    media: p.media.map((u, i) => (i === index ? e.target.value : u)),
                  }))
                }
                placeholder={`Media ${index + 1} URL`}
                className="min-w-0 flex-1"
              />
              <input
                ref={index === 0 ? mediaFileRef : null}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(ev) => handleMediaFileChange(ev, index)}
                data-media-index={index}
              />
              <div className="flex shrink-0 gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-10 shrink-0 sm:size-9"
                  disabled={mediaUploading}
                  onClick={() => {
                    const input =
                      index === 0
                        ? mediaFileRef.current
                        : document.querySelector<HTMLInputElement>(`input[data-media-index="${index}"]`)
                    input?.click()
                  }}
                  title="Yuklash"
                >
                  <Upload className="size-4" />
                </Button>
                {form.media.length > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-10 shrink-0 sm:size-9"
                    onClick={() =>
                      setForm((p) => ({ ...p, media: p.media.filter((_, i) => i !== index) }))
                    }
                    title="O'chirish"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>
            </div>
            {url.trim() ? (
              <div className="h-20 w-full max-w-full overflow-hidden rounded-md border bg-muted sm:max-w-[320px]">
                {/\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(url.trim()) ? (
                  <video src={url.trim()} className="h-full w-full object-cover" muted playsInline />
                ) : (
                  <img src={url.trim()} alt="" className="h-full w-full object-cover" />
                )}
              </div>
            ) : null}
          </div>
        ))}
        {form.media.length < 10 ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              id="add-media-file"
              multiple
              onChange={(e) => handleMediaFileChange(e)}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full justify-center sm:w-auto"
              disabled={mediaUploading}
              onClick={() => document.getElementById("add-media-file")?.click()}
            >
              <Plus className="mr-2 size-4 shrink-0" />
              Media qo&apos;shish (lokal)
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-center sm:w-auto"
              onClick={() => setForm((p) => ({ ...p, media: [...p.media, ""] }))}
            >
              <Plus className="mr-2 size-4 shrink-0" />
              URL qo&apos;shish
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
