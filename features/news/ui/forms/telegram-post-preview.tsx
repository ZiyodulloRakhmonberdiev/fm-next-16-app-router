'use client'

import { Play } from 'lucide-react'
import { getYoutubeThumbnailUrl } from '@/shared/common/lib/youtube'

function truncateWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) return text.trim()
  return `${words.slice(0, maxWords).join(' ')}...`
}

/** Telegram yuborishdagi qisqa matn bilan mos */
export function truncateForTelegramCaption(text: string, maxWords = 56): string {
  return truncateWords(text, maxWords)
}

export type TelegramPostPreviewProps = {
  channelTitle: string
  channelUsername: string
  title: string
  description: string
  articleUrl: string
  /** `image` — faqat rasm; `video` — play + belgi */
  mediaKind: 'none' | 'image' | 'video'
  videoUrl?: string
  imageUrl?: string
  posterUrl?: string
}

const DEMO_REACTIONS = [{ emoji: '👍' }, { emoji: '❤️' }, { emoji: '😂' }, { emoji: '🔥' }]

export function TelegramPostPreview({
  channelTitle,
  channelUsername,
  title,
  description,
  articleUrl,
  mediaKind,
  videoUrl,
  imageUrl,
  posterUrl,
}: TelegramPostPreviewProps) {
  const ytThumb = mediaKind === 'video' && videoUrl?.trim() ? getYoutubeThumbnailUrl(videoUrl) : ''
  const mediaSrc = posterUrl || ytThumb || imageUrl || ''
  const showMedia = Boolean(mediaSrc)
  const showVideoChrome = mediaKind === 'video'
  const handle = channelUsername.replace(/^@/, '')

  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/80 pb-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#0088cc] text-xs font-bold text-white">
          TG
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">
            {channelTitle}
            <span className="ml-1 inline-flex size-3.5 items-center justify-center rounded-full bg-[#0088cc] text-[10px] text-white" title="Verified">
              ✓
            </span>
          </p>
          <p className="text-[11px] text-muted-foreground">kanal</p>
        </div>
      </div>

      {showMedia ? (
        <div className="relative mx-auto mt-2 aspect-video w-full max-w-lg overflow-hidden rounded-lg bg-black/10 dark:bg-black/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mediaSrc} alt="" className="h-full w-full object-cover" />
          {showVideoChrome ? (
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-black/60 text-white shadow-lg">
                  <Play className="size-8 fill-white" />
                </span>
              </div>
              <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                0:00
              </span>
            </>
          ) : null}
        </div>
      ) : mediaKind !== 'none' ? (
        <div className="mt-2 flex aspect-video max-w-lg items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-xs text-muted-foreground">
          Media qo‘shing (rasm / video)
        </div>
      ) : null}

      <div className="mt-3 space-y-2 text-[13px] leading-snug">
        <p className="font-bold text-foreground">{title || '—'}</p>
        {description ? (
          <p className="whitespace-pre-wrap text-muted-foreground">{description}</p>
        ) : null}
        <p className="pt-1">
          <span className="font-medium">Батафсил:</span>{' '}
          <span className="inline-flex flex-wrap items-center gap-1">
            👉{' '}
            {articleUrl && articleUrl !== '—' ? (
              <span className="break-all text-[#0088cc] underline">{articleUrl}</span>
            ) : (
              <span className="text-muted-foreground">
                (chop etishdan oldin slug va NEXT_PUBLIC_SITE_URL)
              </span>
            )}
          </span>
        </p>
        <p className="text-[#0088cc]">@{handle}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/80 pt-2">
        {DEMO_REACTIONS.map((r) => (
          <span
            key={r.emoji}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground"
          >
            <span>{r.emoji}</span>
            <span>—</span>
          </span>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Namuna ko‘rinish. Haqiqiy post va reaksiyalar Telegram ilovasida.
      </p>
    </div>
  )
}
