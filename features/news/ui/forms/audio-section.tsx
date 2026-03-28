'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/common/components/ui/card'
import { Input } from '@/shared/common/components/ui/input'
import { Label } from '@/shared/common/components/ui/label'
import { X } from 'lucide-react'

type AudioFormProps = {
  audioUrl: string
  audioDisplayUrl: string
  hasAudioFile: boolean
  onAudioUrlChange: (value: string) => void
  onAudioFileChange: (file: File | null) => void
}

export function AudioForm({
  audioUrl,
  audioDisplayUrl,
  hasAudioFile,
  onAudioUrlChange,
  onAudioFileChange,
}: AudioFormProps) {
  const hasAudio = Boolean(audioUrl.trim() || hasAudioFile)
  const shownUrl = audioUrl.trim() || audioDisplayUrl

  return (
    <Card className='pt-0 md:pt-4 border-none bg-transparent md:border-border shadow-none'>
      <CardHeader className='px-0'>
        <CardTitle>Audio</CardTitle>
        <CardDescription>URL yoki qurilmangizdan audio fayl kiriting.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-0">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2 flex-1 min-w-[200px]">
            <Label>Audio URL</Label>
            <Input
              value={audioUrl}
              onChange={(e) => {
                onAudioUrlChange(e.target.value)
                onAudioFileChange(null)
              }}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>Yoki lokal fayl</Label>
            <input
              type="file"
              accept="audio/*"
              className="block text-sm text-muted-foreground file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null
                onAudioFileChange(file)
                if (file) onAudioUrlChange('')
              }}
            />
          </div>
        </div>
        
        {hasAudio ? (
          <div className="relative rounded-lg border p-4 bg-muted max-w-2xl">
            <audio
              src={audioDisplayUrl || audioUrl}
              controls
              className="w-full"
            >
              Brauzeringiz audio qo'llab-quvvatlamaydi.
            </audio>
            <button
              type="button"
              onClick={() => {
                onAudioFileChange(null)
                onAudioUrlChange('')
              }}
              className="absolute -top-2 -right-2 z-10 inline-flex size-6 items-center justify-center rounded-full bg-destructive text-white shadow-sm"
              aria-label="Audioni o‘chirish"
              title="Audioni o‘chirish"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : null}

        {hasAudio && shownUrl ? (
          <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <div className="font-medium text-foreground/80">Faol audio manbasi</div>
            <div className="mt-1 break-all font-mono">{shownUrl}</div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
