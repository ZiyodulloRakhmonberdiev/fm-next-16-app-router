'use client'

import * as React from 'react'
import { Volume2, X, Play, Pause } from 'lucide-react'
import { Button } from '@/shared/common/components/ui/button'
import { cn } from '@/shared/common/lib/utils'
import type { NewsItem } from '@/features/news/model'

type AudioPlayerBarProps = {
  activeNews: NewsItem | null
  onClose: () => void
}

export function AudioPlayerBar({ activeNews, onClose }: AudioPlayerBarProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [currentTime, setCurrentTime] = React.useState(0)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  React.useEffect(() => {
    if (activeNews?.audioUrl) {
      setIsPlaying(true)
      if (audioRef.current) {
        audioRef.current.src = activeNews.audioUrl
        audioRef.current.play().catch(() => setIsPlaying(false))
      }
    } else {
      setIsPlaying(false)
    }
  }, [activeNews])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (!audioRef.current) return
    const current = audioRef.current.currentTime
    const total = audioRef.current.duration
    setCurrentTime(current)
    setProgress((current / total) * 100 || 0)
  }

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return
    setDuration(audioRef.current.duration)
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!activeNews) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="mx-auto max-w-7xl px-4 pb-4 md:px-6">
        <div className="relative overflow-hidden rounded-xl border border-white/20 bg-background/80 p-4 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="relative flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Volume2 className="size-6" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="truncate font-semibold text-sm md:text-base leading-none mb-1">
                {activeNews.title}
              </h4>
              <p className="truncate text-xs text-muted-foreground">
                {activeNews.author || 'Fergana Media'}
              </p>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden md:block text-xs font-mono tabular-nums text-muted-foreground">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
              
              <Button
                size="icon"
                variant="ghost"
                className="size-10 rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current ml-0.5" />}
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="size-8 text-muted-foreground hover:text-foreground"
                onClick={onClose}
              >
                <X className="size-5" />
              </Button>
            </div>
          </div>

          <div className="mt-4 px-1">
            <div className="h-1 w-full rounded-full bg-brand/10">
              <div 
                className="h-full rounded-full bg-brand transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        </div>
      </div>
    </div>
  )
}
