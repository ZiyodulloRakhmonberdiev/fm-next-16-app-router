'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/common/components/ui/card'
import { Input } from '@/shared/common/components/ui/input'
import { Textarea } from '@/shared/common/components/ui/textarea'
import { Button } from '@/shared/common/components/ui/button'
import { Minus, Plus, Save, Trash2 } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/common/components/ui/dialog'
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
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const pendingDeleteItem =
    deleteIndex !== null ? items[deleteIndex] : undefined

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

  const confirmDelete = () => {
    if (deleteIndex === null) return
    onRemove(deleteIndex)
    setDeleteIndex(null)
  }

  return (
    <Card className="gap-0 py-3 shadow-sm md:py-4">
      <CardHeader className="px-4 md:px-6">
        <CardTitle className="text-base">Ijtimoiy tarmoqlar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-3 pt-0 md:px-5 md:pt-0">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)_auto] sm:items-end">
          <div className="min-w-0 space-y-1">
            <span className="text-xs font-medium text-muted-foreground">
              Platforma
            </span>
            <Select
              value={selectedSlug}
              onValueChange={setSelectedSlug}
            >
              <SelectTrigger className="w-full">
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
          <div className="min-w-0 space-y-1">
            <span className="text-xs font-medium text-muted-foreground">
              Havola
            </span>
            <Input
              value={newHref}
              onChange={(e) => setNewHref(e.target.value)}
              placeholder="https://"
              className="font-mono text-xs md:text-sm"
            />
          </div>
          <div className="flex sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddClick}
              className="w-full gap-1 sm:w-auto"
              disabled={!availablePlatforms.length}
            >
              <Plus className="size-4" />
              Qo‘shish
            </Button>
          </div>
        </div>

        {/* Mobil: kartalar — havola to‘liq */}
        <div className="space-y-3 sm:hidden">
          {items.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Ijtimoiy tarmoqlar qo‘shilmagan.
            </p>
          ) : (
            items.map((item, index) => (
              <div
                key={item.slug}
                className="space-y-2 rounded-lg border border-border/80 bg-background/50 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">#{index + 1}</p>
                    <p className="font-medium">
                      {SOCIAL_PLATFORMS.find((p) => p.slug === item.slug)?.label ??
                        item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.slug}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0 rounded-full"
                    onClick={() => setDeleteIndex(index)}
                  >
                    <Minus className="size-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Havola
                  </span>
                  <Input
                    value={item.href}
                    onChange={(e) => onUpdateHref(index, e.target.value)}
                    placeholder="https://"
                    className="font-mono text-xs md:text-sm"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop: jadval — havola to‘liq (wrap + textarea) */}
        <div className="hidden sm:block">
          <div className="max-w-full overflow-x-auto rounded-md border">
            <Table className="w-full min-w-[36rem]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead className="w-[7rem]">Platforma</TableHead>
                  {/* <TableHead className="w-[6rem]">Slug</TableHead> */}
                  <TableHead className="min-w-[16rem]">Havola</TableHead>
                  <TableHead className="w-14 text-right">Amal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                      Ijtimoiy tarmoqlar qo‘shilmagan.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, index) => (
                    <TableRow key={item.slug}>
                      <TableCell className="align-top text-xs text-muted-foreground">
                        #{index + 1}
                      </TableCell>
                      <TableCell className="align-top font-medium">
                        {SOCIAL_PLATFORMS.find((p) => p.slug === item.slug)?.label ??
                          item.name}
                      </TableCell>
                      {/* <TableCell className="align-top text-xs text-muted-foreground">
                        {item.slug}
                      </TableCell> */}
                      <TableCell className="align-top">
                        <Input
                          value={item.href}
                          onChange={(e) => onUpdateHref(index, e.target.value)}
                          placeholder="https:"
                          className="font-mono text-xs md:text-sm"
                        />
                      </TableCell>
                      <TableCell className="align-top text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="rounded-full"
                          onClick={() => setDeleteIndex(index)}
                        >
                          <Minus className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="w-full gap-2 sm:w-auto"
          >
            <Save className="size-4" />
            Saqlash
          </Button>
        </div>

        <Dialog
          open={deleteIndex !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteIndex(null)
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ijtimoiy tarmoqni o‘chirish?</DialogTitle>
            </DialogHeader>
            <DialogFooter>
          <div className="flex justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-auto"
                onClick={() => setDeleteIndex(null)}
              >
                Bekor qilish
              </Button>
              <Button type="button" variant="destructive" onClick={confirmDelete} className="w-auto">
                O‘chirish
              </Button>
            </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
