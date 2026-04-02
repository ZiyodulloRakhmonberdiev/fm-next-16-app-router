'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/common/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/common/components/ui/table'
import { Input } from '@/shared/common/components/ui/input'
import { useUsersQuery, useNewsQuery } from '@/features/dashboard/model/admin-hooks'
import { getLocaleValue } from '@/shared/common/lib/locale-types'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { UserCircle } from 'lucide-react'

export function AuthorsPage() {
  const locale = useLocale() as AppLocale
  const { data: users = [], isLoading: usersLoading } = useUsersQuery()
  const { data: newsRes, isLoading: newsLoading } = useNewsQuery()
  const [search, setSearch] = useState('')

  const rows = useMemo(() => {
    const news = newsRes?.data ?? []
    const metrics = new Map<string, { newsCount: number; views: number }>()
    for (const item of news) {
      const key = (item.authorId ?? '').trim()
      if (!key) continue
      const prev = metrics.get(key) ?? { newsCount: 0, views: 0 }
      prev.newsCount += 1
      prev.views += Number(item.views ?? 0)
      metrics.set(key, prev)
    }

    const authorUsers = users.filter((u) => (u.role ?? 'user') !== 'user')
    const mapped = authorUsers.map((u) => {
      const fullName =
        typeof u.full_name === 'string'
          ? u.full_name
          : getLocaleValue(u.full_name, locale) ?? u.full_name.uz ?? ''
      const bio = getLocaleValue(u.description ?? { uz: '', uzb: '', ru: '', en: '' }, locale) ?? ''
      const m = metrics.get(u._id) ?? { newsCount: 0, views: 0 }
      return {
        id: u._id,
        image: u.image,
        fullName: fullName.trim(),
        bio: bio.trim(),
        newsCount: m.newsCount,
        views: m.views,
      }
    })

    const q = search.trim().toLowerCase()
    const filtered = q
      ? mapped.filter(
          (x) => x.fullName.toLowerCase().includes(q) || x.bio.toLowerCase().includes(q)
        )
      : mapped

    return filtered.sort((a, b) => b.views - a.views)
  }, [users, newsRes?.data, locale, search])

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle>Mualliflar</CardTitle>
          <CardDescription>Rol: user emas bo'lgan hisoblar bo'yicha kengaytirilgan ma'lumot.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base">Ro'yxat ({rows.length})</CardTitle>
          <div className="w-full md:w-[360px]">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ism yoki bio bo'yicha qidirish..."
            />
          </div>
        </CardHeader>
        <CardContent>
          {usersLoading || newsLoading ? (
            <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rasm</TableHead>
                    <TableHead>To'liq ism</TableHead>
                    <TableHead>Bio</TableHead>
                    <TableHead className="text-right">News soni</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        Muallif topilmadi
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <div className="relative size-10 overflow-hidden rounded-full bg-muted">
                            {row.image ? (
                              <Image src={row.image} alt={row.fullName} fill className="object-cover" />
                            ) : (
                              <div className="flex size-full items-center justify-center">
                                <UserCircle className="size-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{row.fullName || '—'}</TableCell>
                        <TableCell className="max-w-[420px]">
                          <span className="line-clamp-2 text-sm text-muted-foreground">{row.bio || '—'}</span>
                        </TableCell>
                        <TableCell className="text-right">{row.newsCount}</TableCell>
                        <TableCell className="text-right">{row.views.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
