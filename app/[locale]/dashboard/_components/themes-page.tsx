'use client'
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Link } from '@/i18n/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/common/components/ui/card'
import { Input } from '@/shared/common/components/ui/input'
import { Label } from '@/shared/common/components/ui/label'
import { Button } from '@/shared/common/components/ui/button'
import { Textarea } from '@/shared/common/components/ui/textarea'
import { Switch } from '@/shared/common/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/common/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/common/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/common/components/ui/select'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { LOCALES, LOCALE_LABELS } from '@/shared/common/lib/locale-constants'
import { Pencil, PlusCircle, Sparkles, Trash2, ExternalLink } from 'lucide-react'
import { cyrillicToLatinForSlug, slugify } from '@/shared/common/lib/slug'
import { useThemesQuery, useThemeMutations } from '@/features/dashboard/model/admin-hooks'
import { useThemesUiStore } from '@/features/dashboard/model/admin-ui-store'
import { getApiErrorDescription } from '@/features/dashboard/model/admin-api'
import { uploadThemeImage500 } from '@/shared/infra/cloudinary-client-upload'

function generateSlugFromNames(name: Record<AppLocale, string>): string {
  const base = name.en?.trim() || ''
  if (!base) return ''
  const latin = cyrillicToLatinForSlug(base)
  return slugify(latin || base)
}

type ThemeStatus = 'active' | 'inactive'

export type ThemeRow = {
  _id: string
  slug: string
  name: Record<AppLocale, string>
  subtitle: Record<AppLocale, string>
  description: Record<AppLocale, string>
  imageUrl?: string
  showInHomePage?: boolean
  showInHomeList?: boolean
  status: ThemeStatus
}

type ThemesPageProps = {
  locale: AppLocale
}

function emptyLocaleMap(): Record<AppLocale, string> {
  return { uz: '', uzb: '', ru: '', en: '' }
}

