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

type CategoryOption = { slug: string; name: string }
type TagOption = { slug: string; name: string }

type GeneralsFormProps = {
  categories: CategoryOption[]
  tags: TagOption[]
  authors: string[]
  categorySlug: string
  categoryName: string
  selectedTags: TagOption[]
  selectedTagSlugsSet: Set<string>
  author: string
  minutes: number | ''
  onCategoryChange: (slug: string) => void
  onToggleTag: (slug: string) => void
  onAuthorChange: (author: string) => void
  onMinutesChange: (value: number | '') => void
}

export function GeneralsForm({
  categories,
  tags,
  authors,
  categoryName,
  selectedTags,
  selectedTagSlugsSet,
  author,
  minutes,
  onCategoryChange,
  onToggleTag,
  onAuthorChange,
  onMinutesChange,
}: GeneralsFormProps) {
  return (
    <Card className='pt-0 md:pt-4 bg-transparent border-none md:border-border shadow-none'>
      <CardHeader className='px-0'>
        <CardTitle>Umumiy maydonlar</CardTitle>
        <CardDescription>Kategoriya, teglar va boshqalarni tanlang.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 px-0">
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
                <DropdownMenuItem key={c.slug} onClick={() => onCategoryChange(c.slug)}>
                  {c.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
              <DropdownMenuItem onClick={() => onAuthorChange("")}>
                <span className="text-muted-foreground italic font-light italic">Tanlanmagan</span>
              </DropdownMenuItem>
              {authors.map((a) => (
                <DropdownMenuItem key={a} onClick={() => onAuthorChange(a)}>
                  {a}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="space-y-2 sm:col-span-1">
          <Label>Teglar</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Teg qo&apos;shish
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
                  onCheckedChange={() => onToggleTag(t.slug)}
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
                    onClick={() => onToggleTag(t.slug)}
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
