'use client'

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/shared/common/components/ui/card'
import { Input } from '@/shared/common/components/ui/input'
import { Button } from '@/shared/common/components/ui/button'
import { Plus, Save, Trash2 } from 'lucide-react'
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
import { useMemo, useState } from 'react'

export type UiSocialItem = {
  slug: string
  name: string
  href: string
}

const SOCIAL_PLATFORMS = [
  { slug: 'telegram', label: 'Telegram' },
  { slug: 'instagram', label: 'Instagram' },
  { slug: 'facebook', label: 'Facebook' },
  { slug: 'youtube', label: 'YouTube' },
  { slug: 'twitter', label: 'Twitter' },
  { slug: 'threads', label: 'Threads' },
  { slug: 'reddit', label: 'Reddit' },
] as const

type SocialMediaSectionProps = {
  items: UiSocialItem[]
  onAdd: (slug: string, href: string) => void
  onUpdateHref: (index: number, href: string) => void
  onRemove: (index: number) => void
  onSave: () => void
  saving: boolean
}

export function SocialMediaSection({
  items,
  onAdd,
  onUpdateHref,
  onRemove,
  onSave,
  saving,
}: SocialMediaSectionProps) {
  const [selectedSlug, setSelectedSlug] = useState<string>('')
  const [newHref, setNewHref] = useState('')

  const availablePlatforms = useMemo(
    () =>
      SOCIAL_PLATFORMS.filter(
        (p) => !items.some((item) => item.slug === p.slug)
      ),
    [items]
  )

  const handleAddClick = () => {
    if (!selectedSlug || !newHref.trim()) return
    onAdd(selectedSlug, newHref.trim())
    setSelectedSlug('')
    setNewHref('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ijtimoiy tarmoqlar</CardTitle>
        <CardDescription>
          Oldindan belgilangan platformalardan tanlab, havolani kiriting.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)_auto] items-end">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">
              Platforma
            </span>
            <Select
              value={selectedSlug}
              onValueChange={setSelectedSlug}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tanlang" />
              </SelectTrigger>
              <SelectContent>
                {availablePlatforms.map((p) => (
                  <SelectItem key={p.slug} value={p.slug}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">
              Havola
            </span>
            <Input
              value={newHref}
              onChange={(e) => setNewHref(e.target.value)}
              placeholder="/telegram yoki https://t.me/ferganamedia"
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddClick}
              className="gap-1"
              disabled={!availablePlatforms.length}
            >
              <Plus className="size-4" />
              Qo‘shish
            </Button>
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Platforma</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Havola</TableHead>
                <TableHead className="w-[80px] text-right">Amal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    Ijtimoiy tarmoqlar qo‘shilmagan.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow key={item.slug}>
                    <TableCell className="text-xs text-muted-foreground">
                      #{index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {SOCIAL_PLATFORMS.find((p) => p.slug === item.slug)?.label ??
                        item.name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.slug}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.href}
                        onChange={(e) => onUpdateHref(index, e.target.value)}
                        placeholder="/telegram yoki https://..."
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onRemove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="button" onClick={onSave} disabled={saving} className="gap-2">
            <Save className="size-4" />
            Saqlash
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

