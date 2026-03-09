'use client'

import { useState } from 'react'
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
import { FolderTree, ExternalLink, PlusCircle, Pencil, Trash2 } from 'lucide-react'

const LOCALES: AppLocale[] = ['uz', 'uzb', 'ru', 'en']
const LOCALE_LABELS: Record<AppLocale, string> = {
  uz: "O'zbek (lotin)",
  uzb: "O'zbek (kirill)",
  ru: 'Ruscha',
  en: 'English',
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

  return text
    .split('')
    .map((ch) => map[ch] ?? ch)
    .join('')
}

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function generateSlugFromNames(name: Record<AppLocale, string>): string {
  const base = name.en?.trim() || ''

  if (!base) return ''

  const latin = cyrillicToLatinForSlug(base)
  return slugify(latin || base)
}

export type CategoryRow = {
  slug: string
  href: string
  name: Record<AppLocale, string>
}

type DashboardCategoriesPageProps = {
  categories: CategoryRow[]
  locale: AppLocale
}

export function DashboardCategoriesPage({ categories: initialCategories, locale }: DashboardCategoriesPageProps) {
  const [categories, setCategories] = useState<CategoryRow[]>(initialCategories)
  const [createOpen, setCreateOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<CategoryRow | null>(null)
  const [deleteCategory, setDeleteCategory] = useState<CategoryRow | null>(null)

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

    if (!normalizedSlug) return

    const href = `/category/${normalizedSlug}`

    const exists = categories.some((c) => c.slug.toLowerCase() === normalizedSlug.toLowerCase())
    if (exists) return
    setCategories((prev) => [...prev, { slug: normalizedSlug, href, name }])
    setCreateOpen(false)
    toast.success('Kategoriya muvaffaqiyatli qo‘shildi')
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
    if (!normalizedSlug) return

    const href = `/category/${normalizedSlug}`
    const originalSlug = editCategory.slug
    setCategories((prev) =>
      prev.map((c) => (c.slug === originalSlug ? { slug: normalizedSlug, href, name } : c))
    )
    setEditCategory(null)
    toast.success('Kategoriya muvaffaqiyatli yangilandi')
  }

  const handleDeleteConfirm = () => {
    if (!deleteCategory) return
    const slug = deleteCategory.slug
    setCategories((prev) => prev.filter((c) => c.slug !== slug))
    setDeleteCategory(null)
    toast.success('Kategoriya muvaffaqiyatli o‘chirildi')
  }

  return (
    <div className="space-y-6 min-w-0 overflow-hidden">
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <FolderTree className="size-6" />
              Kategoriyalar
            </CardTitle>
            <CardDescription>
              Sayt kategoriyalari ro‘yxati. Kategoriyalar yangiliklar uchun ishlatiladi.
            </CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)} size="lg" className="shrink-0">
            <PlusCircle className="size-4 mr-2" />
            Yangi kategoriya
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ro‘yxat</CardTitle>
          <CardDescription>Jami: {categories.length} ta kategoriya</CardDescription>
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
                  <TableHead>Havola</TableHead>
                  <TableHead className="w-[140px]">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Kategoriya topilmadi
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((row) => (
                    <TableRow key={row.slug}>
                      <TableCell className="font-mono text-sm">{row.slug}</TableCell>
                      <TableCell>{row.name.uz}</TableCell>
                      <TableCell>{row.name.uzb}</TableCell>
                      <TableCell>{row.name.ru}</TableCell>
                      <TableCell>{row.name.en}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{row.href}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditCategory(row)}
                            className="gap-1"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteCategory(row)}
                            className="gap-1"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                          <Link
                            href={row.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <Button variant="outline" size="sm" className="gap-1"><ExternalLink className="size-4" /></Button>
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

      {/* Create category modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yangi kategoriya</DialogTitle>
            <DialogDescription>
              Har bir til uchun nomni kiriting. Slug inglizcha nomdan avtomatik olinadi,
              havola esa `/category/slug` ko‘rinishida bo‘ladi.
            </DialogDescription>
          </DialogHeader>
          <form id="create-category-form" onSubmit={handleCreateSubmit} className="space-y-4">
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
            <Button type="submit" form="create-category-form">
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update category modal */}
      <Dialog open={!!editCategory} onOpenChange={(open) => !open && setEditCategory(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tahrirlash: {editCategory?.slug}</DialogTitle>
            <DialogDescription>Kategoriya ma’lumotlarini o‘zgartiring.</DialogDescription>
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
                    placeholder=""
                  />
                </div>
              ))}
            </form>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditCategory(null)}>
              Bekor qilish
            </Button>
            {editCategory && (
              <Button type="submit" form="update-category-form">
                Saqlash
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete category confirm modal */}
      <Dialog open={!!deleteCategory} onOpenChange={(open) => !open && setDeleteCategory(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Kategoriyani o‘chirish</DialogTitle>
            <DialogDescription>
              Haqiqatan ham "{deleteCategory?.name[locale] ?? deleteCategory?.slug}" kategoriyasini o‘chirishni xohlaysizmi?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteCategory(null)}>
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
