'use client'

import * as React from 'react'
import { Pause, Play, Share2, SkipBack, SkipForward, Volume1, VolumeX } from 'lucide-react'
import { Button } from '@/shared/common/components/ui/button'
import { cn } from '@/shared/common/lib/utils'
import type { NewsItem } from '@/features/news/model'
import Image from 'next/image'
import { getSafeImageSrc } from '@/features/news/ui/news-listing/news-listing-utils'
import { FaMicrophone } from 'react-icons/fa6'

type AudioPlayerBarProps = {
  activeNews: NewsItem | null
  isPlaying?: boolean
  onPlayPause?: (playing: boolean) => void
  onPrev?: () => void
  onNext?: () => void
  hasPrev?: boolean
  hasNext?: boolean
  onClose: () => void
}

function EqualizerIcon({ playing }: { playing: boolean }) {
  return (
    <span className="inline-flex items-end gap-[2px] h-4 w-4" aria-hidden>
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={cn(
            "w-[3px] rounded-full bg-current origin-bottom",
            playing ? "animate-equalizer" : ""
          )}
          style={{
            height: playing ? undefined : `${[6, 10, 7, 9][i - 1]}px`,
            animationDelay: `${(i - 1) * 0.12}s`,
          }}
        />
      ))}
    </span>
  )
}

