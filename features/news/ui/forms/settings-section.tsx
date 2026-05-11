'use client'
import { useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/common/components/ui/card'
import { Label } from '@/shared/common/components/ui/label'
import { Switch } from '@/shared/common/components/ui/switch'
import { Button } from '@/shared/common/components/ui/button'
import { Badge } from '@/shared/common/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/common/components/ui/tooltip'
import { Save, Send, Trash2, RotateCcw, Archive, Ban, ExternalLink, Loader2 } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { NewsStatus } from '@/features/news/model'

const STATUS_LABELS: Record<NewsStatus, string> = {
  pending: 'Kutilmoqda',
  published: 'Nashr qilingan',
  cancelled: 'Bekor qilingan',
  deleted: "O'chirilgan (Savat)",
  archived: 'Arxivlangan',
}

type SettingsFormProps = {
  authorsChoice: boolean
  isTrending: boolean
  isPopular: boolean
  isTop: boolean
  isBreaking: boolean
  ad: boolean
  stats: boolean
  pushedToTelegram?: boolean
  canPublish: boolean
  publishDisabledReason?: string
  onBack: () => void
  onChangeAuthorsChoice: (value: boolean) => void
  onChangeIsTrending: (value: boolean) => void
  onChangeIsPopular: (value: boolean) => void
  onChangeIsTop: (value: boolean) => void
  onChangeIsBreaking: (value: boolean) => void
  onChangeAd: (value: boolean) => void
  onChangeStats: (value: boolean) => void
  onChangePushedToTelegram: (value: boolean) => void
  onSavePending: () => void
  onPublish: () => void
  isSaving?: boolean
  mode?: 'create' | 'edit'
  currentStatus?: NewsStatus
  onStatusChange?: (newStatus: NewsStatus) => void
  /** Edit rejimida: preview uchun yangilik slug (faqat status published bo‘lsa faol) */
  previewSlug?: string
  telegramMessageId?: number
  telegramMessageLink?: string
  telegramPushStatus?: 'sent' | 'failed'
  telegramPushReason?: string
  telegramLastAttemptAt?: string
  pushedToTelegramAt?: string
  isTelegramProcessing?: boolean
}

export function SettingsForm({
  authorsChoice,
  isTrending,
  isPopular,
  isTop,
  isBreaking,
  ad,
  stats,
  pushedToTelegram = false,
  canPublish,
  publishDisabledReason,
  onBack,
  onChangeAuthorsChoice,
  onChangeIsTrending,
  onChangeIsPopular,
  onChangeIsTop,
  onChangeIsBreaking,
  onChangeAd,
  onChangeStats,
  onChangePushedToTelegram,
  onSavePending,
  onPublish,
  isSaving = false,
  mode = 'create',
  currentStatus = 'published',
  onStatusChange,
  previewSlug,
  telegramMessageId,
  telegramMessageLink,
  telegramPushStatus,
  telegramPushReason,
  telegramLastAttemptAt,
  pushedToTelegramAt,
  isTelegramProcessing = false,
}: SettingsFormProps) {
  const statusLabel = STATUS_LABELS[currentStatus]
  const canRestore = ['pending', 'cancelled', 'deleted', 'archived'].includes(currentStatus)
  const canPublishBtn = currentStatus === 'pending'
  const canCancel = currentStatus === 'published' || currentStatus === 'pending'
  const canMoveToTrash = currentStatus !== 'deleted'
  const canArchive = currentStatus === 'published'
  const telegramEmbedSrc = telegramMessageLink
    ? `${telegramMessageLink}${telegramMessageLink.includes('?') ? '&' : '?'}embed=1`
    : null
  const [showTelegramPost, setShowTelegramPost] = useState(false)
  return (
    <Card className="p-0 border-none shadow-none bg-transparent">
      <CardContent className="space-y-2 px-0">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
          <Label htmlFor="authorsChoice" className="cursor-pointer">
            Muallif tanlovi
          </Label>
          <Switch id="authorsChoice" checked={authorsChoice} onCheckedChange={onChangeAuthorsChoice} />
        </div>
        {/* <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
          <Label htmlFor="isTrending" className="cursor-pointer">
            Trending
          </Label>
          <Switch id="isTrending" checked={isTrending} onCheckedChange={onChangeIsTrending} />
        </div> */}
        {/* <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
          <Label htmlFor="isPopular" className="cursor-pointer">
            Mashhur
          </Label>
          <Switch id="isPopular" checked={isPopular} onCheckedChange={onChangeIsPopular} />
        </div> */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
          <Label htmlFor="isTop" className="cursor-pointer">
            Top
          </Label>
          <Switch id="isTop" checked={isTop} onCheckedChange={onChangeIsTop} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
          <Label htmlFor="isBreaking" className="cursor-pointer">
            Dolzarb yangilik
          </Label>
          <Switch id="isBreaking" checked={isBreaking} onCheckedChange={onChangeIsBreaking} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
          <Label htmlFor="adNews" className="cursor-pointer">
            Bu yangilik reklama uchunmi?
          </Label>
          <Switch id="adNews" checked={ad} onCheckedChange={onChangeAd} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
          <Label htmlFor="statsNews" className="cursor-pointer">
            Bu yangilik maqola uchunmi?
          </Label>
          <Switch id="statsNews" checked={stats} onCheckedChange={onChangeStats} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
          <Label htmlFor="pushedToTelegram" className="cursor-pointer">
            Telegramga yuborilsinmi?
          </Label>
          <Switch
            id="pushedToTelegram"
            checked={pushedToTelegram}
            onCheckedChange={onChangePushedToTelegram}
            disabled={isTelegramProcessing}
          />
        </div>
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <p className="text-sm font-medium">Telegramga yuborilish holati</p>
            {telegramPushStatus ? (
              <Badge variant={telegramPushStatus === 'sent' ? 'default' : 'destructive'}>
                {telegramPushStatus === 'sent' ? 'Yuborilgan' : 'Yuborilmadi'}
              </Badge>
            ) : (
              <span>{pushedToTelegram ? "kutilmoqda (published bo'lganda)" : 'yo‘q'}</span>
            )}
          </div>
          {telegramPushReason ? (
            <p className="text-xs text-destructive">Sabab: {telegramPushReason}</p>
          ) : null}
          {telegramMessageLink ? (
            <a
              href={telegramMessageLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-xs text-primary hover:underline"
            >
              Telegramdagi post
            </a>
          ) : null}
          {telegramLastAttemptAt ? (
            <p className="text-xs text-muted-foreground">
              Oxirgi urinish: {new Date(telegramLastAttemptAt).toLocaleString()}
            </p>
          ) : null}
          {pushedToTelegramAt ? (
            <p className="text-xs text-muted-foreground">
              Yuborilgan: {new Date(pushedToTelegramAt).toLocaleString()}
            </p>
          ) : null}
          <div className="pt-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!telegramEmbedSrc}
              onClick={() => setShowTelegramPost((prev) => !prev)}
            >
              {showTelegramPost ? 'Telegram postni yashirish' : 'Telegram postni ko‘rsatish'}
            </Button>
            {!telegramEmbedSrc ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Post yuborilgandan keyin bu yerda haqiqiy Telegram card ochiladi.
              </p>
            ) : null}
          </div>
        </div>
        {telegramEmbedSrc && showTelegramPost ? (
          <div className="rounded-xl border bg-background p-3 pt-4 shadow-sm">
            <iframe
              src={telegramEmbedSrc}
              className="mx-auto block h-[540px] w-full max-w-[520px] rounded-lg bg-transparent"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : null}
        <div className="space-y-2 rounded-lg border p-4">
          <p className="text-sm font-medium">Yangilik statusi</p>
          <p className="text-xs text-muted-foreground">
            Joriy holat: <span className="font-semibold">{statusLabel}</span>
          </p>
          {/* {mode === 'create' ? (
            <p className="text-xs text-muted-foreground">
              Create rejimida status "Chop etish" bosilganda `published` ga o‘tadi.
            </p>
          ) : null} */}
        </div>
        {mode === 'edit' && onStatusChange && (
          <div className="space-y-3 rounded-lg border p-4">
            <p className="text-sm font-medium">Status amallari</p>
            <div className="flex flex-wrap gap-2">
              {canRestore && (
                <Button variant="default" size="sm" className="gap-2" onClick={() => onStatusChange('published')}>
                  <RotateCcw className="size-4" />
                  Qayta tiklash (nashr)
                </Button>
              )}
              {canPublishBtn && (
                <Button variant="secondary" size="sm" className="gap-2" onClick={() => onStatusChange('published')}>
                  <Send className="size-4" />
                  Chop etish
                </Button>
              )}
              {canCancel && (
                <Button variant="outline" size="sm" className="gap-2" onClick={() => onStatusChange('cancelled')}>
                  <Ban className="size-4" />
                  Bekor qilish
                </Button>
              )}
              {canMoveToTrash && (
                <Button variant="destructive" size="sm" className="gap-2" onClick={() => onStatusChange('deleted')}>
                  <Trash2 className="size-4" />
                  Savatga
                </Button>
              )}
              {canArchive && (
                <Button variant="outline" size="sm" className="gap-2" onClick={() => onStatusChange('archived')}>
                  <Archive className="size-4" />
                  Arxivlash
                </Button>
              )}
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-3 pt-4">
          <Button variant="outline" onClick={onBack} className="gap-2">
            Orqaga
          </Button>
          <Button variant="secondary" onClick={onSavePending} className="gap-2" disabled={isSaving}>
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Saqlash
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex" aria-disabled={!canPublish}>
                  <Button onClick={onPublish} className="gap-2" disabled={!canPublish || isSaving}>
                    {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    Chop etish
                  </Button>
                </span>
              </TooltipTrigger>
              {!canPublish && publishDisabledReason && (
                <TooltipContent sideOffset={6}>{publishDisabledReason}</TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          {mode === 'edit' && previewSlug != null && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      disabled={currentStatus !== 'published'}
                      asChild={currentStatus === 'published'}
                    >
                      {currentStatus === 'published' ? (
                        <Link href={`/news/${previewSlug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="size-4" />
                          Preview
                        </Link>
                      ) : (
                        <>
                          <ExternalLink className="size-4" />
                          Preview
                        </>
                      )}
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>
                  {currentStatus === 'published'
                    ? 'Client sahifada yangilikni ochish'
                    : 'Faqat nashr qilingan (published) yangilikni ko‘rish mumkin'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardContent>
    </Card>
  )
}