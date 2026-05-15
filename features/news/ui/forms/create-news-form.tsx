'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from '@/i18n/navigation'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/shared/common/components/ui/button'
import { cn } from '@/shared/common/lib/utils'
import { getYoutubeEmbedUrl } from '@/features/news/lib/youtube'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/common/components/ui/tooltip'
import { TextForm } from './text-section'
import { GeneralsForm } from './generals-section'
import { ImageForm } from './image-section'
import { VideoForm } from './video-section'
import { AudioForm } from './audio-section'
import { ContentForm } from './content-section'
import { SettingsForm } from './settings-section'
import type { NewsStatus } from '@/features/news/model'
import type { EditNewsInitialData } from '@/features/news/lib/raw-to-edit-initial'
import { adminQueryKeys } from '@/features/dashboard/model/admin-hooks'
import { uploadFileViaPresignedUrl } from '@/shared/infra/cloudinary-client-upload'

const LOCALES: AppLocale[] = ['uz', 'uzb', 'ru', 'en']
const LOCALE_LABELS: Record<AppLocale, string> = {
  uz: "O'zbek (lotin)",
  uzb: "O'zbek (kirill)",
  ru: 'Ruscha',
  en: 'English',
}

type CategoryOption = { id: string; slug: string; name: string }
type ThemeOption = { id: string; slug: string; name: string }
type TagOption = { id: string; slug: string; name: string }
type AuthorOption = { id: string; name: string }

