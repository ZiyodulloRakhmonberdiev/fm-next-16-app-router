"use client"

import { Volume1 } from "lucide-react"

type AudioSectionProps = {
  audioUrl?: string
  audioCaption?: string
}

export function AudioSection({ audioUrl, audioCaption }: AudioSectionProps) {
  if (!audioUrl) return null

  return (
    <>
      <div className="mb-6 rounded-xl border bg-foreground/10 p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
          <Volume1 className="size-4 fill-current" />
          <span>Audio xabarni tinglang</span>
        </div>
        <audio
          src={audioUrl}
          controls
          className="w-full"
        >
          Brauzeringiz audio qo'llab-quvvatlamaydi.
        </audio>
      </div>
      {audioCaption ? (
        <p className="px-2 -mt-4 text-xs">
          {audioCaption}
        </p>
      ) : null}
    </>
  )
}