export function ThemesPage({ locale }: ThemesPageProps) {
  const { data, isLoading, error } = useThemesQuery()
  const { create, update, remove } = useThemeMutations()
  const { createOpen, editId, deleteId, setCreateOpen, setEditId, setDeleteId } = useThemesUiStore()
  const [createStatus, setCreateStatus] = useState<ThemeStatus>('active')
  const [editStatus, setEditStatus] = useState<ThemeStatus>('active')
  const [createShowInHomePage, setCreateShowInHomePage] = useState(false)
  const [createShowInHomeList, setCreateShowInHomeList] = useState(false)
  const [editShowInHomePage, setEditShowInHomePage] = useState(false)
  const [editShowInHomeList, setEditShowInHomeList] = useState(false)
  const [createImageUrl, setCreateImageUrl] = useState<string>('')
  const [editImageUrl, setEditImageUrl] = useState<string>('')
  const [imageBusy, setImageBusy] = useState(false)

  const themes = useMemo<ThemeRow[]>(
    () =>
      (data ?? []).map((t) => ({
        _id: t._id,
        slug: t.slug,
        name: t.name,
        subtitle: t.subtitle ?? emptyLocaleMap(),
        description: t.description ?? emptyLocaleMap(),
        imageUrl: (t as any).imageUrl || '',
        showInHomePage: Boolean(t.showInHomePage),
        showInHomeList: Boolean((t as any).showInHomeList),
        status: t.status ?? 'active',
      })),
    [data]
  )

  const editTheme = useMemo(() => themes.find((t) => t._id === editId) ?? null, [themes, editId])
  const deleteTheme = useMemo(() => themes.find((t) => t._id === deleteId) ?? null, [themes, deleteId])

  // keep edit image in sync when dialog opens
  useEffect(() => {
    if (!editTheme) return
    setEditImageUrl((editTheme.imageUrl ?? '').trim())
  }, [editTheme?._id])

  const showMutationError = (err: Error) => {
    toast.error(err.message || 'Validation error', {
      description: getApiErrorDescription(err),
    })
  }

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const name: Record<AppLocale, string> = {
      uz: (form.querySelector('[name="name_uz"]') as HTMLInputElement)?.value?.trim() ?? '',
      uzb: (form.querySelector('[name="name_uzb"]') as HTMLInputElement)?.value?.trim() ?? '',
      ru: (form.querySelector('[name="name_ru"]') as HTMLInputElement)?.value?.trim() ?? '',
      en: (form.querySelector('[name="name_en"]') as HTMLInputElement)?.value?.trim() ?? '',
    }
    const subtitle: Record<AppLocale, string> = {
      uz: (form.querySelector('[name="subtitle_uz"]') as HTMLInputElement)?.value?.trim() ?? '',
      uzb: (form.querySelector('[name="subtitle_uzb"]') as HTMLInputElement)?.value?.trim() ?? '',
      ru: (form.querySelector('[name="subtitle_ru"]') as HTMLInputElement)?.value?.trim() ?? '',
      en: (form.querySelector('[name="subtitle_en"]') as HTMLInputElement)?.value?.trim() ?? '',
    }
    const description: Record<AppLocale, string> = {
      uz: (form.querySelector('[name="description_uz"]') as HTMLTextAreaElement)?.value?.trim() ?? '',
      uzb: (form.querySelector('[name="description_uzb"]') as HTMLTextAreaElement)?.value?.trim() ?? '',
      ru: (form.querySelector('[name="description_ru"]') as HTMLTextAreaElement)?.value?.trim() ?? '',
      en: (form.querySelector('[name="description_en"]') as HTMLTextAreaElement)?.value?.trim() ?? '',
    }
    const slug = generateSlugFromNames(name)
    if (!slug) {
      toast.error('Validation error', {
        description: "Inglizcha nom (en) bo'yicha slug hosil qilib bo'lmadi.",
      })
      return
    }
    const exists = themes.some((t) => t.slug.toLowerCase() === slug.toLowerCase())
    if (exists) {
      toast.error('Validation error', {
        description: `slug: "${slug}" allaqachon mavjud.`,
      })
      return
    }
    create.mutate(
      { slug, name, subtitle, description, imageUrl: createImageUrl || undefined, showInHomePage: createShowInHomePage, showInHomeList: createShowInHomeList, status: createStatus },
      {
        onSuccess: () => {
          setCreateOpen(false)
          setCreateStatus('active')
          setCreateShowInHomePage(false)
          setCreateShowInHomeList(false)
          setCreateImageUrl('')
          toast.success("Tema muvaffaqiyatli qo'shildi")
        },
        onError: showMutationError,
      }
    )
  }

  const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editTheme) return
    const form = e.currentTarget
    const name: Record<AppLocale, string> = {
      uz: (form.querySelector('[name="name_uz"]') as HTMLInputElement)?.value?.trim() ?? '',
      uzb: (form.querySelector('[name="name_uzb"]') as HTMLInputElement)?.value?.trim() ?? '',
      ru: (form.querySelector('[name="name_ru"]') as HTMLInputElement)?.value?.trim() ?? '',
      en: (form.querySelector('[name="name_en"]') as HTMLInputElement)?.value?.trim() ?? '',
    }
    const subtitle: Record<AppLocale, string> = {
      uz: (form.querySelector('[name="subtitle_uz"]') as HTMLInputElement)?.value?.trim() ?? '',
      uzb: (form.querySelector('[name="subtitle_uzb"]') as HTMLInputElement)?.value?.trim() ?? '',
      ru: (form.querySelector('[name="subtitle_ru"]') as HTMLInputElement)?.value?.trim() ?? '',
      en: (form.querySelector('[name="subtitle_en"]') as HTMLInputElement)?.value?.trim() ?? '',
    }
    const description: Record<AppLocale, string> = {
      uz: (form.querySelector('[name="description_uz"]') as HTMLTextAreaElement)?.value?.trim() ?? '',
      uzb: (form.querySelector('[name="description_uzb"]') as HTMLTextAreaElement)?.value?.trim() ?? '',
      ru: (form.querySelector('[name="description_ru"]') as HTMLTextAreaElement)?.value?.trim() ?? '',
      en: (form.querySelector('[name="description_en"]') as HTMLTextAreaElement)?.value?.trim() ?? '',
    }
    const slug = generateSlugFromNames(name)
    if (!slug) {
      toast.error('Validation error', {
        description: "Inglizcha nom (en) bo'yicha slug hosil qilib bo'lmadi.",
      })
      return
    }
    const exists = themes.some((t) => t._id !== editTheme._id && t.slug.toLowerCase() === slug.toLowerCase())
    if (exists) {
      toast.error('Validation error', {
        description: `slug: "${slug}" allaqachon mavjud.`,
      })
      return
    }
    update.mutate(
      { id: editTheme._id, payload: { slug, name, subtitle, description, imageUrl: editImageUrl || undefined, showInHomePage: editShowInHomePage, showInHomeList: editShowInHomeList, status: editStatus } },
      {
        onSuccess: () => {
          setEditId(null)
          toast.success('Tema muvaffaqiyatli yangilandi')
        },
        onError: showMutationError,
      }
    )
  }

  const handleThemeImagePick = async (file: File | null, mode: 'create' | 'edit') => {
    if (!file) return
    setImageBusy(true)
    try {
      const url = await uploadThemeImage500(file)
      if (mode === 'create') setCreateImageUrl(url)
      else setEditImageUrl(url)
      toast.success("Rasm yuklandi (500x500)")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Rasmni yuklab bo'lmadi")
    } finally {
      setImageBusy(false)
    }
  }

  const handleDeleteConfirm = () => {
    if (!deleteTheme) return
    remove.mutate(deleteTheme._id, {
      onSuccess: () => {
        setDeleteId(null)
        toast.success("Tema muvaffaqiyatli o'chirildi")
      },
      onError: showMutationError,
    })
  }

  return (
    <div className="space-y-6 min-w-0 overflow-hidden">
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="size-6" />
              Temalar
            </CardTitle>
            <CardDescription>Yangiliklarni mavzu bo'yicha birlashtirish uchun temalar ro'yxati.</CardDescription>
          </div>
          <Button onClick={() => { setCreateShowInHomePage(false); setCreateOpen(true) }} size="lg" className="shrink-0 w-full md:w-auto">
            <PlusCircle className="size-4 mr-2" />
            Yangi tema
          </Button>
        </CardHeader>
      </Card>

      <Card className="py-4 md:py-6">
        <CardHeader className="px-4 md:px-6">
          <CardTitle className="text-base">Ro'yxat</CardTitle>
          <CardDescription>Jami: {themes.length} ta tema</CardDescription>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
          ) : error ? (
            <p className="text-sm text-destructive">Temalarni yuklab bo'lmadi.</p>
          ) : null}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slug</TableHead>
                  <TableHead>Nom (uz)</TableHead>
                  <TableHead>Nom (uzb)</TableHead>
                  <TableHead>Nom (ru)</TableHead>
                  <TableHead>Nom (en)</TableHead>
                  <TableHead>Subtitle (uz)</TableHead>
                  <TableHead>Description (uz)</TableHead>
                  <TableHead>Home</TableHead>
                  <TableHead>Home list</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[170px]">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {themes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      Tema topilmadi
                    </TableCell>
                  </TableRow>
                ) : (
                  themes.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell className="text-sm">{row.slug}</TableCell>
                      <TableCell>{row.name.uz}</TableCell>
                      <TableCell>{row.name.uzb}</TableCell>
                      <TableCell>{row.name.ru}</TableCell>
                      <TableCell>{row.name.en}</TableCell>
                      <TableCell>{row.subtitle.uz}</TableCell>
                      <TableCell className="max-w-[320px]">
                        <span className="line-clamp-2">{row.description.uz}</span>
                      </TableCell>
                      <TableCell>
                        {row.showInHomePage ? (
                          <span className="rounded-full bg-emerald-500/15 text-emerald-600 px-2 py-1 text-xs font-medium">true</span>
                        ) : (
                          <span className="rounded-full bg-muted text-muted-foreground px-2 py-1 text-xs font-medium">false</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {row.showInHomeList ? (
                          <span className="rounded-full bg-emerald-500/15 text-emerald-600 px-2 py-1 text-xs font-medium">true</span>
                        ) : (
                          <span className="rounded-full bg-muted text-muted-foreground px-2 py-1 text-xs font-medium">false</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            row.status === 'active'
                              ? 'rounded-full bg-emerald-500/15 text-emerald-600 px-2 py-1 text-xs font-medium'
                              : 'rounded-full bg-muted text-muted-foreground px-2 py-1 text-xs font-medium'
                          }
                        >
                          {row.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="secondary" size="sm" title="Tahrirlash" onClick={() => {
                            setEditStatus(row.status)
                            setEditShowInHomePage(Boolean(row.showInHomePage))
                            setEditShowInHomeList(Boolean(row.showInHomeList))
                            setEditId(row._id)
                          }}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button variant="secondary" size="sm" title="O'chirish" onClick={() => setDeleteId(row._id)}>
                            <Trash2 className="size-4" />
                          </Button>
                          <Link href={`/theme/${row.slug}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="secondary" size="sm" title="Havola">
                              <ExternalLink className="size-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="flex max-h-[min(90vh,760px)] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <div className="shrink-0 border-b px-6 pt-6 pb-4 pr-14">
            <DialogHeader className="text-left">
              <DialogTitle>Yangi tema</DialogTitle>
              <DialogDescription>
                Barcha tillarda sarlavha (nom) majburiy. Subtitle va description ixtiyoriy. Slug inglizcha nomdan
                avtomatik olinadi.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4 [scrollbar-width:thin]">
            <form id="create-theme-form" onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-sm font-medium text-foreground mb-3">Tema rasmi (500×500)</p>
                <div className="flex items-center gap-4">
                  <div className="relative size-14 overflow-hidden rounded-full bg-muted ring-1 ring-border">
                    {createImageUrl ? (
                      <Image src={createImageUrl} alt="Theme image" fill sizes="56px" className="object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      disabled={imageBusy || create.isPending}
                      onChange={(e) => handleThemeImagePick(e.currentTarget.files?.[0] ?? null, 'create')}
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Rasm saqlanishidan oldin avtomatik center-crop qilinadi va 500×500 JPEG bo‘ladi.
                    </p>
                  </div>
                  {createImageUrl ? (
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={imageBusy || create.isPending}
                      onClick={() => setCreateImageUrl('')}
                    >
                      Olib tashlash
                    </Button>
                  ) : null}
                </div>
              </div>
              {LOCALES.map((loc) => (
                <div key={loc} className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
                  <p className="text-sm font-medium text-foreground">{LOCALE_LABELS[loc]}</p>
                  <div className="space-y-2">
                    <Label htmlFor={`create-name_${loc}`}>Nom</Label>
                    <Input id={`create-name_${loc}`} name={`name_${loc}`} className="min-w-0" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`create-subtitle_${loc}`}>Subtitle (ixtiyoriy)</Label>
                    <Input id={`create-subtitle_${loc}`} name={`subtitle_${loc}`} className="min-w-0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`create-description_${loc}`}>Description (ixtiyoriy)</Label>
                    <Textarea
                      id={`create-description_${loc}`}
                      name={`description_${loc}`}
                      className="min-h-[100px] min-w-0 resize-y"
                    />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-md border p-3">
                <Label htmlFor="create-show-in-home-page">Home page da ko'rsatilsin</Label>
                <Switch
                  id="create-show-in-home-page"
                  checked={createShowInHomePage}
                  onCheckedChange={setCreateShowInHomePage}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <Label htmlFor="create-show-in-home-list">Home tepadagi listda ko'rsatilsin</Label>
                <Switch
                  id="create-show-in-home-list"
                  checked={createShowInHomeList}
                  onCheckedChange={setCreateShowInHomeList}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={createStatus} onValueChange={(value: ThemeStatus) => setCreateStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">active</SelectItem>
                    <SelectItem value="inactive">inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </form>
          </div>
          <div className="shrink-0 border-t bg-background px-6 py-4">
            <DialogFooter className="gap-2 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" form="create-theme-form" disabled={create.isPending}>
                Saqlash
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTheme} onOpenChange={(open) => !open && setEditId(null)}>
        <DialogContent className="flex max-h-[min(90vh,760px)] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <div className="shrink-0 border-b px-6 pt-6 pb-4 pr-14">
            <DialogHeader className="text-left">
              <DialogTitle>Tahrirlash: {editTheme?.slug}</DialogTitle>
              <DialogDescription>
                Barcha tillarda sarlavha majburiy. Subtitle va description ixtiyoriy.
              </DialogDescription>
            </DialogHeader>
          </div>
          {editTheme ? (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4 [scrollbar-width:thin]">
              <form key={editTheme.slug} id="update-theme-form" onSubmit={handleUpdateSubmit} className="space-y-4">
                <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                  <p className="text-sm font-medium text-foreground mb-3">Tema rasmi (500×500)</p>
                  <div className="flex items-center gap-4">
                    <div className="relative size-14 overflow-hidden rounded-full bg-muted ring-1 ring-border">
                      {editImageUrl ? (
                        <Image src={editImageUrl} alt="Theme image" fill sizes="56px" className="object-cover" />
                      ) : null}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        disabled={imageBusy || update.isPending}
                        onChange={(e) => handleThemeImagePick(e.currentTarget.files?.[0] ?? null, 'edit')}
                      />
                      <p className="mt-2 text-xs text-muted-foreground">
                        Rasm saqlanishidan oldin avtomatik center-crop qilinadi va 500×500 JPEG bo‘ladi.
                      </p>
                    </div>
                    {editImageUrl ? (
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={imageBusy || update.isPending}
                        onClick={() => setEditImageUrl('')}
                      >
                        Olib tashlash
                      </Button>
                    ) : null}
                  </div>
                </div>
                {LOCALES.map((loc) => (
                  <div key={loc} className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
                    <p className="text-sm font-medium text-foreground">{LOCALE_LABELS[loc]}</p>
                    <div className="space-y-2">
                      <Label htmlFor={`edit-name_${loc}`}>Nom</Label>
                      <Input
                        id={`edit-name_${loc}`}
                        name={`name_${loc}`}
                        className="min-w-0"
                        defaultValue={editTheme.name[loc] ?? ''}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edit-subtitle_${loc}`}>Subtitle (ixtiyoriy)</Label>
                      <Input
                        id={`edit-subtitle_${loc}`}
                        name={`subtitle_${loc}`}
                        className="min-w-0"
                        defaultValue={editTheme.subtitle[loc] ?? ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edit-description_${loc}`}>Description (ixtiyoriy)</Label>
                      <Textarea
                        id={`edit-description_${loc}`}
                        name={`description_${loc}`}
                        className="min-h-[100px] min-w-0 resize-y"
                        defaultValue={editTheme.description[loc] ?? ''}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-md border p-3">
                  <Label htmlFor="edit-show-in-home-page">Home page da ko'rsatilsin</Label>
                  <Switch
                    id="edit-show-in-home-page"
                    checked={editShowInHomePage}
                    onCheckedChange={setEditShowInHomePage}
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <Label htmlFor="edit-show-in-home-list">Home tepadagi listda ko'rsatilsin</Label>
                  <Switch
                    id="edit-show-in-home-list"
                    checked={editShowInHomeList}
                    onCheckedChange={setEditShowInHomeList}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editStatus} onValueChange={(value: ThemeStatus) => setEditStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">active</SelectItem>
                      <SelectItem value="inactive">inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </form>
            </div>
          ) : null}
          <div className="shrink-0 border-t bg-background px-6 py-4">
            <DialogFooter className="gap-2 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setEditId(null)}>
                Bekor qilish
              </Button>
              {editTheme ? (
                <Button type="submit" form="update-theme-form" disabled={update.isPending}>
                  Saqlash
                </Button>
              ) : null}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTheme} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Temani o'chirish</DialogTitle>
            <DialogDescription>
              Haqiqatan ham &quot;{deleteTheme?.name[locale] ?? deleteTheme?.slug}&quot; temasini o'chirishni xohlaysizmi?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteId(null)}>
              Bekor qilish
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteConfirm} disabled={remove.isPending}>
              O'chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

