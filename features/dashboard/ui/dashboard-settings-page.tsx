'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/common/components/ui/card'
import { Button } from '@/shared/common/components/ui/button'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import type { SiteSettingsPayload } from '@/shared/common/lib/site-settings-types'
import { Settings } from 'lucide-react'
import { HeadlineSection } from '../configs/ui/headline-section'
import { DescriptionSection } from '../configs/ui/description-section'
import { SocialMediaSection, type UiSocialItem } from '../configs/ui/social-media-section'
import { SiteConfigSection } from '../configs/ui/site-config-section'

const LOCALES: AppLocale[] = ['uz', 'uzb', 'ru', 'en']
const LOCALE_LABELS: Record<AppLocale, string> = {
  uz: "O'zbek (lotin)",
  uzb: "O'zbek (kirill)",
  ru: 'Ruscha',
  en: 'English',
}

export function DashboardSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [savingHeadline, setSavingHeadline] = useState(false)
  const [savingDescription, setSavingDescription] = useState(false)
  const [savingSocial, setSavingSocial] = useState(false)
  const [savingConfig, setSavingConfig] = useState(false)
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

  const addSocialItem = (slug: string, href: string) => {
    if (!data) return
    const exists = data.socialMedia.some((s) => s.slug === slug)
    if (exists) {
      toast.error('Bu platforma allaqachon qo‘shilgan')
      return
    }
    const labelMap: Record<string, string> = {
      telegram: 'Telegram',
      instagram: 'Instagram',
      facebook: 'Facebook',
      youtube: 'YouTube',
      twitter: 'Twitter',
      threads: 'Threads',
      reddit: 'Reddit',
    }
    const name = labelMap[slug] ?? slug
    setData({
      ...data,
      socialMedia: [...data.socialMedia, { slug, name, href }],
    })
  }

  const updateSocialHref = (index: number, href: string) => {
    if (!data) return
    const next = [...data.socialMedia]
    if (!next[index]) return
    next[index] = { ...next[index], href }
    setData({ ...data, socialMedia: next })
  }

  const removeSocialItem = (index: number) => {
    if (!data) return
    setData({
      ...data,
      socialMedia: data.socialMedia.filter((_, i) => i !== index),
    })
  }

  const getCurrentFromServer = async (): Promise<SiteSettingsPayload | null> => {
    try {
      const res = await fetch('/api/site-settings')
      if (!res.ok) return null
      return (await res.json()) as SiteSettingsPayload
    } catch {
      return null
    }
  }

  const postPayload = async (payload: SiteSettingsPayload) => {
    const res = await fetch('/api/site-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const result = await res.json()
    if (result?.ok) {
      return true
    }
    return false
  }

  const handleSaveHeadline = async () => {
    if (!data) return
    setSavingHeadline(true)
    try {
      const current = (await getCurrentFromServer()) ?? data
      const next: SiteSettingsPayload = {
        ...current,
        headline: data.headline,
      }
      const ok = await postPayload(next)
      if (ok) {
        toast.success('Sarlavha saqlandi')
      } else {
        toast.error('Saqlashda xato')
      }
    } catch {
      toast.error('Saqlashda xato')
    } finally {
      setSavingHeadline(false)
    }
  }

  const handleSaveDescription = async () => {
    if (!data) return
    setSavingDescription(true)
    try {
      const current = (await getCurrentFromServer()) ?? data
      const next: SiteSettingsPayload = {
        ...current,
        description: data.description,
      }
      const ok = await postPayload(next)
      if (ok) {
        toast.success('Tavsif saqlandi')
      } else {
        toast.error('Saqlashda xato')
      }
    } catch {
      toast.error('Saqlashda xato')
    } finally {
      setSavingDescription(false)
    }
  }

  const handleSaveSocial = async () => {
    if (!data) return
    setSavingSocial(true)
    try {
      const current = (await getCurrentFromServer()) ?? data
      const next: SiteSettingsPayload = {
        ...current,
        socialMedia: data.socialMedia,
      }
      const ok = await postPayload(next)
      if (ok) {
        toast.success('Ijtimoiy tarmoqlar saqlandi')
      } else {
        toast.error('Saqlashda xato')
      }
    } catch {
      toast.error('Saqlashda xato')
    } finally {
      setSavingSocial(false)
    }
  }

  const handleSaveConfig = async () => {
    if (!data) return
    setSavingConfig(true)
    try {
      const current = (await getCurrentFromServer()) ?? data
      const next: SiteSettingsPayload = {
        ...current,
        siteConfig: data.siteConfig,
      }
      const ok = await postPayload(next)
      if (ok) {
        toast.success('Site config saqlandi')
      } else {
        toast.error('Saqlashda xato')
      }
    } catch {
      toast.error('Saqlashda xato')
    } finally {
      setSavingConfig(false)
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
              Ma'lumotlar
            </CardTitle>
            <CardDescription className="hidden md:block">
              Headline, tavsif, ijtimoiy tarmoqlar va sayt konfiguratsiyasi
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <HeadlineSection
        locales={LOCALES}
        localeLabels={LOCALE_LABELS}
        values={data.headline}
        onChange={updateHeadline}
        onSave={handleSaveHeadline}
        saving={savingHeadline}
      />

      <DescriptionSection
        locales={LOCALES}
        localeLabels={LOCALE_LABELS}
        values={data.description}
        onChange={updateDescription}
        onSave={handleSaveDescription}
        saving={savingDescription}
      />

      <SocialMediaSection
        items={data.socialMedia as UiSocialItem[]}
        onAdd={addSocialItem}
        onUpdateHref={updateSocialHref}
        onRemove={removeSocialItem}
        onSave={handleSaveSocial}
        saving={savingSocial}
      />

      <SiteConfigSection
        locales={LOCALES}
        localeLabels={LOCALE_LABELS}
        value={data.siteConfig}
        onChangeField={updateSiteConfig}
        onChangeAddress={updateAddress}
        onSave={handleSaveConfig}
        saving={savingConfig}
      />
    </div>
  )
}
