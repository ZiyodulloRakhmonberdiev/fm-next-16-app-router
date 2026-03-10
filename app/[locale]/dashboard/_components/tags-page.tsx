'use client'
/* eslint-disable react/no-unescaped-entities */

import { useMemo } from 'react'
import { toast } from 'sonner'
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
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { LOCALES, LOCALE_LABELS } from '@/shared/common/lib/locale-constants'
import { Tag, PlusCircle, Pencil, Trash2 } from 'lucide-react'
import { useTagMutations, useTagsQuery } from '@/features/dashboard/model/admin-hooks'
import { useTagsUiStore } from '@/features/dashboard/model/admin-ui-store'
import { cyrillicToLatinForSlug, slugify } from '@/shared/common/lib/slug'
import { getApiErrorDescription } from '@/features/dashboard/model/admin-api'

export type TagRow = {
  _id: string
  slug: string
  name: Record<AppLocale, string>
}

type TagsPageProps = {
  locale: AppLocale
}

function generateTagSlugFromEn(name: Record<AppLocale, string>): string {
  const base = name.en?.trim() || ''
  if (!base) return ''
  const latin = cyrillicToLatinForSlug(base)
  return slugify(latin || base)
}

export function TagsPage({ locale }: TagsPageProps) {
  const { data, isLoading, error } = useTagsQuery()
  const { create, update, remove } = useTagMutations()
  const { createOpen, editId, deleteId, setCreateOpen, setEditId, setDeleteId } = useTagsUiStore()
  const tags = useMemo<TagRow[]>(
    () =>
      (data ?? []).map((t) => ({
        _id: t._id,
        slug: t.slug,
        name: t.name,
      })),
    [data]
  )
  const editTag = useMemo(() => tags.find((t) => t._id === editId) ?? null, [tags, editId])
  const deleteTag = useMemo(() => tags.find((t) => t._id === deleteId) ?? null, [tags, deleteId])

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
    const slug = generateTagSlugFromEn(name)
    if (!slug) {
      toast.error('Validation error', {
        description: 'Inglizcha nom (en) bo‘yicha slug hosil qilib bo‘lmadi.',
      })
      return
    }
    const exists = tags.some((t) => t.slug.toLowerCase() === slug.toLowerCase())
    if (exists) {
      toast.error('Validation error', {
        description: `slug: "${slug}" allaqachon mavjud.`,
      })
      return
    }
    create.mutate(
      { slug, name },
      {
        onSuccess: () => {
          setCreateOpen(false)
          toast.success('Teg muvaffaqiyatli qo\'shildi')
        },
        onError: showMutationError,
      }
    )
  }

  const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editTag) return
    const form = e.currentTarget
    const name: Record<AppLocale, string> = {
      uz: (form.querySelector('[name="name_uz"]') as HTMLInputElement)?.value?.trim() ?? '',
      uzb: (form.querySelector('[name="name_uzb"]') as HTMLInputElement)?.value?.trim() ?? '',
      ru: (form.querySelector('[name="name_ru"]') as HTMLInputElement)?.value?.trim() ?? '',
      en: (form.querySelector('[name="name_en"]') as HTMLInputElement)?.value?.trim() ?? '',
    }
    const slug = generateTagSlugFromEn(name)
    if (!slug) {
      toast.error('Validation error', {
        description: 'Inglizcha nom (en) bo‘yicha slug hosil qilib bo‘lmadi.',
      })
      return
    }
    const exists = tags.some((t) => t._id !== editTag._id && t.slug.toLowerCase() === slug.toLowerCase())
    if (exists) {
      toast.error('Validation error', {
        description: `slug: "${slug}" allaqachon mavjud.`,
      })
      return
    }
    update.mutate(
      { id: editTag._id, payload: { slug, name } },
      {
        onSuccess: () => {
          setEditId(null)
          toast.success('Teg muvaffaqiyatli yangilandi')
        },
        onError: showMutationError,
      }
    )
  }

  const handleDeleteConfirm = () => {
    if (!deleteTag) return
    remove.mutate(deleteTag._id, {
      onSuccess: () => {
        setDeleteId(null)
        toast.success('Teg muvaffaqiyatli o\'chirildi')
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
              <Tag className="size-6" />
              Teglar
            </CardTitle>
            <CardDescription>
              Sayt teglari ro'yxati. Teglar yangiliklar uchun ishlatiladi.
            </CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)} size="lg" className="shrink-0 w-full md:w-auto">
            <PlusCircle className="size-4 mr-2" />
            Yangi teg
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ro'yxat</CardTitle>
          <CardDescription>Jami: {tags.length} ta teg</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
          ) : error ? (
            <p className="text-sm text-destructive">Teglarni yuklab bo‘lmadi.</p>
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
                  <TableHead className="w-[100px]">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Teg topilmadi
                    </TableCell>
                  </TableRow>
                ) : (
                  tags.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell className="font-mono text-sm">{row.slug}</TableCell>
                      <TableCell>{row.name.uz ?? '—'}</TableCell>
                      <TableCell>{row.name.uzb ?? '—'}</TableCell>
                      <TableCell>{row.name.ru ?? '—'}</TableCell>
                      <TableCell>{row.name.en ?? '—'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditId(row._id)}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setDeleteId(row._id)}>
                            <Trash2 className="size-4" />
                          </Button>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yangi teg</DialogTitle>
            <DialogDescription>Tillar bo‘yicha nomlarni kiriting. Slug inglizcha nomdan avtomatik olinadi.</DialogDescription>
          </DialogHeader>
          <form id="create-tag-form" onSubmit={handleCreateSubmit} className="space-y-4">
            {LOCALES.map((loc) => (
              <div key={loc} className="space-y-2">
                <Label htmlFor={`create-name_${loc}`}>Nom ({LOCALE_LABELS[loc]})</Label>
                <Input id={`create-name_${loc}`} name={`name_${loc}`} required />
              </div>
            ))}
          </form>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Bekor qilish
            </Button>
            <Button type="submit" form="create-tag-form" disabled={create.isPending}>
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTag} onOpenChange={(open) => !open && setEditId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tahrirlash: {editTag?.slug}</DialogTitle>
            <DialogDescription>Teg ma'lumotlarini o'zgartiring. Slug inglizcha nomdan avtomatik yangilanadi.</DialogDescription>
          </DialogHeader>
          {editTag && (
            <form key={editTag.slug} id="update-tag-form" onSubmit={handleUpdateSubmit} className="space-y-4">
              {LOCALES.map((loc) => (
                <div key={loc} className="space-y-2">
                  <Label htmlFor={`edit-name_${loc}`}>Nom ({LOCALE_LABELS[loc]})</Label>
                  <Input id={`edit-name_${loc}`} name={`name_${loc}`} defaultValue={editTag.name[loc] ?? ''} required />
                </div>
              ))}
            </form>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditId(null)}>
              Bekor qilish
            </Button>
            {editTag && (
              <Button type="submit" form="update-tag-form" disabled={update.isPending}>
                Saqlash
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTag} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tegni o'chirish</DialogTitle>
            <DialogDescription>
              Haqiqatan ham &quot;{deleteTag?.name[locale] ?? deleteTag?.slug}&quot; tegini o'chirishni xohlaysizmi?
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