/** Edit rejimida forma uchun boshlang‘ich ma’lumot (serverdan keladi) */
export type CreateNewsFormProps = {
  categories: CategoryOption[]
  themes: ThemeOption[]
  tags: TagOption[]
  authors: AuthorOption[]
  existingSlugs?: string[]
  /** Berilsa — tahrirlash rejimi (barcha maydonlar shu qiymatlar bilan to‘ldiriladi) */
  initialData?: EditNewsInitialData
  /** Create sahifasida tashqi sticky tablar bilan boshqarish */
  controlledStep?: 1 | 2 | 3
  onControlledStepChange?: (step: 1 | 2 | 3) => void
  /** `true` bo‘lsa forma ichidagi step tablari chizilmaydi (ustidagi layoutda) */
  hideStepTabs?: boolean
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

export function CreateNewsForm({
  categories,
  themes,
  tags,
  authors,
  existingSlugs = [],
  initialData,
  controlledStep,
  onControlledStepChange,
  hideStepTabs = false,
}: CreateNewsFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const isEditMode = !!initialData
  const [savedNewsId, setSavedNewsId] = useState<string | undefined>(initialData?.id)
  const [firstPublishedAt, setFirstPublishedAt] = useState<string | undefined>(
    initialData?.publishedAt ? new Date(initialData.publishedAt).toISOString() : undefined
  )

  const [internalStep, setInternalStep] = useState<1 | 2 | 3>(1)
  const stepControlled =
    controlledStep !== undefined && typeof onControlledStepChange === 'function'
  const step = stepControlled ? controlledStep! : internalStep
  const setStep = (next: 1 | 2 | 3) => {
    if (stepControlled) onControlledStepChange!(next)
    else setInternalStep(next)
  }
  const [translations, setTranslations] = useState<TranslationsState>(
    () => initialData?.translations ?? emptyTranslations()
  )
  const [slugs, setSlugs] = useState<Record<AppLocale, string>>(
    () => initialData?.slugs ?? defaultSlugs()
  )
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? '')
  const [themeId, setThemeId] = useState(initialData?.themeId ?? '')
  const [tagIds, setTagIds] = useState<string[]>(() => initialData?.tagIds ?? [])
  const [authorId, setAuthorId] = useState(initialData?.authorId ?? '')
  const [imageUrls, setImageUrls] = useState<string[]>(() => initialData?.imageUrls ?? [])
  const [imageCaption, setImageCaption] = useState(initialData?.imageCaption ?? '')
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [minutes, setMinutes] = useState<number | ''>(initialData?.minutes ?? 3)
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl ?? '')
  const [videoCaption, setVideoCaption] = useState(initialData?.videoCaption ?? '')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState<AppLocale>('uz')
  const [audioUrl, setAudioUrl] = useState(initialData?.audioUrl ?? '')
  const [audioCaption, setAudioCaption] = useState(initialData?.audioCaption ?? '')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [authorsChoice, setAuthorsChoice] = useState(initialData?.authorsChoice ?? false)
  const [isTrending, setIsTrending] = useState(initialData?.isTrending ?? false)
  const [isLatest] = useState(initialData?.isLatest ?? false)
  const [isPopular, setIsPopular] = useState(initialData?.isPopular ?? false)
  const [isTop, setIsTop] = useState(initialData?.isTop ?? false)
  const [isBreaking, setIsBreaking] = useState(initialData?.isBreaking ?? false)
  const [ad, setAd] = useState(initialData?.ad ?? false)
  const [stats, setStats] = useState(initialData?.stats ?? false)
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

  const audioDisplayUrl = useMemo(() => {
    if (audioFile) return URL.createObjectURL(audioFile)
    return audioUrl
  }, [audioFile, audioUrl])

  const saveNews = useMutation({
    mutationFn: async ({
      status,
      pushedToTelegramOverride,
      videoFile: videoFileArg,
      videoUrl: videoUrlArg,
    }: {
      status: NewsStatus
      pushedToTelegramOverride?: boolean
      videoFile?: File | null
      videoUrl?: string
    }) => {
      const slug = (slugs.uz || slugs.uzb || slugs.ru || slugs.en || '').trim().toLowerCase()
      if (!slug) throw new Error('Slug majburiy')

      let finalVideoUrl: string | null = null
      let finalVideoSource: 'youtube' | 'local' | null = null
      if (videoFileArg) {
        finalVideoUrl = await uploadFileViaPresignedUrl(videoFileArg, 'video')
        finalVideoSource = 'local'
      } else if (videoUrlArg?.trim()) {
        finalVideoUrl = videoUrlArg.trim()
        finalVideoSource = 'youtube'
      }

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
      let finalAudioUrl: string | null = null
      let finalAudioSource: 'local' | 'external' | null = null
      if (audioFile) {
        finalAudioUrl = await uploadFileViaPresignedUrl(audioFile, 'audio')
        finalAudioSource = 'local'
      } else if (audioUrl.trim()) {
        finalAudioUrl = audioUrl.trim()
        finalAudioSource = 'external'
      }

      const payload = {
        slug,
        title,
        description,
        content,
        categoryId,
        themeId: themeId.trim() || null,
        tagIds,
        images: imageUrls,
        authorId: authorId.trim() || null,
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
        ad,
        stats,
        pushedToTelegram: pushedToTelegramOverride ?? pushedToTelegram,
        videoSource: finalVideoSource,
        videoUrl: finalVideoUrl,
        videoCaption: videoCaption.trim() || undefined,
        audioSource: finalAudioSource,
        audioUrl: finalAudioUrl,
        audioCaption: audioCaption.trim() || undefined,
        imageCaption: imageCaption.trim() || undefined,
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

  useEffect(() => {
    if (!categoryId && initialData?.categorySlug) {
      const fallbackCategoryId = categories.find((c) => c.slug === initialData.categorySlug)?.id
      if (fallbackCategoryId) setCategoryId(fallbackCategoryId)
    }
  }, [categoryId, categories, initialData?.categorySlug])

  useEffect(() => {
    if (tagIds.length === 0 && initialData?.tagSlugs?.length) {
      const fallbackTagIds = tags
        .filter((t) => initialData.tagSlugs.includes(t.slug))
        .map((t) => t.id)
      if (fallbackTagIds.length) setTagIds(fallbackTagIds)
    }
  }, [tagIds.length, tags, initialData?.tagSlugs])

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
    !!categoryId ||
    tagIds.length > 0 ||
    !!authorId.trim() ||
    imageUrls.length > 0 ||
    imageFiles.length > 0 ||
    !!videoUrl.trim() ||
    !!videoFile
  const resolvedMinutes = minutes === '' || minutes === undefined || isNaN(Number(minutes)) ? 3 : Number(minutes)
  const hasVideo = !!(videoUrl.trim() || videoFile)
  const hasAudio = !!(audioUrl.trim() || audioFile)
  const hasImage = imageUrls.length > 0 || imageFiles.length > 0
  const resolvedType: 'text' | 'image' | 'video' | 'audio' =
    hasVideo ? 'video' : hasAudio ? 'audio' : hasImage ? 'image' : 'text'

  const buildSavePayload = (status: 'pending' | 'published') => {
    const imageList = [
      ...imageUrls,
      ...imageFiles.map((f) => f.name),
    ]
    return {
      translations,
      slugs,
      content: contents,
      categoryId,
      themeId,
      tagIds,
      authorId,
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
      ad,
      stats,
      audioUrl: audioUrl.trim() || undefined,
      audioCaption: audioCaption.trim() || undefined,
      videoCaption: videoCaption.trim() || undefined,
      imageCaption: imageCaption.trim() || undefined,
      audioFile: audioFile?.name,
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
        videoFile,
        videoUrl,
      })
      if (videoFile) {
        setVideoFile(null)
        const savedDoc = saved as { videoUrl?: string }
        if (savedDoc?.videoUrl) setVideoUrl(savedDoc.videoUrl)
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
      setEditStatus(status)
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

  const handleSave = async (status: 'pending' | 'published', redirectOnSuccess: boolean) => {
    try {
      const saved = await saveNews.mutateAsync({ status, videoFile, videoUrl })
      if (videoFile) {
        setVideoFile(null)
        const savedDoc = saved as { videoUrl?: string }
        if (savedDoc?.videoUrl) setVideoUrl(savedDoc.videoUrl)
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
      setEditStatus(status)
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

  const categoryName = categories.find((c) => c.id === categoryId)?.name ?? (categoryId || '—')
  const themeName = themes.find((th) => th.id === themeId)?.name ?? (themeId || '')
  const authorName = authors.find((a) => a.id === authorId)?.name ?? ''
  const selectedTagIdsSet = new Set(tagIds)
  const toggleTag = (tagId: string) => {
    setTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((s) => s !== tagId) : [...prev, tagId]
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
      try {
        const uploadedUrl = await uploadFileViaPresignedUrl(file, 'image')
        uploadedUrls.push(uploadedUrl)
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

  const selectedTags = tagIds.map((id) => tags.find((t) => t.id === id)).filter(Boolean) as TagOption[]

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

  const stepTitles: Record<1 | 2 | 3, string> = {
    1: "Ma'lumotlar — sarlavha, kategoriya, media",
    2: 'Kontent — matn va bloklar',
    3: 'Telegram ko‘rinishi va chop etish',
  }

  return (
    <div className="space-y-6">
      {!hideStepTabs ? (
        <div className="sticky top-0 z-40 -mx-6 border-b border-border bg-background/95 px-4 md:px-6 py-3 shadow-sm backdrop-blur-md supports-backdrop-filter:bg-background/85">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            {([1, 2, 3] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => goToStep(s)}
                title={stepTitles[s]}
                aria-label={`${s}-bosqich: ${stepTitles[s]}`}
                aria-current={step === s ? 'step' : undefined}
                className={cn(
                  'flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold shadow-sm ring-offset-background transition-all sm:size-12 sm:text-base',
                  step === s
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}

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
            themes={themes}
            tags={tags}
            authors={authors}
            categoryId={categoryId}
            categoryName={categoryName}
            themeId={themeId}
            themeName={themeName}
            selectedTags={selectedTags}
            selectedTagIdsSet={selectedTagIdsSet}
            authorId={authorId}
            authorName={authorName}
            minutes={minutes}
            onCategoryChange={setCategoryId}
            onThemeChange={setThemeId}
            onToggleTag={toggleTag}
            onAuthorChange={setAuthorId}
            onMinutesChange={setMinutes}
          />

          <ImageForm
            imageUrlInput={imageUrlInput}
            imageUrls={imageUrls}
            imageFiles={imageFiles}
            imageFilePreviewUrls={imageFilePreviewUrls}
            imageCaption={imageCaption}
            onImageUrlInputChange={setImageUrlInput}
            onImageCaptionChange={setImageCaption}
            onAddImageUrl={addImageUrl}
            onAddImageFiles={addImageFiles}
            onRemoveImageUrl={removeImageUrl}
            onRemoveImageFile={removeImageFile}
          />

          <VideoForm
            videoUrl={videoUrl}
            videoDisplayUrl={videoDisplayUrl}
            youtubeEmbedUrl={youtubeEmbedUrl}
            hasVideoFile={Boolean(videoFile)}
            videoCaption={videoCaption}
            onVideoUrlChange={setVideoUrl}
            onVideoCaptionChange={setVideoCaption}
            onVideoFileChange={setVideoFile}
          />

          <AudioForm
            audioUrl={audioUrl}
            audioDisplayUrl={audioDisplayUrl}
            hasAudioFile={Boolean(audioFile)}
            audioCaption={audioCaption}
            onAudioUrlChange={setAudioUrl}
            onAudioCaptionChange={setAudioCaption}
            onAudioFileChange={setAudioFile}
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
          <div className="flex flex-wrap gap-2 rounded-lg border border-border/70 bg-muted/30">
            {LOCALES.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setActiveTab(loc)}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  activeTab === loc
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-transparent bg-background/80 text-muted-foreground hover:bg-background'
                )}
              >
                <span
                  className={cn(
                    'size-2 rounded-full',
                    tabHasData(loc) ? 'bg-emerald-500' : 'bg-muted-foreground/40'
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
                onGeminiTranslateContents={(next) => {
                  setContents(next)
                }}
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
            ad={ad}
            stats={stats}
            pushedToTelegram={pushedToTelegram}
            canPublish={canPublish}
            publishDisabledReason={publishDisabledReason}
            onBack={() => setStep(2)}
            onChangeAuthorsChoice={setAuthorsChoice}
            onChangeIsTrending={setIsTrending}
            onChangeIsPopular={setIsPopular}
            onChangeIsTop={setIsTop}
            onChangeIsBreaking={setIsBreaking}
            onChangeAd={setAd}
            onChangeStats={setStats}
            onChangePushedToTelegram={setPushedToTelegram}
            onSavePending={() => void savePendingWithoutRedirect(saveStatus === 'published' ? 'published' : 'pending')}
            // Create rejimida chop etgandan keyin redirect bo‘lmasin.
            onPublish={() => void handleSave('published', isEditMode)}
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
              ? async (newStatus: NewsStatus) => {
                  setEditStatus(newStatus)
                  try {
                    const saved = await saveNews.mutateAsync({ status: newStatus, videoFile, videoUrl }) as {
                      _id?: string
                      publishedAt?: string | Date
                      telegramMessageId?: number
                      telegramMessageLink?: string
                      telegramPushStatus?: 'sent' | 'failed'
                      telegramPushReason?: string
                      telegramLastAttemptAt?: string | Date
                      pushedToTelegramAt?: string | Date
                      videoUrl?: string
                    }
                    if (videoFile) {
                      setVideoFile(null)
                      if (saved?.videoUrl) setVideoUrl(saved.videoUrl)
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
