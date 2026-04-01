"use client"

import { Button } from "@/shared/common/components/ui/button"
import { CardHeader, CardTitle } from "@/shared/common/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/common/components/ui/table"
import { Loader2, Pencil, Trash2 } from "lucide-react"
import type { AdItem } from "./ads-dashboard-types"

type AdsListProps = {
  items: AdItem[]
  deletingId: string | null
  onEditItem: (item: AdItem) => void
  onRemove: (id: string) => void
}

export function AdsListCardHeader() {
  return (
    <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
      <CardTitle className="text-lg sm:text-xl">Reklamlar ro&apos;yxati</CardTitle>
    </CardHeader>
  )
}

export function AdsList({ items, deletingId, onEditItem, onRemove }: AdsListProps) {
  return (
    <>
      <div className="md:hidden">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Reklama yo&apos;q</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item._id} className="rounded-lg border bg-card p-4 shadow-sm">
                <p className="font-medium leading-snug">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.siteName}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>Faol: {item.active ? "Ha" : "Yo'q"}</span>
                  {/* Hozircha priority ko'rsatilmaydi. */}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="min-h-10 flex-1 gap-2"
                    onClick={() => onEditItem(item)}
                  >
                    <Pencil className="size-4 shrink-0" />
                    Tahrirlash
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="min-h-10 flex-1 gap-2"
                    disabled={deletingId === item._id}
                    onClick={() => void onRemove(item._id)}
                  >
                    {deletingId === item._id ? (
                      <Loader2 className="size-4 shrink-0 animate-spin" />
                    ) : (
                      <Trash2 className="size-4 shrink-0" />
                    )}
                    O&apos;chirish
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="hidden md:block md:overflow-x-auto md:rounded-md md:border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reklama nomi</TableHead>
              <TableHead>Sayt</TableHead>
              <TableHead>Faol</TableHead>
              {/* Hozircha priority ko'rsatilmaydi. */}
              <TableHead className="w-[120px]">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Reklama yo&apos;q
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="max-w-[200px] truncate font-medium">{item.title}</TableCell>
                  <TableCell className="max-w-[160px] truncate">{item.siteName}</TableCell>
                  <TableCell>{item.active ? "Ha" : "Yo'q"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="size-9 shrink-0"
                        title="Tahrirlash"
                        onClick={() => onEditItem(item)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="size-9 shrink-0"
                        title="O'chirish"
                        disabled={deletingId === item._id}
                        onClick={() => void onRemove(item._id)}
                      >
                        {deletingId === item._id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
