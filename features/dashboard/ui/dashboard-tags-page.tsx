'use client'

import { useState } from 'react'
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
import { Tag, PlusCircle, Pencil, Trash2 } from 'lucide-react'

const LOCALES: AppLocale[] = ['uz', 'uzb', 'ru', 'en']
const LOCALE_LABELS: Record<AppLocale, string> = {
  uz: "O'zbek (lotin)",
  uzb: "O'zbek (kirill)",
  ru: 'Ruscha',
  en: 'English',
}

export type TagRow = {
  slug: string
  name: Record<AppLocale, string>
}

type DashboardTagsPageProps = {
  tags: TagRow[]
  locale: AppLocale
}

export function DashboardTagsPage({ tags: initialTags, locale }: DashboardTagsPageProps) {
  const [tags, setTags] = useState<TagRow[]>(initialTags)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTag, setEditTag] = useState<TagRow | null>(null)
  const [deleteTag, setDeleteTag] = useState<TagRow | null>(null)

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const slug = (form.querySelector('[name="slug"]') as HTMLInputElement)?.value?.trim() || ''
    const name: Record<AppLocale, string> = {
      uz: (form.querySelector('[name="name_uz"]') as HTMLInputElement)?.value?.trim() ?? '',
      uzb: (form.querySelector('[name="name_uzb"]') as HTMLInputElement)?.value?.trim() ?? '',
      ru: (form.querySelector('[name="name_ru"]') as HTMLInputElement)?.value?.trim() ?? '',
      en: (form.querySelector('[name="name_en"]') as HTMLInputElement)?.value?.trim() ?? '',
    }
    if (!slug) return
    const exists = tags.some((t) => t.slug.toLowerCase() === slug.toLowerCase())
    if (exists) return
    setTags((prev) => [...prev, { slug, name }])
    setCreateOpen(false)
    toast.success('Teg muvaffaqiyatli qo‘shildi')
  }

  const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editTag) return
    const form = e.currentTarget
    const slug = (form.querySelector('[name="slug"]') as HTMLInputElement)?.value?.trim() || ''
    const name: Record<AppLocale, string> = {
      uz: (form.querySelector('[name="name_uz"]') as HTMLInputElement)?.value?.trim() ?? '',
      uzb: (form.querySelector('[name="name_uzb"]') as HTMLInputElement)?.value?.trim() ?? '',
      ru: (form.querySelector('[name="name_ru"]') as HTMLInputElement)?.value?.trim() ?? '',
      en: (form.querySelector('[name="name_en"]') as HTMLInputElement)?.value?.trim() ?? '',
    }
    if (!slug) return
    const originalSlug = editTag.slug
    setTags((prev) => prev.map((t) => (t.slug === originalSlug ? { slug, name } : t)))
    setEditTag(null)
    toast.success('Teg muvaffaqiyatli yangilandi')
  }

  const handleDeleteConfirm = () => {
    if (!deleteTag) return
    const slug = deleteTag.slug
    setTags((prev) => prev.filter((t) => t.slug !== slug))
    setDeleteTag(null)
    toast.success('Teg muvaffaqiyatli o‘chirildi')
  }

  return (
    <div className="space-y-6 min-w-0 overflow-hidden">
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Tag className="size-6" />
              Teglar
            </CardTitle>
            <CardDescription>
              Sayt teglari ro‘yxati. Teglar yangiliklar uchun ishlatiladi.
            </CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)} size="lg" className="shrink-0">
            <PlusCircle className="size-4 mr-2" />
            Yangi teg
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ro‘yxat</CardTitle>
          <CardDescription>Jami: {tags.length} ta teg</CardDescription>
        </CardHeader>
        <CardContent>
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
                    <TableRow key={row.slug}>
                      <TableCell className="font-mono text-sm">{row.slug}</TableCell>
                      <TableCell>{row.name.uz ?? '—'}</TableCell>
                      <TableCell>{row.name.uzb ?? '—'}</TableCell>
                      <TableCell>{row.name.ru ?? '—'}</TableCell>
                      <TableCell>{row.name.en ?? '—'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditTag(row)}
                            className="gap-1"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteTag(row)}
                            className="gap-1"
                          >
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

      {/* Create tag modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yangi teg</DialogTitle>
            <DialogDescription>Teg slug va tillar bo‘yicha nomlarini kiriting.</DialogDescription>
          </DialogHeader>
          <form id="create-tag-form" onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-slug">Slug</Label>
              <Input id="create-slug" name="slug" placeholder="masalan: sport" required />
            </div>
            {LOCALES.map((loc) => (
              <div key={loc} className="space-y-2">
                <Label htmlFor={`create-name_${loc}`}>Nom ({LOCALE_LABELS[loc]})</Label>
                <Input id={`create-name_${loc}`} name={`name_${loc}`} placeholder="" />
              </div>
            ))}
          </form>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Bekor qilish
            </Button>
            <Button type="submit" form="create-tag-form">
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update tag modal */}
      <Dialog open={!!editTag} onOpenChange={(open) => !open && setEditTag(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tahrirlash: {editTag?.slug}</DialogTitle>
            <DialogDescription>Teg ma’lumotlarini o‘zgartiring.</DialogDescription>
          </DialogHeader>
          {editTag && (
            <form key={editTag.slug} id="update-tag-form" onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  name="slug"
                  defaultValue={editTag.slug}
                  placeholder="masalan: sport"
                  required
                />
              </div>
              {LOCALES.map((loc) => (
                <div key={loc} className="space-y-2">
                  <Label htmlFor={`edit-name_${loc}`}>Nom ({LOCALE_LABELS[loc]})</Label>
                  <Input
                    id={`edit-name_${loc}`}
                    name={`name_${loc}`}
                    defaultValue={editTag.name[loc] ?? ''}
                    placeholder=""
                  />
                </div>
              ))}
            </form>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditTag(null)}>
              Bekor qilish
            </Button>
            {editTag && (
              <Button type="submit" form="update-tag-form">
                Saqlash
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete tag confirm modal */}
      <Dialog open={!!deleteTag} onOpenChange={(open) => !open && setDeleteTag(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tegni o‘chirish</DialogTitle>
            <DialogDescription>
              Haqiqatan ham "{deleteTag?.name[locale] ?? deleteTag?.slug}" tegini o‘chirishni xohlaysizmi?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTag(null)}>
              Bekor qilish
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteConfirm}>
              O‘chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
