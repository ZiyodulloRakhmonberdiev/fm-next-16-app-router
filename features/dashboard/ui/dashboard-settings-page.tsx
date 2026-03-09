'use client'

import { useState, useEffect } from 'react'
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
import type { AppLocale } from '@/shared/common/lib/locale-api'
import type { SiteSettingsPayload, SocialMediaItem } from '@/shared/common/lib/site-settings-types'
import { Settings, Save, Plus, Trash2 } from 'lucide-react'

const LOCALES: AppLocale[] = ['uz', 'uzb', 'ru', 'en']
const LOCALE_LABELS: Record<AppLocale, string> = {
  uz: "O'zbek (lotin)",
  uzb: "O'zbek (kirill)",
  ru: 'Ruscha',
  en: 'English',
}

export function DashboardSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<SiteSettingsPayload | null>(null)

  useEffect(() => {
    fetch('/api/site-settings')
      .then((res) => res.json())
      .then((payload: SiteSettingsPayload) => {
        setData(payload)
      })
      .catch(() => toast.error('Sozlamalarni yuklashda xato'))
      .finally(() => setLoading(false))
  }, [])

  const updateHeadline = (locale: AppLocale, value: string) => {
    if (!data) return
    setData({
      ...data,
      headline: { ...data.headline, [locale]: value },
    })
  }

  const updateDescription = (locale: AppLocale, value: string) => {
    if (!data) return
    setData({
      ...data,
      description: { ...data.description, [locale]: value },
    })
  }

  const updateSiteConfig = <K extends keyof SiteSettingsPayload['siteConfig']>(
    key: K,
    value: SiteSettingsPayload['siteConfig'][K]
  ) => {
    if (!data) return
    setData({
      ...data,
      siteConfig: { ...data.siteConfig, [key]: value },
    })
  }

  const updateAddress = (locale: AppLocale, value: string) => {
    if (!data) return
    setData({
      ...data,
      siteConfig: {
        ...data.siteConfig,
        address: { ...data.siteConfig.address, [locale]: value },
      },
    })
  }

  const updateSocialItem = (index: number, item: SocialMediaItem) => {
    if (!data) return
    const next = [...data.socialMedia]
    next[index] = item
    setData({ ...data, socialMedia: next })
  }

  const addSocialItem = () => {
    if (!data) return
    setData({
      ...data,
      socialMedia: [
        ...data.socialMedia,
        {
          slug: '',
          name: { uz: '', uzb: '', ru: '', en: '' },
          href: '',
        },
      ],
    })
  }

  const removeSocialItem = (index: number) => {
    if (!data) return
    setData({
      ...data,
      socialMedia: data.socialMedia.filter((_, i) => i !== index),
    })
  }

  const handleSave = async () => {
    if (!data) return
    setSaving(true)
    try {
      const res = await fetch('/api/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (result?.ok) {
        toast.success('Sozlamalar saqlandi')
      } else {
        toast.error('Saqlashda xato')
      }
    } catch {
      toast.error('Saqlashda xato')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Yuklanmoqda...
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Settings className="size-6" />
              Sayt sozlamalari
            </CardTitle>
            <CardDescription>
              Headline, tavsif, ijtimoiy tarmoqlar va sayt konfiguratsiyasi
            </CardDescription>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="size-4" />
            Saqlash
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Headline (sarlavha)</CardTitle>
          <CardDescription>Barcha tillarda banner sarlavha</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {LOCALES.map((locale) => (
            <div key={locale} className="space-y-2">
              <Label>{LOCALE_LABELS[locale]}</Label>
              <Input
                value={data.headline[locale] ?? ''}
                onChange={(e) => updateHeadline(locale, e.target.value)}
                placeholder={`Headline (${locale})`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Description (tavsif)</CardTitle>
          <CardDescription>Sayt haqida qisqacha — barcha tillar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {LOCALES.map((locale) => (
            <div key={locale} className="space-y-2">
              <Label>{LOCALE_LABELS[locale]}</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={data.description[locale] ?? ''}
                onChange={(e) => updateDescription(locale, e.target.value)}
                placeholder={`Description (${locale})`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Ijtimoiy tarmoqlar (socialMedia)</CardTitle>
            <CardDescription>Slug, nomlar va havola har bir til uchun</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addSocialItem} className="gap-1">
            <Plus className="size-4" />
            Qo‘shish
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.socialMedia.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-border p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  #{index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeSocialItem(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Slug</Label>
                  <Input
                    value={item.slug}
                    onChange={(e) =>
                      updateSocialItem(index, { ...item, slug: e.target.value })
                    }
                    placeholder="telegram"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Href</Label>
                  <Input
                    value={item.href}
                    onChange={(e) =>
                      updateSocialItem(index, { ...item, href: e.target.value })
                    }
                    placeholder="/telegram"
                  />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {LOCALES.map((locale) => (
                  <div key={locale} className="space-y-1">
                    <Label>Nomi ({LOCALE_LABELS[locale]})</Label>
                    <Input
                      value={item.name[locale] ?? ''}
                      onChange={(e) =>
                        updateSocialItem(index, {
                          ...item,
                          name: { ...item.name, [locale]: e.target.value },
                        })
                      }
                      placeholder={`Nomi ${locale}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Site config</CardTitle>
          <CardDescription>Email, telefon, manzil (til bo‘yicha)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={data.siteConfig.email}
                onChange={(e) => updateSiteConfig('email', e.target.value)}
                placeholder="info@example.uz"
              />
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input
                value={data.siteConfig.phone}
                onChange={(e) => updateSiteConfig('phone', e.target.value)}
                placeholder="+998 90 123 45 67"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Manzil (har bir til)</Label>
            {LOCALES.map((locale) => (
              <div key={locale} className="space-y-1">
                <Label className="text-muted-foreground text-xs">
                  {LOCALE_LABELS[locale]}
                </Label>
                <Input
                  value={data.siteConfig.address[locale] ?? ''}
                  onChange={(e) => updateAddress(locale, e.target.value)}
                  placeholder={`Manzil (${locale})`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="size-4" />
          Saqlash
        </Button>
      </div>
    </div>
  )
}
