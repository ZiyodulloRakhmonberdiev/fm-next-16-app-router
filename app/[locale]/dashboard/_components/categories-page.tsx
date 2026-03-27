'use client'
/* eslint-disable react/no-unescaped-entities */

import { useMemo } from 'react'
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
import { FolderTree, ExternalLink, PlusCircle, Pencil, Trash2 } from 'lucide-react'
import { cyrillicToLatinForSlug, slugify } from '@/shared/common/lib/slug'
import { useCategoriesQuery, useCategoryMutations } from '@/features/dashboard/model/admin-hooks'
import { useCategoriesUiStore } from '@/features/dashboard/model/admin-ui-store'
import { getApiErrorDescription } from '@/features/dashboard/model/admin-api'

function generateSlugFromNames(name: Record<AppLocale, string>): string {
  const base = name.en?.trim() || ''
  if (!base) return ''
  const latin = cyrillicToLatinForSlug(base)
  return slugify(latin || base)
}

export type CategoryRow = {
  _id: string
  slug: string
  href: string
  name: Record<AppLocale, string>
  priority: number
}

type CategoriesPageProps = {
  locale: AppLocale
}

export function CategoriesPage({ locale }: CategoriesPageProps) {
  const { data, isLoading, error } = useCategoriesQuery()
  const { create, update, remove } = useCategoryMutations()
  const {
    createOpen,
    editId,
    deleteId,
    setCreateOpen,
    setEditId,
    setDeleteId,
  } = useCategoriesUiStore()

  const categories = useMemo<CategoryRow[]>(
    () =>
      (data ?? []).map((c) => ({
        _id: c._id,
        slug: c.slug,
        href: c.href,
        name: c.name,
        priority: c.priority ?? 0,
      })),
    [data]
  )

  const editCategory = useMemo(
    () => categories.find((c) => c._id === editId) ?? null,
    [categories, editId]
  )
  const deleteCategory = useMemo(
    () => categories.find((c) => c._id === deleteId) ?? null,
    [categories, deleteId]
  )

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
    const normalizedSlug = generateSlugFromNames(name)
    if (!normalizedSlug) {
      toast.error('Validation error', {
        description: 'Inglizcha nom (en) bo‘yicha slug hosil qilib bo‘lmadi.',
      })
      return
    }

    const href = `/category/${normalizedSlug}`
    const priorityRaw = (form.querySelector('[name="priority"]') as HTMLInputElement)?.value ?? '0'
    const priority = Number(priorityRaw) || 0
    const exists = categories.some((c) => c.slug.toLowerCase() === normalizedSlug.toLowerCase())
    if (exists) {
      toast.error('Validation error', {
        description: `slug: "${normalizedSlug}" allaqachon mavjud.`,
      })
      return
    }
    create.mutate(
      { slug: normalizedSlug, href, name, priority },
      {
        onSuccess: () => {
          setCreateOpen(false)
          toast.success('Kategoriya muvaffaqiyatli qo\'shildi')
        },
        onError: showMutationError,
      }
    )
  }

  const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editCategory) return
    const form = e.currentTarget
    const name: Record<AppLocale, string> = {
      uz: (form.querySelector('[name="name_uz"]') as HTMLInputElement)?.value?.trim() ?? '',
      uzb: (form.querySelector('[name="name_uzb"]') as HTMLInputElement)?.value?.trim() ?? '',
      ru: (form.querySelector('[name="name_ru"]') as HTMLInputElement)?.value?.trim() ?? '',
      en: (form.querySelector('[name="name_en"]') as HTMLInputElement)?.value?.trim() ?? '',
    }
    const normalizedSlug = generateSlugFromNames(name)
    if (!normalizedSlug) {
      toast.error('Validation error', {
        description: 'Inglizcha nom (en) bo‘yicha slug hosil qilib bo‘lmadi.',
      })
      return
    }

    const href = `/category/${normalizedSlug}`
    const priorityRaw = (form.querySelector('[name="priority"]') as HTMLInputElement)?.value ?? '0'
    const priority = Number(priorityRaw) || 0
    const exists = categories.some(
      (c) => c._id !== editCategory._id && c.slug.toLowerCase() === normalizedSlug.toLowerCase()
    )
    if (exists) {
      toast.error('Validation error', {
        description: `slug: "${normalizedSlug}" allaqachon mavjud.`,
      })
      return
    }
    update.mutate(
      {
        id: editCategory._id,
        payload: { slug: normalizedSlug, href, name, priority },
      },
      {
        onSuccess: () => {
          setEditId(null)
          toast.success('Kategoriya muvaffaqiyatli yangilandi')
        },
        onError: showMutationError,
      }
    )
  }

  const handleDeleteConfirm = () => {
    if (!deleteCategory) return
    remove.mutate(deleteCategory._id, {
      onSuccess: () => {
        setDeleteId(null)
        toast.success('Kategoriya muvaffaqiyatli o\'chirildi')
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
              <FolderTree className="size-6" />
              Kategoriyalar
            </CardTitle>
            <CardDescription>
              Sayt kategoriyalari ro'yxati. Kategoriyalar yangiliklar uchun ishlatiladi.
            </CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)} size="lg" className="shrink-0 w-full md:w-auto">
            <PlusCircle className="size-4 mr-2" />
            Yangi kategoriya
          </Button>
        </CardHeader>
      </Card>

      <Card className="py-4 md:py-6">
        <CardHeader className="px-4 md:px-6">
          <CardTitle className="text-base">Ro'yxat</CardTitle>
          <CardDescription>Jami: {categories.length} ta kategoriya</CardDescription>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
          ) : error ? (
            <p className="text-sm text-destructive">Kategoriyalarni yuklab bo‘lmadi.</p>
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
                  <TableHead>Havola</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="w-[140px]">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Kategoriya topilmadi
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell className=" text-sm">{row.slug}</TableCell>
                      <TableCell>{row.name.uz}</TableCell>
                      <TableCell>{row.name.uzb}</TableCell>
                      <TableCell>{row.name.ru}</TableCell>
                      <TableCell>{row.name.en}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{row.href}</TableCell>
                      <TableCell>{row.priority}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="secondary" title="Tahrirlash" size="sm" onClick={() => setEditId(row._id)}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button variant="secondary" title="O'chirish" size="sm" onClick={() => setDeleteId(row._id)}>
                            <Trash2 className="size-4" />
                          </Button>
                          <Link href={row.href} target="_blank" rel="noopener noreferrer">
                            <Button variant="secondary" title="Havola" size="sm">
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yangi kategoriya</DialogTitle>
            <DialogDescription>
              Har bir til uchun nomni kiriting. Slug inglizcha nomdan avtomatik olinadi.
            </DialogDescription>
          </DialogHeader>
          <form id="create-category-form" onSubmit={handleCreateSubmit} className="space-y-4">
            {LOCALES.map((loc) => (
              <div key={loc} className="space-y-2">
                <Label htmlFor={`create-name_${loc}`}>Nom ({LOCALE_LABELS[loc]})</Label>
                <Input id={`create-name_${loc}`} name={`name_${loc}`} required />
              </div>
            ))}
            <div className="space-y-2">
              <Label htmlFor="create-priority">Priority</Label>
              <Input id="create-priority" name="priority" type="number" defaultValue={0} />
            </div>
          </form>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Bekor qilish
            </Button>
            <Button type="submit" form="create-category-form" disabled={create.isPending}>
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editCategory} onOpenChange={(open) => !open && setEditId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tahrirlash: {editCategory?.slug}</DialogTitle>
            <DialogDescription>Kategoriya ma'lumotlarini o'zgartiring.</DialogDescription>
          </DialogHeader>
          {editCategory && (
            <form key={editCategory.slug} id="update-category-form" onSubmit={handleUpdateSubmit} className="space-y-4">
              {LOCALES.map((loc) => (
                <div key={loc} className="space-y-2">
                  <Label htmlFor={`edit-name_${loc}`}>Nom ({LOCALE_LABELS[loc]})</Label>
                  <Input
                    id={`edit-name_${loc}`}
                    name={`name_${loc}`}
                    defaultValue={editCategory.name[loc] ?? ''}
                    required
                  />
                </div>
              ))}
              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Input id="edit-priority" name="priority" type="number" defaultValue={editCategory.priority ?? 0} />
              </div>
            </form>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditId(null)}>
              Bekor qilish
            </Button>
            {editCategory && (
              <Button type="submit" form="update-category-form" disabled={update.isPending}>
                Saqlash
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteCategory} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Kategoriyani o'chirish</DialogTitle>
            <DialogDescription>
              Haqiqatan ham &quot;{deleteCategory?.name[locale] ?? deleteCategory?.slug}&quot; kategoriyasini o'chirishni xohlaysizmi?
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
