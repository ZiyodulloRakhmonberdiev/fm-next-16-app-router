'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/common/components/ui/card'
import { Input } from '@/shared/common/components/ui/input'
import { Label } from '@/shared/common/components/ui/label'

type VideoFormProps = {
  videoUrl: string
  videoDisplayUrl: string
  youtubeEmbedUrl: string | null
  onVideoUrlChange: (value: string) => void
  onVideoFileChange: (file: File | null) => void
}

export function VideoForm({
  videoUrl,
  videoDisplayUrl,
  youtubeEmbedUrl,
  onVideoUrlChange,
  onVideoFileChange,
}: VideoFormProps) {
  return (
    <Card className='pt-0 md:pt-4 border-none md:border-border'>
      <CardHeader className='px-0 md:px-4'>
        <CardTitle>Video</CardTitle>
        <CardDescription>URL yoki qurilmangizdan dan kiriting. Video kiritilsa yangilik turi «video» deb saqlanadi.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-0 md:px-4">
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
        {(videoDisplayUrl || youtubeEmbedUrl) && (
          <div className="rounded-lg border overflow-hidden bg-muted aspect-video max-w-2xl">
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}