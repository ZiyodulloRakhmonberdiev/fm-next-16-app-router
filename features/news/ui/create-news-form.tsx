'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from '@/i18n/navigation'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/shared/common/components/ui/button'
import { cn } from '@/shared/common/lib/utils'
import { getYoutubeEmbedUrl } from '@/shared/common/lib/youtube'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/common/components/ui/tooltip'
import { TextForm } from './text-form'
import { GeneralsForm } from './generals-form'
import { ImageForm } from './image-form'
import { VideoForm } from './video-form'
import { SettingsForm } from './settings-form'
import { ContentForm } from './content-form'
import type { NewsStatus } from '@/features/news/model'
import type { EditNewsInitialData } from '@/features/news/lib/raw-to-edit-initial'
import { adminQueryKeys } from '@/features/dashboard/model/admin-hooks'

const LOCALES: AppLocale[] = ['uz', 'uzb', 'ru', 'en']
const LOCALE_LABELS: Record<AppLocale, string> = {
  uz: "O'zbek (lotin)",
  uzb: "O'zbek (kirill)",
  ru: 'Ruscha',
  en: 'English',
}

type CategoryOption = { slug: string; name: string }
type TagOption = { slug: string; name: string }

/** Edit rejimida forma uchun boshlang‘ich ma’lumot (serverdan keladi) */
export type CreateNewsFormProps = {
  categories: CategoryOption[]
  tags: TagOption[]
  authors: string[]
  existingSlugs?: string[]
  /** Berilsa — tahrirlash rejimi (barcha maydonlar shu qiymatlar bilan to‘ldiriladi) */
  initialData?: EditNewsInitialData
}

type TranslationsState = Record<AppLocale, { title: string; description: string }>

const emptyTranslations = (): TranslationsState =>
  LOCALES.reduce(
    (acc, loc) => ({ ...acc, [loc]: { title: '', description: '' } }),
    {} as TranslationsState
  )

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function cyrillicToLatinForSlug(text: string): string {
  if (!text) return ''

  const map: Record<string, string> = {
    А: 'a',
    а: 'a',
    Б: 'b',
    б: 'b',
    В: 'v',
    в: 'v',
    Г: 'g',
    г: 'g',
    Д: 'd',
    д: 'd',
    Е: 'e',
    е: 'e',
    Ё: 'yo',
    ё: 'yo',
    Ж: 'j',
    ж: 'j',
    З: 'z',
    з: 'z',
    И: 'i',
    и: 'i',
    Й: 'y',
    й: 'y',
    К: 'k',
    к: 'k',
    Л: 'l',
    л: 'l',
    М: 'm',
    м: 'm',
    Н: 'n',
    н: 'n',
    О: 'o',
    о: 'o',
    П: 'p',
    п: 'p',
    Р: 'r',
    р: 'r',
    С: 's',
    с: 's',
    Т: 't',
    т: 't',
    У: 'u',
    у: 'u',
    Ф: 'f',
    ф: 'f',
    Х: 'x',
    х: 'x',
    Ц: 'ts',
    ц: 'ts',
    Ч: 'ch',
    ч: 'ch',
    Ш: 'sh',
    ш: 'sh',
    Щ: 'sh',
    щ: 'sh',
    Ъ: '',
    ъ: '',
    Ы: 'y',
    ы: 'y',
    Ь: '',
    ь: '',
    Э: 'e',
    э: 'e',
    Ю: 'yu',
    ю: 'yu',
    Я: 'ya',
    я: 'ya',
    Қ: 'q',
    қ: 'q',
    Ғ: "g'",
    ғ: "g'",
    Ҳ: 'h',
    ҳ: 'h',
    Ў: "o'",
    ў: "o'",
  }

  const withLatin = text
    .split('')
    .map((ch) => map[ch] ?? ch)
    .join('')

  return withLatin
}

function titleToSlug(title: string): string {
  const base = cyrillicToLatinForSlug(title)
  const words = base.trim().split(/\s+/).filter(Boolean).slice(0, 10)
  return slugify(words.join(' '))
}

function ensureUniqueSlug(baseSlug: string, existing: string[]): string {
  const set = new Set(existing.map((s) => s.toLowerCase()))
  const base = baseSlug.trim().toLowerCase() || 'slug'
  const normalized = slugify(base) || 'slug'
  if (!set.has(normalized)) return normalized
  let candidate = normalized
  do {
    const suffix = Math.floor(1000 + Math.random() * 9000)
    candidate = `${normalized}-${suffix}`
  } while (set.has(candidate))
  return candidate
}

