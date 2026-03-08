'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/common/components/ui/card'
import { Button } from '@/shared/common/components/ui/button'
import { Input } from '@/shared/common/components/ui/input'
import { Label } from '@/shared/common/components/ui/label'
import { Switch } from '@/shared/common/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/shared/common/components/ui/dropdown-menu'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { ChevronDown, ArrowRight, Save, Send, X } from 'lucide-react'
import { cn } from '@/shared/common/lib/utils'
import { getYoutubeEmbedUrl } from '@/shared/common/lib/youtube'

const LOCALES: AppLocale[] = ['uz', 'uzb', 'ru', 'en']
const LOCALE_LABELS: Record<AppLocale, string> = {
  uz: "O'zbek (lotin)",
  uzb: "O'zbek (kirill)",
  ru: 'Ruscha',
  en: 'English',
}

type CategoryOption = { slug: string; name: string }
type TagOption = { slug: string; name: string }

export type CreateNewsFormProps = {
  categories: CategoryOption[]
  tags: TagOption[]
  authors: string[]
  existingSlugs?: string[]
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
    .replace(/[^a-z0-9\u0400-\u04ff-]/g, '')
}

function titleToSlug(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean).slice(0, 10)
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

export function CreateNewsForm({ categories, tags, authors, existingSlugs = [] }: CreateNewsFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [translations, setTranslations] = useState<TranslationsState>(emptyTranslations())
  const [slug, setSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [categorySlug, setCategorySlug] = useState('')
  const [tagSlugs, setTagSlugs] = useState<string[]>([])
  const [author, setAuthor] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [minutes, setMinutes] = useState<number | ''>(3)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [imageFilePreviewUrls, setImageFilePreviewUrls] = useState<string[]>([])
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<AppLocale>('uz')
  const [isTop, setIsTop] = useState(false)
  const [authorsChoice, setAuthorsChoice] = useState(false)
  const [pushedToTelegram, setPushedToTelegram] = useState(false)

  const setTranslation = useCallback(
    (loc: AppLocale, field: 'title' | 'description', value: string) => {
      setTranslations((prev) => {
        const next = {
          ...prev,
          [loc]: { ...prev[loc], [field]: value },
        }
        if (loc === 'uz' && field === 'title' && !slugManuallyEdited) {
          const fromTitle = titleToSlug(value)
          setSlug(fromTitle ? ensureUniqueSlug(fromTitle, existingSlugs) : '')
        }
        return next
      })
    },
    [slugManuallyEdited, existingSlugs]
  )

  const tabHasData = (loc: AppLocale) => {
    const t = translations[loc]
    return !!(t.title?.trim() || t.description?.trim())
  }

  const uzTitleFilled = !!translations.uz.title?.trim()
  const resolvedMinutes = minutes === '' || minutes === undefined || isNaN(Number(minutes)) ? 3 : Number(minutes)
  const hasVideo = !!(videoUrl.trim() || videoFile)
  const resolvedType = hasVideo ? 'video' : undefined

  const handleSave = (status: 'pending' | 'published') => {
    const imageList = [
      ...imageUrls,
      ...imageFiles.map((f) => f.name),
    ]
    console.log('Save news', {
      translations,
      slug,
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
    })
    router.push('/dashboard/news')
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
      <div className="flex items-center gap-2 text-sm flex-wrap">
        <span className={cn('font-medium', step === 1 ? 'text-primary' : 'text-muted-foreground')}>
          Bosqich 1: Ma'lumotlar
        </span>
        <ArrowRight className="size-4 text-muted-foreground shrink-0" />
        <span className={cn('font-medium', step === 2 ? 'text-primary' : 'text-muted-foreground')}>
          Bosqich 2: Sozlamalar
        </span>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Tarjimali maydonlar</CardTitle>
            <CardDescription>Har bir til uchun sarlavha va tavsifni kiriting. uz sarlavha majburiy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor={`title-${activeTab}`}>
                  Sarlavha ({activeTab}) {activeTab === 'uz' && <span className="text-destructive">*</span>}
                </Label>
                <textarea
                  id={`title-${activeTab}`}
                  value={translations[activeTab].title}
                  onChange={(e) => setTranslation(activeTab, 'title', e.target.value)}
                  placeholder={activeTab === 'uz' ? 'Sarlavha (majburiy)' : 'Sarlavha'}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`desc-${activeTab}`}>Tavsif ({activeTab})</Label>
                <textarea
                  id={`desc-${activeTab}`}
                  value={translations[activeTab].description}
                  onChange={(e) => setTranslation(activeTab, 'description', e.target.value)}
                  placeholder="Qisqa tavsif"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Umumiy maydonlar</CardTitle>
            <CardDescription>Slug uz sarlavhadan avtomatik. Kategoriya, teglar va boshqalarni tanlang.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => {
                  const raw = e.target.value
                  const normalized = raw.trim() ? slugify(raw) : ''
                  const next = normalized ? ensureUniqueSlug(normalized, existingSlugs) : ''
                  setSlug(next)
                  setSlugManuallyEdited(!!raw.trim())
                }}
                placeholder="avtomatik uz sarlavhadan (birinchi 10 so'z)"
              />
            </div>
            <div className="space-y-2">
              <Label>Kategoriya</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {categoryName}
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
                  <DropdownMenuLabel>Kategoriyani tanlang</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {categories.map((c) => (
                    <DropdownMenuItem key={c.slug} onClick={() => setCategorySlug(c.slug)}>
                      {c.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Teglar</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    Teg qo'shish
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-60 w-(--radix-dropdown-menu-trigger-width) overflow-y-auto">
                  <DropdownMenuLabel>Teglarni tanlang</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {tags.map((t) => (
                    <DropdownMenuCheckboxItem
                      key={t.slug}
                      checked={selectedTagSlugsSet.has(t.slug)}
                      onCheckedChange={() => toggleTag(t.slug)}
                    >
                      {t.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTags.map((t) => (
                    <span
                      key={t.slug}
                      className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-sm"
                    >
                      {t.name}
                      <button
                        type="button"
                        onClick={() => toggleTag(t.slug)}
                        className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                        aria-label="O'chirish"
                      >
                        <X className="size-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Muallif</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {author || 'Muallifni tanlang'}
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
                  <DropdownMenuLabel>Muallif</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {authors.map((a) => (
                    <DropdownMenuItem key={a} onClick={() => setAuthor(a)}>
                      {a}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-2">
              <Label htmlFor="minutes">O'qish daqiqasi</Label>
              <Input
                id="minutes"
                type="number"
                min={0}
                value={minutes === '' ? '' : minutes}
                onChange={(e) => {
                  const v = e.target.value
                  setMinutes(v === '' ? '' : Number(v))
                }}
                placeholder="3 (bo'sh qoldirilsa 3)"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Rasmlar</CardTitle>
            <CardDescription>URL kiritish yoki shaxsiy PC dan rasm yuklash. Bir nechta rasm qo'shish mumkin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Input
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Rasm URL"
                className="max-w-xs"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
              />
              <Button type="button" variant="outline" size="sm" onClick={addImageUrl}>
                URL qo'shish
              </Button>
              <div className="space-y-2">
                <input
                  id="news-images-from-pc"
                  type="file"
                  accept="image/*"
                  multiple
                  className="block w-full min-w-0 text-sm text-muted-foreground file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground"
                  onChange={addImageFiles}
                />
              </div>
            </div>
            {(imageUrls.length > 0 || imageFiles.length > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {imageUrls.map((url, i) => (
                  <div
                    key={`url-${i}`}
                    className="relative group rounded-lg border overflow-hidden bg-muted aspect-square"
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImageUrl(i)}
                      className="absolute top-1 right-1 size-8 rounded-full bg-destructive/90 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="O'chirish"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
                {imageFiles.map((file, i) => (
                  <div
                    key={`file-${i}`}
                    className="relative group rounded-lg border overflow-hidden bg-muted aspect-square"
                  >
                    {imageFilePreviewUrls[i] ? (
                      <img
                        src={imageFilePreviewUrls[i]}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm p-2">
                        {file.name}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImageFile(i)}
                      className="absolute top-1 right-1 size-8 rounded-full bg-destructive/90 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="O'chirish"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Video</CardTitle>
            <CardDescription>URL yoki shaxsiy PC dan video. Kiritilsa yangilik turi «video» deb saqlanadi.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2 flex-1 min-w-[200px]">
                <Label>Video URL</Label>
                <Input
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value)
                    setVideoFile(null)
                  }}
                  placeholder="https://... yoki /videos/..."
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
                    setVideoFile(file)
                    if (file) setVideoUrl('')
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
                    className="w-full h-full object-contain"
                  >
                    Brauzeringiz video qo'llab-quvvatlamaydi.
                  </video>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <div className="flex flex-col items-end gap-2">
          {!uzTitleFilled && (
            <p className="text-sm text-destructive">uz sarlavha majburiy. Ikkinchi bosqichga o'tish uchun to'ldiring.</p>
          )}
          <Button onClick={() => setStep(2)} className="gap-2" disabled={!uzTitleFilled}>
            Davom etish
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Sozlamalar</CardTitle>
            <CardDescription>Switch orqali belgilang. Saqlash — status pending, Chop etish — nashr qilingan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
              <Label htmlFor="isTop" className="cursor-pointer">Top yangilik</Label>
              <Switch id="isTop" checked={isTop} onCheckedChange={setIsTop} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
              <Label htmlFor="authorsChoice" className="cursor-pointer">Muallif tanlovi</Label>
              <Switch id="authorsChoice" checked={authorsChoice} onCheckedChange={setAuthorsChoice} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
              <Label htmlFor="pushedToTelegram" className="cursor-pointer">Telegramga yuborish</Label>
              <Switch id="pushedToTelegram" checked={pushedToTelegram} onCheckedChange={setPushedToTelegram} />
            </div>
            <div className="flex flex-wrap gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                Orqaga
              </Button>
              <Button variant="secondary" onClick={() => handleSave('pending')} className="gap-2">
                <Save className="size-4" />
                Saqlash (pending)
              </Button>
              <Button onClick={() => handleSave('published')} className="gap-2">
                <Send className="size-4" />
                Chop etish
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
