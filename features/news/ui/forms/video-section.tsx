'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/common/components/ui/card'
import { Input } from '@/shared/common/components/ui/input'
import { Label } from '@/shared/common/components/ui/label'
import { X } from 'lucide-react'

type VideoFormProps = {
  videoUrl: string
  videoDisplayUrl: string
  youtubeEmbedUrl: string | null
  hasVideoFile: boolean
  videoCaption: string
  onVideoUrlChange: (value: string) => void
  onVideoCaptionChange: (value: string) => void
  onVideoFileChange: (file: File | null) => void
}

export function VideoForm({
  videoUrl,
  videoDisplayUrl,
  youtubeEmbedUrl,
  hasVideoFile,
  videoCaption,
  onVideoUrlChange,
  onVideoCaptionChange,
  onVideoFileChange,
}: VideoFormProps) {
  const hasVideo = Boolean(videoUrl.trim() || hasVideoFile)
  const shownUrl =
    (youtubeEmbedUrl ? videoUrl.trim() : '') ||
    (!youtubeEmbedUrl && videoUrl.trim() ? videoUrl.trim() : '') ||
    (!youtubeEmbedUrl && videoDisplayUrl ? videoDisplayUrl : '')
  return (
    <Card className='pt-0 md:pt-4 border-none bg-transparent md:border-border shadow-none'>
      <CardHeader className='px-0'>
        <CardTitle>Video</CardTitle>
        <CardDescription>URL yoki qurilmangizdan dan kiriting. Video kiritilsa yangilik turi «video» deb saqlanadi.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-0">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2 flex-1 min-w-[200px]">
            <Label>Video URL</Label>
            <Input
              value={videoUrl}
              onChange={(e) => {
                onVideoUrlChange(e.target.value)
                onVideoFileChange(null)
              }}
              placeholder="https://"
            />
          </div>
          <div className="space-y-2">
            <Label>Yoki lokal fayl</Label>
            <input
              type="file"
              accept="video/*"
              className="block text-sm text-muted-foreground file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null
                onVideoFileChange(file)
                if (file) onVideoUrlChange('')
              }}
            />
          </div>
        </div>
        <div className="max-w-xl space-y-2">
          <Label>Video caption (ixtiyoriy)</Label>
          <Input
            value={videoCaption}
            onChange={(e) => onVideoCaptionChange(e.target.value)}
            placeholder="Video ostida ko‘rinadigan qisqa izoh"
          />
        </div>
        {hasVideo ? (
          <div className="relative rounded-lg border overflow-hidden bg-muted aspect-video max-w-2xl">
            {youtubeEmbedUrl ? (
              <iframe
                src={youtubeEmbedUrl}
                title="YouTube video"
                className="w-full h-full min-h-[240px]"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={videoDisplayUrl}
                controls
                controlsList="nodownload"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-full object-contain"
              >
                Brauzeringiz video qo'llab-quvvatlamaydi.
              </video>
            )}
            <button
              type="button"
              onClick={() => {
                onVideoFileChange(null)
                onVideoUrlChange('')
              }}
              className="absolute top-2 right-2 z-10 inline-flex size-8 items-center justify-center rounded-full bg-destructive/90 text-white"
              aria-label="Videoni o‘chirish"
              title="Videoni o‘chirish"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : null}

        {hasVideo && shownUrl ? (
          <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <div className="font-medium text-foreground/80">Video URL</div>
            <div className="mt-1 break-all font-mono">{shownUrl}</div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}