const defaultSlugs = (): Record<AppLocale, string> =>
  LOCALES.reduce((acc, loc) => ({ ...acc, [loc]: '' }), {} as Record<AppLocale, string>)
const defaultContents = (): Record<AppLocale, string> =>
  LOCALES.reduce((acc, loc) => ({ ...acc, [loc]: '' }), {} as Record<AppLocale, string>)

class NewsFormApiError extends Error {
  description?: string

  constructor(message: string, description?: string) {
    super(message)
    this.name = 'NewsFormApiError'
    this.description = description
  }
}

function getValidationDescription(data: unknown): string | undefined {
  if (!data || typeof data !== 'object' || !('issues' in data)) return undefined
  const issues = (data as { issues?: { formErrors?: string[]; fieldErrors?: Record<string, string[] | undefined> } }).issues
  if (!issues) return undefined

  const lines: string[] = []
  if (issues.formErrors?.length) lines.push(...issues.formErrors)
  if (issues.fieldErrors) {
    for (const [field, msgs] of Object.entries(issues.fieldErrors)) {
      if (!msgs?.length) continue
      lines.push(`${field}: ${msgs.join(', ')}`)
    }
  }
  return lines.length ? lines.join('\n') : undefined
}

export function CreateNewsForm({ categories, tags, authors, existingSlugs = [], initialData }: CreateNewsFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const isEditMode = !!initialData
  const [savedNewsId, setSavedNewsId] = useState<string | undefined>(initialData?.id)
  const [firstPublishedAt, setFirstPublishedAt] = useState<string | undefined>(
    initialData?.publishedAt ? new Date(initialData.publishedAt).toISOString() : undefined
  )

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [translations, setTranslations] = useState<TranslationsState>(
    () => initialData?.translations ?? emptyTranslations()
  )
  const [slugs, setSlugs] = useState<Record<AppLocale, string>>(
    () => initialData?.slugs ?? defaultSlugs()
  )
  const [categorySlug, setCategorySlug] = useState(initialData?.categorySlug ?? '')
  const [tagSlugs, setTagSlugs] = useState<string[]>(() => initialData?.tagSlugs ?? [])
  const [author, setAuthor] = useState(initialData?.author ?? '')
  const [imageUrls, setImageUrls] = useState<string[]>(() => initialData?.imageUrls ?? [])
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [minutes, setMinutes] = useState<number | ''>(initialData?.minutes ?? 3)
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl ?? '')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState<AppLocale>('uz')
  const [authorsChoice, setAuthorsChoice] = useState(initialData?.authorsChoice ?? false)
  const [isTrending, setIsTrending] = useState(initialData?.isTrending ?? false)
  const [isLatest] = useState(initialData?.isLatest ?? false)
  const [isPopular, setIsPopular] = useState(initialData?.isPopular ?? false)
  const [isTop, setIsTop] = useState(initialData?.isTop ?? false)
  const [isBreaking, setIsBreaking] = useState(initialData?.isBreaking ?? false)
  const [pushedToTelegram, setPushedToTelegram] = useState(initialData?.pushedToTelegram ?? false)
  const [telegramMessageId, setTelegramMessageId] = useState<number | undefined>(initialData?.telegramMessageId)
  const [telegramMessageLink, setTelegramMessageLink] = useState<string | undefined>(initialData?.telegramMessageLink)
  const [telegramPushStatus, setTelegramPushStatus] = useState<'sent' | 'failed' | undefined>(initialData?.telegramPushStatus)
  const [telegramPushReason, setTelegramPushReason] = useState<string | undefined>(initialData?.telegramPushReason)
  const [telegramLastAttemptAt, setTelegramLastAttemptAt] = useState<string | undefined>(
    initialData?.telegramLastAttemptAt ? new Date(initialData.telegramLastAttemptAt).toISOString() : undefined
  )
  const [pushedToTelegramAt, setPushedToTelegramAt] = useState<string | undefined>(
    initialData?.pushedToTelegramAt ? new Date(initialData.pushedToTelegramAt).toISOString() : undefined
  )
  const [isTelegramProcessing, setIsTelegramProcessing] = useState(false)
  const [editStatus, setEditStatus] = useState<NewsStatus>(initialData?.status ?? 'pending')
  const saveStatus: NewsStatus = isEditMode ? editStatus : 'pending'

  const saveNews = useMutation({
    mutationFn: async ({
      status,
      pushedToTelegramOverride,
    }: {
      status: NewsStatus
      pushedToTelegramOverride?: boolean
    }) => {
      const slug = (slugs.uz || slugs.uzb || slugs.ru || slugs.en || '').trim().toLowerCase()
      if (!slug) throw new Error('Slug majburiy')

      const title = {
        uz: translations.uz.title.trim(),
        uzb: translations.uzb.title.trim(),
        ru: translations.ru.title.trim() || undefined,
        en: translations.en.title.trim() || undefined,
      }
      const description = {
        uz: translations.uz.description.trim() || undefined,
        uzb: translations.uzb.description.trim() || undefined,
        ru: translations.ru.description.trim() || undefined,
        en: translations.en.description.trim() || undefined,
      }
      const content = {
        uz: contents.uz.length ? contents.uz : undefined,
        uzb: contents.uzb.length ? contents.uzb : undefined,
        ru: contents.ru.length ? contents.ru : undefined,
        en: contents.en.length ? contents.en : undefined,
      }
      const payload = {
        slug,
        title,
        description,
        content,
        categorySlug,
        tagSlugs,
        images: imageUrls,
        author: author.trim(),
        minutes: resolvedMinutes,
        ...(isEditMode ? {} : { views: 0 }),
        publishedAt:
          status === 'published' && !firstPublishedAt
            ? new Date().toISOString()
            : undefined,
        status,
        type: resolvedType,
        authorsChoice,
        isTrending,
        isLatest,
        isPopular,
        isTop,
        isBreaking,
        pushedToTelegram: pushedToTelegramOverride ?? pushedToTelegram,
        videoSource: videoUrl.trim() ? 'youtube' : null,
        videoUrl: videoUrl.trim() || null,
      }

      const targetId = savedNewsId
      const url = targetId ? `/api/news/${targetId}` : '/api/news'
      const method = targetId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        const message =
          (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
            ? data.message
            : null) ||
          (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
            ? data.error
            : null) ||
          'Saqlashda xatolik'
        throw new NewsFormApiError(message, getValidationDescription(data))
      }
      return data as {
        _id?: string
        publishedAt?: string | Date
        telegramMessageId?: number
        telegramMessageLink?: string
        telegramPushStatus?: 'sent' | 'failed'
        telegramPushReason?: string
        telegramLastAttemptAt?: string | Date
        pushedToTelegramAt?: string | Date
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.news() })
    },
  })

  const [contents, setContents] = useState<Record<AppLocale, string>>(
    () => initialData?.contents ?? defaultContents()
  )

  const setTranslation = useCallback(
    (loc: AppLocale, field: 'title' | 'description', value: string) => {
      setTranslations((prev) => ({
        ...prev,
        [loc]: { ...prev[loc], [field]: value },
      }))

      if (field === 'title') {
        setSlugs((prev) => {
          // Agar title bo'sh bo'lsa, shu til uchun slugni ham tozalaymiz
          if (!value.trim()) {
            if (!prev[loc]) return prev
            return {
              ...prev,
              [loc]: '',
            }
          }

          const fromTitle = titleToSlug(value)
          if (!fromTitle) return prev
          const nextSlug = ensureUniqueSlug(fromTitle, existingSlugs)
          return {
            ...prev,
            [loc]: nextSlug,
          }
        })
      }
    },
    [existingSlugs]
  )

  const tabHasData = (loc: AppLocale) => {
    const t = translations[loc]
    const hasText = !!(t.title?.trim() || t.description?.trim())
    const hasContent = !!contents[loc]?.trim()
    return hasText || hasContent
  }

  const uzTitleFilled = !!translations.uz.title?.trim()
  const uzbTitleFilled = !!translations.uzb.title?.trim()
  const canPublish = uzTitleFilled && uzbTitleFilled
  const publishDisabledReason = !canPublish
    ? "Chop etish uchun uz va uzb sarlavhalarni kiriting."
    : ""
  const hasAnyData =
    Object.values(translations).some(
      (t) => t.title.trim() || t.description.trim()
    ) ||
    !!categorySlug ||
    tagSlugs.length > 0 ||
    !!author.trim() ||
    imageUrls.length > 0 ||
    imageFiles.length > 0 ||
    !!videoUrl.trim() ||
    !!videoFile
  const resolvedMinutes = minutes === '' || minutes === undefined || isNaN(Number(minutes)) ? 3 : Number(minutes)
  const hasVideo = !!(videoUrl.trim() || videoFile)
  const hasImage = imageUrls.length > 0 || imageFiles.length > 0
  const resolvedType: 'text' | 'image' | 'video' =
    hasVideo ? 'video' : hasImage ? 'image' : 'text'

  const buildSavePayload = (status: 'pending' | 'published') => {
    const imageList = [
      ...imageUrls,
      ...imageFiles.map((f) => f.name),
    ]
    return {
      translations,
      slugs,
      content: contents,
      categorySlug,
      tagSlugs,
      author,
      images: imageList,
      imageFiles: imageFiles.length,
      minutes: resolvedMinutes,
      videoUrl: videoUrl.trim() || undefined,
      videoFile: videoFile?.name,
      type: resolvedType,
      isTop,
      authorsChoice,
      isTrending,
      isLatest,
      isPopular,
      isBreaking,
      pushedToTelegram,
      status,
    }
  }

  const savePendingWithoutRedirect = async (
    status: NewsStatus = saveStatus,
    pushedToTelegramOverride?: boolean
  ): Promise<boolean> => {
    try {
      const saved = await saveNews.mutateAsync({
        status,
        pushedToTelegramOverride,
      })
      if (!savedNewsId && saved?._id) {
        setSavedNewsId(saved._id)
      }
      if (!firstPublishedAt && saved?.publishedAt) {
        setFirstPublishedAt(new Date(saved.publishedAt).toISOString())
      }
      setTelegramMessageId(saved.telegramMessageId)
      setTelegramMessageLink(saved.telegramMessageLink)
      setTelegramPushStatus(saved.telegramPushStatus)
      setTelegramPushReason(saved.telegramPushReason)
      setTelegramLastAttemptAt(
        saved.telegramLastAttemptAt ? new Date(saved.telegramLastAttemptAt).toISOString() : undefined
      )
      setPushedToTelegramAt(
        saved.pushedToTelegramAt ? new Date(saved.pushedToTelegramAt).toISOString() : undefined
      )
      toast.success("Yangilik saqlandi")
      return true
    } catch (err) {
      if (err instanceof NewsFormApiError) {
        toast.error(err.message, { description: err.description })
      } else {
        toast.error(err instanceof Error ? err.message : "Yangilikni saqlab bo'lmadi")
      }
      return false
    }
  }

  const syncTelegram = async (method: 'POST' | 'DELETE') => {
    if (!savedNewsId) return false
    const res = await fetch(`/api/news/${savedNewsId}/telegram`, { method })
    const data = await res.json().catch(() => null)
    if (!res.ok || !data) {
      throw new Error((data && data.error) || 'Telegram sync xatosi')
    }
    setPushedToTelegram(Boolean(data.pushedToTelegram))
    setTelegramMessageId(data.telegramMessageId)
    setTelegramMessageLink(data.telegramMessageLink)
    setTelegramPushStatus(data.telegramPushStatus)
    setTelegramPushReason(data.telegramPushReason)
    setTelegramLastAttemptAt(
      data.telegramLastAttemptAt ? new Date(data.telegramLastAttemptAt).toISOString() : undefined
    )
    setPushedToTelegramAt(
      data.pushedToTelegramAt ? new Date(data.pushedToTelegramAt).toISOString() : undefined
    )
    return true
  }

  const handleSendToTelegram = async () => {
    try {
      setIsTelegramProcessing(true)
      if (!savedNewsId) {
        const ok = await savePendingWithoutRedirect(saveStatus, true)
        if (!ok) return
      } else {
        setPushedToTelegram(true)
        const ok = await savePendingWithoutRedirect(saveStatus, true)
        if (!ok) return
      }
      await syncTelegram('POST')
      toast.success("Telegramga yuborish so'rovi bajarildi")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Telegramga yuborib bo‘lmadi')
    } finally {
      setIsTelegramProcessing(false)
    }
  }

  const handleRemoveFromTelegram = async () => {
    try {
      setIsTelegramProcessing(true)
      await syncTelegram('DELETE')
      toast.success("Telegramdan o'chirildi")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Telegramdan o'chirib bo'lmadi")
    } finally {
      setIsTelegramProcessing(false)
    }
  }

  const handleSave = async (status: 'pending' | 'published', redirectOnSuccess: boolean) => {
    try {
      const saved = await saveNews.mutateAsync({ status })
      if (!savedNewsId && saved?._id) {
        setSavedNewsId(saved._id)
      }
      if (!firstPublishedAt && saved?.publishedAt) {
        setFirstPublishedAt(new Date(saved.publishedAt).toISOString())
      }
      setTelegramMessageId(saved.telegramMessageId)
      setTelegramMessageLink(saved.telegramMessageLink)
      setTelegramPushStatus(saved.telegramPushStatus)
      setTelegramPushReason(saved.telegramPushReason)
      setTelegramLastAttemptAt(
        saved.telegramLastAttemptAt ? new Date(saved.telegramLastAttemptAt).toISOString() : undefined
      )
      setPushedToTelegramAt(
        saved.pushedToTelegramAt ? new Date(saved.pushedToTelegramAt).toISOString() : undefined
      )
      if (status === 'published') {
        toast.success("Yangilik muvaffaqiyatli chop etildi")
      } else {
        toast.success("Yangilik muvaffaqiyatli saqlandi")
      }
      if (redirectOnSuccess) {
        router.push('/dashboard/news')
      }
    } catch (err) {
      if (err instanceof NewsFormApiError) {
        toast.error(err.message, { description: err.description })
      } else {
        toast.error(err instanceof Error ? err.message : "Yangilikni saqlab bo'lmadi")
      }
    }
  }

  const goToStep = (target: 1 | 2 | 3) => {
    setStep(target)
  }
  const isSaving = saveNews.isPending

  const handleNextFromStep1 = () => {
    void savePendingWithoutRedirect().then((ok) => {
      if (ok) setStep(2)
    })
  }

  const handleNextFromStep2 = () => {
    void savePendingWithoutRedirect().then((ok) => {
      if (ok) setStep(3)
    })
  }

  const categoryName = categories.find((c) => c.slug === categorySlug)?.name ?? (categorySlug || '—')
  const selectedTagSlugsSet = new Set(tagSlugs)
  const toggleTag = (tagSlug: string) => {
    setTagSlugs((prev) =>
      prev.includes(tagSlug) ? prev.filter((s) => s !== tagSlug) : [...prev, tagSlug]
    )
  }

  const addImageUrl = () => {
    const url = imageUrlInput.trim()
    if (url) {
      setImageUrls((prev) => [...prev, url])
      setImageUrlInput('')
    }
  }

  const removeImageUrl = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const addImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const fileList = input.files
    if (!fileList || fileList.length === 0) return
    const files = Array.from(fileList)

    const uploadedUrls: string[] = []
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('kind', 'image')
      try {
        const res = await fetch('/api/uploads', { method: 'POST', credentials: 'include', body: formData })
        const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null
        if (!res.ok || !data?.url) {
          toast.error(data?.error || "Rasmni yuklab bo'lmadi")
          continue
        }
        uploadedUrls.push(data.url)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Rasmni yuklab bo'lmadi")
      }
    }

    if (uploadedUrls.length) {
      setImageUrls((prev) => [...prev, ...uploadedUrls])
    }

    // Fayl inputini tozalash
    input.value = ''
  }

  const removeImageFile = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const selectedTags = tagSlugs.map((slug) => tags.find((t) => t.slug === slug)).filter(Boolean) as TagOption[]

  const imageFilePreviewUrls = useMemo(
    () => imageFiles.map((f) => URL.createObjectURL(f)),
    [imageFiles]
  )
  useEffect(() => {
    return () => {
      imageFilePreviewUrls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [imageFilePreviewUrls])

  const videoPreviewUrl = useMemo(
    () => (videoFile ? URL.createObjectURL(videoFile) : null),
    [videoFile]
  )
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
    }
  }, [videoPreviewUrl])

  const videoDisplayUrl = videoUrl.trim() || videoPreviewUrl || ''
  const youtubeEmbedUrl = videoUrl.trim() ? getYoutubeEmbedUrl(videoUrl.trim()) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Button
          type="button"
          onClick={() => goToStep(1)}
          variant={step === 1 ? 'default' : 'outline'}
        >
          <span
            className={cn(
              'size-1.5 rounded-full',
              step === 1 ? 'bg-primary-foreground' : 'bg-muted-foreground/70'
            )}
          />
          Bosqich 1: Ma'lumotlar
        </Button>
        <ArrowRight className="size-4 text-muted-foreground shrink-0" />
        <Button
          type="button"
          onClick={() => goToStep(2)}
          variant={step === 2 ? 'default' : 'outline'}
        >
          <span
            className={cn(
              'size-1.5 rounded-full',
              step === 2 ? 'bg-primary-foreground' : 'bg-muted-foreground/70'
            )}
          />
          Bosqich 2: Kontent
        </Button>
        <ArrowRight className="size-4 text-muted-foreground shrink-0" />
        <Button
          type="button"
          onClick={() => goToStep(3)}
          variant={step === 3 ? 'default' : 'outline'}
        >
          <span
            className={cn(
              'size-1.5 rounded-full',
              step === 3 ? 'bg-primary-foreground' : 'bg-muted-foreground/70'
            )}
          />
          Bosqich 3: Sozlamalar
        </Button>
      </div>

      {step === 1 && (
        <>
          <TextForm
            locales={LOCALES}
            localeLabels={LOCALE_LABELS}
            activeTab={activeTab}
            translations={translations}
            slugs={slugs}
            tabHasData={tabHasData}
            onActiveTabChange={setActiveTab}
            onChangeTranslation={setTranslation}
            onChangeSlug={(loc, raw) => {
              const normalized = raw.trim() ? slugify(raw) : ''
              const next = normalized ? ensureUniqueSlug(normalized, existingSlugs) : ''
              setSlugs((prev) => ({
                ...prev,
                [loc]: next,
              }))
            }}
          />

          <GeneralsForm
            categories={categories}
            tags={tags}
            authors={authors}
            categorySlug={categorySlug}
            categoryName={categoryName}
            selectedTags={selectedTags}
            selectedTagSlugsSet={selectedTagSlugsSet}
            author={author}
            minutes={minutes}
            onCategoryChange={setCategorySlug}
            onToggleTag={toggleTag}
            onAuthorChange={setAuthor}
            onMinutesChange={setMinutes}
          />

          <ImageForm
            imageUrlInput={imageUrlInput}
            imageUrls={imageUrls}
            imageFiles={imageFiles}
            imageFilePreviewUrls={imageFilePreviewUrls}
            onImageUrlInputChange={setImageUrlInput}
            onAddImageUrl={addImageUrl}
            onAddImageFiles={addImageFiles}
            onRemoveImageUrl={removeImageUrl}
            onRemoveImageFile={removeImageFile}
          />

          <VideoForm
            videoUrl={videoUrl}
            videoDisplayUrl={videoDisplayUrl}
            youtubeEmbedUrl={youtubeEmbedUrl}
            onVideoUrlChange={setVideoUrl}
            onVideoFileChange={setVideoFile}
          />

          <div className="flex flex-col items-end gap-2">
            <TooltipProvider>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex" aria-disabled={!hasAnyData}>
                      <Button
                        variant="outline"
                        onClick={() => void savePendingWithoutRedirect()}
                        className="gap-2"
                        disabled={!hasAnyData || isSaving}
                      >
                        {isSaving && <Loader2 className="size-4 animate-spin" />}
                        Saqlash
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!hasAnyData && (
                    <TooltipContent sideOffset={6}>
                      Saqlash uchun yuqoridagi formga kamida bitta maydonni to‘ldiring.
                    </TooltipContent>
                  )}
                </Tooltip>
                <Button onClick={handleNextFromStep1} className="gap-2">
                  Davom etish
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </TooltipProvider>
          </div>
        </>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1 border-b border-border pb-2">
            {LOCALES.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setActiveTab(loc)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  activeTab === loc ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                )}
              >
                <span
                  className={cn(
                    'size-2 rounded-full',
                    tabHasData(loc) ? 'bg-green-500' : 'bg-muted-foreground/50'
                  )}
                  title={tabHasData(loc) ? "To'ldirilgan" : "Bo'sh"}
                />
                {LOCALE_LABELS[loc]}
              </button>
            ))}
          </div>

          {LOCALES.map((loc) => (
            <div key={loc} hidden={activeTab !== loc}>
              <ContentForm
                locale={loc}
                value={contents[loc]}
                allContents={contents}
                onChange={(next) =>
                  setContents((prev) => ({
                    ...prev,
                    [loc]: next,
                  }))
                }
              />
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              Orqaga
            </Button>
            <TooltipProvider>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex" aria-disabled={!hasAnyData}>
                      <Button
                        variant="outline"
                        onClick={() => void savePendingWithoutRedirect()}
                        className="gap-2"
                        disabled={!hasAnyData || isSaving}
                      >
                        {isSaving && <Loader2 className="size-4 animate-spin" />}
                        Saqlash
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!hasAnyData && (
                    <TooltipContent sideOffset={6}>
                      Saqlash uchun yuqoridagi formga kamida bitta maydonni to‘ldiring.
                    </TooltipContent>
                  )}
                </Tooltip>
                <Button onClick={handleNextFromStep2} className="gap-2">
                  Davom etish
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </TooltipProvider>
          </div>
        </div>
      )}

      {step === 3 && (
        <SettingsForm
          isTop={isTop}
          authorsChoice={authorsChoice}
          isTrending={isTrending}
          isPopular={isPopular}
          isBreaking={isBreaking}
          pushedToTelegram={pushedToTelegram}
          canPublish={canPublish}
          publishDisabledReason={publishDisabledReason}
          onBack={() => setStep(2)}
          onChangeAuthorsChoice={setAuthorsChoice}
          onChangeIsTrending={setIsTrending}
          onChangeIsPopular={setIsPopular}
          onChangeIsTop={setIsTop}
          onChangeIsBreaking={setIsBreaking}
          onSendToTelegram={() => void handleSendToTelegram()}
          onRemoveFromTelegram={() => void handleRemoveFromTelegram()}
          onSavePending={() => void savePendingWithoutRedirect(saveStatus === 'published' ? 'published' : 'pending')}
          onPublish={() => void handleSave('published', true)}
          isSaving={isSaving}
          isTelegramProcessing={isTelegramProcessing}
          mode={isEditMode ? 'edit' : 'create'}
          currentStatus={editStatus}
          telegramMessageId={telegramMessageId}
          telegramMessageLink={telegramMessageLink}
          telegramPushStatus={telegramPushStatus}
          telegramPushReason={telegramPushReason}
          telegramLastAttemptAt={telegramLastAttemptAt}
          pushedToTelegramAt={pushedToTelegramAt}
          onStatusChange={
            isEditMode
              ? async (newStatus) => {
                  setEditStatus(newStatus)
                  try {
                    const saved = await saveNews.mutateAsync({ status: newStatus }) as {
                      _id?: string
                      publishedAt?: string | Date
                      telegramMessageId?: number
                      telegramMessageLink?: string
                      telegramPushStatus?: 'sent' | 'failed'
                      telegramPushReason?: string
                      telegramLastAttemptAt?: string | Date
                      pushedToTelegramAt?: string | Date
                    }
                    if (!savedNewsId && saved?._id) {
                      setSavedNewsId(saved._id)
                    }
                    if (!firstPublishedAt && saved?.publishedAt) {
                      setFirstPublishedAt(new Date(saved.publishedAt).toISOString())
                    }
                    setTelegramMessageId(saved.telegramMessageId)
                    setTelegramMessageLink(saved.telegramMessageLink)
                    setTelegramPushStatus(saved.telegramPushStatus)
                    setTelegramPushReason(saved.telegramPushReason)
                    setTelegramLastAttemptAt(
                      saved.telegramLastAttemptAt ? new Date(saved.telegramLastAttemptAt).toISOString() : undefined
                    )
                    setPushedToTelegramAt(
                      saved.pushedToTelegramAt ? new Date(saved.pushedToTelegramAt).toISOString() : undefined
                    )
                    if (newStatus === 'published') toast.success('Yangilik nashr qilingan (published)')
                    else if (newStatus === 'cancelled') toast.success('Yangilik bekor qilindi')
                    else if (newStatus === 'deleted') toast.success("Yangilik Savatga o‘tkazildi")
                    else if (newStatus === 'archived') toast.success('Yangilik arxivlandi')
                  } catch (err) {
                    if (err instanceof NewsFormApiError) {
                      toast.error(err.message, { description: err.description })
                    } else {
                      toast.error(err instanceof Error ? err.message : "Statusni o'zgartirib bo'lmadi")
                    }
                  }
                }
              : undefined
          }
          previewSlug={isEditMode ? (slugs.uz || slugs.en || slugs.uzb || slugs.ru || '') : undefined}
        />
      )}
    </div>
  )
}
