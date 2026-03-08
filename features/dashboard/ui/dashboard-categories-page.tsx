'use client'

import { useState, useMemo } from 'react'
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
import { FolderTree, Search, ExternalLink, PlusCircle, Pencil } from 'lucide-react'

const LOCALES: AppLocale[] = ['uz', 'uzb', 'ru', 'en']
const LOCALE_LABELS: Record<AppLocale, string> = {
  uz: "O'zbek (lotin)",
  uzb: "O'zbek (kirill)",
  ru: 'Ruscha',
  en: 'English',
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
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<CategoryRow | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return categories
    return categories.filter(
      (c) =>
        c.slug.toLowerCase().includes(q) ||
        Object.values(c.name).some((n) => n?.toLowerCase().includes(q))
    )
  }, [categories, search])

  const displayName = (row: CategoryRow) => row.name[locale] ?? row.name.uz ?? row.slug

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const slug = (form.querySelector('[name="slug"]') as HTMLInputElement)?.value?.trim() || ''
    const href = (form.querySelector('[name="href"]') as HTMLInputElement)?.value?.trim() || ''
    const name: Record<AppLocale, string> = {
      uz: (form.querySelector('[name="name_uz"]') as HTMLInputElement)?.value?.trim() ?? '',
      uzb: (form.querySelector('[name="name_uzb"]') as HTMLInputElement)?.value?.trim() ?? '',
      ru: (form.querySelector('[name="name_ru"]') as HTMLInputElement)?.value?.trim() ?? '',
      en: (form.querySelector('[name="name_en"]') as HTMLInputElement)?.value?.trim() ?? '',
    }
    if (!slug) return
    const exists = categories.some((c) => c.slug.toLowerCase() === slug.toLowerCase())
    if (exists) return
    setCategories((prev) => [...prev, { slug, href: href || `/category/${slug}`, name }])
    setCreateOpen(false)
  }

  const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editCategory) return
    const form = e.currentTarget
    const slug = (form.querySelector('[name="slug"]') as HTMLInputElement)?.value?.trim() || ''
    const href = (form.querySelector('[name="href"]') as HTMLInputElement)?.value?.trim() || ''
    const name: Record<AppLocale, string> = {
      uz: (form.querySelector('[name="name_uz"]') as HTMLInputElement)?.value?.trim() ?? '',
      uzb: (form.querySelector('[name="name_uzb"]') as HTMLInputElement)?.value?.trim() ?? '',
      ru: (form.querySelector('[name="name_ru"]') as HTMLInputElement)?.value?.trim() ?? '',
      en: (form.querySelector('[name="name_en"]') as HTMLInputElement)?.value?.trim() ?? '',
    }
    if (!slug) return
    const originalSlug = editCategory.slug
    setCategories((prev) =>
      prev.map((c) => (c.slug === originalSlug ? { slug, href: href || `/category/${slug}`, name } : c))
    )
    setEditCategory(null)
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
          <CardTitle className="text-base">Qidirish</CardTitle>
          <CardDescription>Slug yoki nom bo‘yicha filtrlash</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Slug yoki nom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ro‘yxat</CardTitle>
          <CardDescription>Jami: {filtered.length} ta kategoriya</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slug</TableHead>
                  <TableHead>Nom ({locale})</TableHead>
                  <TableHead>Havola</TableHead>
                  <TableHead className="w-[140px]">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Kategoriya topilmadi
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row) => (
                    <TableRow key={row.slug}>
                      <TableCell className="font-mono text-sm">{row.slug}</TableCell>
                      <TableCell>{displayName(row)}</TableCell>
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
                            Tahrirlash
                          </Button>
                          <Link
                            href={row.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="size-4" />
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
            <DialogDescription>Kategoriya slug, havola va tillar bo‘yicha nomlarini kiriting.</DialogDescription>
          </DialogHeader>
          <form id="create-category-form" onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-slug">Slug</Label>
              <Input id="create-slug" name="slug" placeholder="masalan: sports" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-href">Havola</Label>
              <Input id="create-href" name="href" placeholder="/category/sports" />
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
              <div className="space-y-2">
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  name="slug"
                  defaultValue={editCategory.slug}
                  placeholder="masalan: sports"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-href">Havola</Label>
                <Input
                  id="edit-href"
                  name="href"
                  defaultValue={editCategory.href}
                  placeholder="/category/sports"
                />
              </div>
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
    </div>
  )
}