export function AudioPlayerBar({
  activeNews,
  isPlaying: externalIsPlaying,
  onPlayPause,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
  onClose,
}: AudioPlayerBarProps) {
  const [internalPlaying, setInternalPlaying] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [volume, setVolume] = React.useState(1)
  const [muted, setMuted] = React.useState(false)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  const isControlled = externalIsPlaying !== undefined
  const isPlaying = isControlled ? externalIsPlaying : internalPlaying

  const setPlayingState = React.useCallback(
    (playing: boolean) => {
      if (isControlled) {
        onPlayPause?.(playing)
      } else {
        setInternalPlaying(playing)
      }
    },
    [isControlled, onPlayPause]
  )

  React.useEffect(() => {
    if (!audioRef.current) return
    if (!activeNews?.audioUrl) {
      audioRef.current.pause()
      setPlayingState(false)
      setProgress(0)
      setCurrentTime(0)
      setDuration(0)
      return
    }
    if (audioRef.current.src !== activeNews.audioUrl) {
      audioRef.current.src = activeNews.audioUrl
      setProgress(0)
      setCurrentTime(0)
      setDuration(0)
    }
    if (isPlaying) {
      audioRef.current.play().catch(() => setPlayingState(false))
    } else {
      audioRef.current.pause()
    }
  }, [activeNews?.audioUrl, isPlaying, setPlayingState])

  React.useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = muted ? 0 : volume
  }, [muted, volume])

  const togglePlay = () => {
    if (!audioRef.current) return
    setPlayingState(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (!audioRef.current) return
    setCurrentTime(audioRef.current.currentTime)
    const total = audioRef.current.duration
    setProgress(total ? (audioRef.current.currentTime / total) * 100 : 0)
  }

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return
    setDuration(audioRef.current.duration)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration
  }

  const formatTime = (t: number) => {
    if (!isFinite(t) || isNaN(t)) return '0:00'
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const thumbSrc = activeNews ? getSafeImageSrc(activeNews.images?.[0]) : ''

  const handleShare = React.useCallback(async () => {
    if (!activeNews) return
    const pathParts = window.location.pathname.split('/').filter(Boolean)
    const locale = pathParts[0] || 'uz'
    const shareUrl = `${window.location.origin}/${locale}/news/${activeNews.slug}`
    const shareText = `${activeNews.title}\n${shareUrl}`
    try {
      if (navigator.share) {
        await navigator.share({ title: activeNews.title, text: activeNews.title, url: shareUrl })
        return
      }
      await navigator.clipboard.writeText(shareText)
    } catch {
      // no-op
    }
  }, [activeNews])

  if (!activeNews) return null

  return (
    <div
      className="sticky inset-x-0 z-10 bg-white dark:bg-accent/80 shadow-md backdrop-blur"
      style={{ top: 'var(--header-bar-height, 57px)' }}
    >
      <div className='md:pt-4 md:p-4 bg-white dark:bg-accent/80'>
        <div className="backdrop-blur md:px-0 md:pr-4">
          <div className="mx-auto max-w-7xl">
            {/* Mobile: controls + share, progress + time */}
            <div className="md:hidden py-2">
              <div className="flex items-center justify-between gap-2">
                <div className="ml-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setMuted((v) => !v)}
                    className="inline-flex size-4 items-center justify-center rounded-md text-muted-foreground"
                    aria-label="Volume toggle"
                  >
                    {muted || volume === 0 ? <VolumeX className="size-4 text-brand fill-brand opacity-70" /> : <Volume1 className="size-4 text-brand fill-brand opacity-70" />}
                  </button>
                  <div className="relative h-1.5 w-20 rounded-full bg-brand/5 dark:bg-foreground/10">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-brand/20 dark:bg-foreground/10"
                      style={{ width: `${(muted ? 0 : volume) * 100}%` }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.02}
                      value={muted ? 0 : volume}
                      onChange={(e) => {
                        const v = Number(e.target.value)
                        setVolume(v)
                        if (v > 0) setMuted(false)
                      }}
                      className="absolute inset-0 h-1 w-20 appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:mt-[-3px] [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand [&::-moz-range-track]:h-1 [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-brand"
                      aria-label="Volume"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex ml-4 size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Ulashish"
                  >
                    <Share2 className="size-4 text-brand fill-brand opacity-70" />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={!hasPrev}
                    onClick={onPrev}
                    className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground enabled:hover:bg-muted enabled:hover:text-foreground disabled:opacity-30"
                    aria-label="Oldingi"
                  >
                    <SkipBack className="size-4 text-brand/70 fill-brand/70" />
                  </button>
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="inline-flex size-11 items-center justify-center rounded-full p-2 bg-brand/10 hover:bg-brand/90 dark:bg-foreground/10"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="size-4 text-brand/70 fill-brand/70 dark:fill-foreground/50 dark:text-foreground/10" />
                    ) : (
                      <Play className="size-4 text-brand/70 fill-brand/70 ml-0.5 dark:fill-foreground/50 dark:text-foreground/10" />
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={!hasNext}
                    onClick={onNext}
                    className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground enabled:hover:bg-muted enabled:hover:text-foreground disabled:opacity-30"
                    aria-label="Keyingi"
                  >
                    <SkipForward className="size-4 text-brand/70 fill-brand/70" />
                  </button>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 px-2">
                <div className="h-0.5 flex-1 cursor-pointer rounded-full bg-brand/10 dark:bg-foreground/10" onClick={handleSeek}>
                  <div
                    className="relative h-full rounded-full bg-brand/70 transition-[width] duration-100"
                    style={{ width: `${progress}%` }}

                  >
                    <span className="absolute -right-1 -top-1 size-3 rounded-full bg-brand shadow-sm" />
                  </div>
                </div>
                <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Desktop: full bar */}
            <div className="hidden md:flex items-center gap-3">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-md bg-muted">
                {thumbSrc ? (
                  <Image src={thumbSrc} alt={activeNews.title} fill className="object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 w-96">
                <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  <FaMicrophone className="size-3 fill-current text-brand" />
                  Audio
                </div>
                <p className="text-sm font-semibold">{activeNews.title}</p>
              </div>
              <div className="flex items-center gap-1 ml-auto">
                <Button size="icon" variant="ghost" disabled={!hasPrev} onClick={onPrev} aria-label="Oldingi" className="size-8">
                  <SkipBack className="size-6 text-brand fill-brand" />
                </Button>
                <Button size="icon" variant="ghost" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} className="size-9 rounded-full border border-border p-2 bg-brand/5 w-14 h-14">
                  {isPlaying ? <Pause className="size-8 text-transparent fill-brand" /> : <Play className="size-8 text-transparent fill-brand ml-0.5" />}
                </Button>
                <Button size="icon" variant="ghost" disabled={!hasNext} onClick={onNext} aria-label="Keyingi" className="size-8">
                  <SkipForward className="size-6 text-brand fill-brand" />
                </Button>
              </div>
              <div className="mx-2 h-1.5 flex-1 cursor-pointer rounded-full bg-brand/5 dark:bg-foreground/10" onClick={handleSeek}>
                <div
                  className="relative h-full rounded-full bg-brand/70 transition-[width] duration-100"
                  style={{ width: `${progress}%` }}

                >
                  <span className="absolute -right-1 -top-1 size-4 rounded-full bg-brand shadow-sm" />
                </div>
              </div>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <span className='text-muted-foreground ml-2'>
                |
              </span>
              <div className="ml-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMuted((v) => !v)}
                  className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground"
                  aria-label="Volume toggle"
                >
                  {muted || volume === 0 ? <VolumeX className="size-6 text-brand fill-brand" /> : <Volume1 className="size-6 text-brand fill-brand" />}
                </button>
                <div className="relative h-1.5 w-20 rounded-full bg-brand/10 dark:bg-foreground/5">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-brand/30 dark:bg-foreground/10"
                    style={{ width: `${(muted ? 0 : volume) * 100}%` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.02}
                    value={muted ? 0 : volume}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      setVolume(v)
                      if (v > 0) setMuted(false)
                    }}
                    className="absolute inset-0 h-1 w-20 appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:mt-[-3px] [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand [&::-moz-range-track]:h-1 [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-brand"
                    aria-label="Volume"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex md:hidden items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Ulashish"
              >
                <Share2 className="size-4" />
              </button>
              {/* <button
              type="button"
              onClick={onClose}
              className="inline-flex  size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Yopish"
            >
              <X className="size-4" />
            </button> */}
            </div>
          </div>
        </div>

        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => {
            if (hasNext && onNext) onNext()
            else setPlayingState(false)
          }}
          className="hidden"
        />
      </div>
    </div>
  )
}
