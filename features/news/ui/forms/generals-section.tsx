'use client'

import { Button } from '@/shared/common/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/common/components/ui/dropdown-menu'
import { Input } from '@/shared/common/components/ui/input'
import { Label } from '@/shared/common/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/common/components/ui/card'
import { ChevronDown, X } from 'lucide-react'

type CategoryOption = { id: string; slug: string; name: string }
type ThemeOption = { id: string; slug: string; name: string }
type TagOption = { id: string; slug: string; name: string }
type AuthorOption = { id: string; name: string }

type GeneralsFormProps = {
  categories: CategoryOption[]
  themes: ThemeOption[]
  tags: TagOption[]
  authors: AuthorOption[]
  categoryId: string
  categoryName: string
  themeId: string
  themeName: string
  selectedTags: TagOption[]
  selectedTagIdsSet: Set<string>
  authorId: string
  authorName: string
  minutes: number | ''
  onCategoryChange: (id: string) => void
  onThemeChange: (id: string) => void
  onToggleTag: (id: string) => void
  onAuthorChange: (authorId: string) => void
  onMinutesChange: (value: number | '') => void
}

export function GeneralsForm({
  categories,
  themes,
  tags,
  authors,
  categoryId,
  categoryName,
  themeId,
  themeName,
  selectedTags,
  selectedTagIdsSet,
  authorId,
  authorName,
  minutes,
  onCategoryChange,
  onThemeChange,
  onToggleTag,
  onAuthorChange,
  onMinutesChange,
}: GeneralsFormProps) {
  return (
    <Card className='pt-0 bg-transparent border-none md:border-border shadow-none'>
      {/* <CardHeader className='px-0'>
        <CardTitle>Umumiy maydonlar</CardTitle>
        <CardDescription>Kategoriya, teglar va boshqalarni tanlang.</CardDescription>
      </CardHeader> */}
      <CardContent className="grid gap-4 sm:grid-cols-2 px-0">
        <div className="space-y-2">
          <Label>Kategoriya (Majburiy)</Label>
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
                <DropdownMenuItem key={c.id} onClick={() => onCategoryChange(c.id)}>
                  {c.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {categoryId ? (
            <p className="text-xs text-muted-foreground">
              Tanlangan kategoriya: <span className="font-medium">{categoryName}</span>
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label>Tema (ixtiyoriy)</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {themeName || "Temani tanlang"}
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
              <DropdownMenuLabel>Mavzuni tanlang (Ixtiyoriy)</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => onThemeChange('')}>
                <span className="text-muted-foreground italic font-light">Tanlanmagan</span>
              </DropdownMenuItem>
              {themes.map((th) => (
                <DropdownMenuItem key={th.id} onSelect={() => onThemeChange(th.id)}>
                  {th.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {themeId ? (
            <p className="text-xs text-muted-foreground">
              Tanlangan mavzu: <span className="font-medium">{themeName}</span>
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Muallif (Ixtiyoriy)</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {authorName || 'Muallifni tanlang'}
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
              <DropdownMenuLabel>Muallifni tanlang (Ixtiyoriy)</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => onAuthorChange("")}>
                <span className="text-muted-foreground italic font-light">Tanlanmagan</span>
              </DropdownMenuItem>
              {authors.map((a) => (
                <DropdownMenuItem key={a.id} onSelect={() => onAuthorChange(a.id)}>
                  {a.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="space-y-2 sm:col-span-1">
          <Label>Teglar (Ixtiyoriy)</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Teglar qo&apos;shish
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-60 w-(--radix-dropdown-menu-trigger-width) overflow-y-auto">
              <DropdownMenuLabel>Teglarni tanlang (Ixtiyoriy)</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {tags.map((t) => (
                <DropdownMenuCheckboxItem
                  key={t.id}
                  checked={selectedTagIdsSet.has(t.id)}
                  onCheckedChange={() => onToggleTag(t.id)}
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
                  key={t.id}
                  className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-sm"
                >
                  {t.name}
                  <button
                    type="button"
                    onClick={() => onToggleTag(t.id)}
                    className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                    aria-label="O&apos;chirish"
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-2 sm:col-span-1">
          <Label htmlFor="minutes">O&apos;qish daqiqasi</Label>
          <Input
            id="minutes"
            type="number"
            min={0}
            value={minutes === '' ? '' : minutes}
            onChange={(e) => {
              const v = e.target.value
              onMinutesChange(v === '' ? '' : Number(v))
            }}
            placeholder="3 (bo'sh qoldirilsa 3)"
          />
        </div>

      </CardContent>
    </Card>
  )
}
