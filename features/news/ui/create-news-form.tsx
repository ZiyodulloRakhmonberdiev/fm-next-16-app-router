'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'
import { toast } from 'sonner'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { ArrowRight } from 'lucide-react'
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

export function CreateNewsForm({ categories, tags, authors, existingSlugs = [], initialData }: CreateNewsFormProps) {
  const router = useRouter()
  const isEditMode = !!initialData

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
  const [imageFilePreviewUrls, setImageFilePreviewUrls] = useState<string[]>([])
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<AppLocale>('uz')
  const [isTop, setIsTop] = useState(initialData?.isTop ?? false)
  const [authorsChoice, setAuthorsChoice] = useState(initialData?.authorsChoice ?? false)
  const [pushedToTelegram, setPushedToTelegram] = useState(initialData?.pushedToTelegram ?? false)
  const [editStatus, setEditStatus] = useState<NewsStatus>(initialData?.status ?? 'pending')

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
      pushedToTelegram,
      status,
    }
  }

  const handleSavePendingStay = () => {
    const payload = buildSavePayload('pending')
    console.log('Save news (stay on page)', payload)
    toast.success("Yangilik saqlandi (draft/pending holatda)")
  }

  const handleSave = (status: 'pending' | 'published') => {
    const payload = buildSavePayload(status)
    console.log('Save news', payload)
    if (status === 'published') {
      toast.success("Yangilik muvaffaqiyatli chop etildi")
    } else {
      toast.success("Yangilik muvaffaqiyatli saqlandi")
    }
    if (!isEditMode) {
      router.push('/dashboard/news')
    }
  }

  const goToStep = (target: 1 | 2 | 3) => {
    setStep(target)
  }

  const handleNextFromStep1 = () => {
    handleSavePendingStay()
    setStep(2)
  }

  const handleNextFromStep2 = () => {
    handleSavePendingStay()
    setStep(3)
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

  const addImageFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const fileList = input.files
    if (!fileList || fileList.length === 0) return
    const newFiles = Array.from(fileList)
    setImageFiles((prev) => [...prev, ...newFiles])
    requestAnimationFrame(() => {
      input.value = ''
    })
  }

  const removeImageFile = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const selectedTags = tagSlugs.map((slug) => tags.find((t) => t.slug === slug)).filter(Boolean) as TagOption[]

  useEffect(() => {
    const urls = imageFiles.map((f) => URL.createObjectURL(f))
    setImageFilePreviewUrls(urls)
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [imageFiles])

  useEffect(() => {
    if (!videoFile) {
      setVideoPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(videoFile)
    setVideoPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [videoFile])

  const videoDisplayUrl = videoUrl.trim() || videoPreviewUrl || ''
  const youtubeEmbedUrl = videoUrl.trim() ? getYoutubeEmbedUrl(videoUrl.trim()) : null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => goToStep(1)}
          className={cn(
            'flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium',
            step === 1 ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          <span
            className={cn(
              'size-1.5 rounded-full',
              step === 1 ? 'bg-primary-foreground' : 'bg-muted-foreground/70'
            )}
          />
          Bosqich 1: Ma&apos;lumotlar
        </button>
        <ArrowRight className="size-4 text-muted-foreground shrink-0" />
        <button
          type="button"
          onClick={() => goToStep(2)}
          className={cn(
            'flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium',
            step === 2 ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          <span
            className={cn(
              'size-1.5 rounded-full',
              step === 2 ? 'bg-primary-foreground' : 'bg-muted-foreground/70'
            )}
          />
          Bosqich 2: Kontent
        </button>
        <ArrowRight className="size-4 text-muted-foreground shrink-0" />
        <button
          type="button"
          onClick={() => goToStep(3)}
          className={cn(
            'flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium',
            step === 3 ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          <span
            className={cn(
              'size-1.5 rounded-full',
              step === 3 ? 'bg-primary-foreground' : 'bg-muted-foreground/70'
            )}
          />
          Bosqich 3: Sozlamalar
        </button>
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
                        onClick={handleSavePendingStay}
                        className="gap-2"
                        disabled={!hasAnyData}
                      >
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
                        onClick={handleSavePendingStay}
                        className="gap-2"
                        disabled={!hasAnyData}
                      >
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
          pushedToTelegram={pushedToTelegram}
          isBreaking={isTop}
          isPopular={authorsChoice}
          canPublish={canPublish}
          publishDisabledReason={publishDisabledReason}
          onBack={() => setStep(2)}
          onChangeIsTop={setIsTop}
          onChangeAuthorsChoice={setAuthorsChoice}
          onChangePushedToTelegram={setPushedToTelegram}
          onChangeIsBreaking={() => {}}
          onChangeIsPopular={() => {}}
          onSavePending={() => handleSave('pending')}
          onPublish={() => handleSave('published')}
          mode={isEditMode ? 'edit' : 'create'}
          currentStatus={editStatus}
          onStatusChange={
            isEditMode
              ? (newStatus) => {
                  setEditStatus(newStatus)
                  if (newStatus === 'published') toast.success('Yangilik nashr qilingan (published)')
                  else if (newStatus === 'cancelled') toast.success('Yangilik bekor qilindi')
                  else if (newStatus === 'deleted') toast.success("Yangilik Savatga o‘tkazildi")
                  else if (newStatus === 'archived') toast.success('Yangilik arxivlandi')
                }
              : undefined
          }
          previewSlug={isEditMode ? (slugs.uz || slugs.en || slugs.uzb || slugs.ru || '') : undefined}
        />
      )}
    </div>
  )
}
