'use client'
/* eslint-disable react/no-unescaped-entities */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useSession } from 'next-auth/react'
import { normalizeRole } from '@/shared/common/lib/rbac'
import { toast } from 'sonner'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { LOCALES } from '@/shared/common/lib/locale-constants'
import type { SiteSettingsPayload } from '@/shared/common/lib/site-settings-types'

type SiteSettingsContextValue = {
  data: SiteSettingsPayload | null
  loading: boolean
  isCeo: boolean
  savingHeadline: boolean
  savingDescription: boolean
  savingSocial: boolean
  savingConfig: boolean
  savingTelegram: boolean
  savingDelivery: boolean
  updateHeadline: (locale: AppLocale, value: string) => void
  updateDescription: (locale: AppLocale, value: string) => void
  updateSiteConfig: <K extends keyof SiteSettingsPayload['siteConfig']>(
    key: K,
    value: SiteSettingsPayload['siteConfig'][K]
  ) => void
  updateAddress: (locale: AppLocale, value: string) => void
  addSocialItem: (slug: string, href: string) => void
  updateSocialHref: (index: number, href: string) => void
  removeSocialItem: (index: number) => void
  setHeadlineEnabled: (enabled: boolean) => void
  setTelegramField: (patch: Partial<SiteSettingsPayload['telegram']>) => void
  setClientDeliveryField: (patch: Partial<SiteSettingsPayload['clientDelivery']>) => void
  setClientDeliveryModel: (key: keyof SiteSettingsPayload['clientDelivery']['models'], checked: boolean) => void
  handleSaveHeadline: () => Promise<void>
  handleSaveDescription: () => Promise<void>
  handleSaveSocial: () => Promise<void>
  handleSaveConfig: () => Promise<void>
  handleSaveTelegram: () => Promise<void>
  handleSaveDelivery: () => Promise<void>
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(null)

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const role = normalizeRole(session?.user?.role)
  const isCeo = role === 'ceo'
  const [loading, setLoading] = useState(true)
  const [savingHeadline, setSavingHeadline] = useState(false)
  const [savingDescription, setSavingDescription] = useState(false)
  const [savingSocial, setSavingSocial] = useState(false)
  const [savingConfig, setSavingConfig] = useState(false)
  const [savingTelegram, setSavingTelegram] = useState(false)
  const [savingDelivery, setSavingDelivery] = useState(false)
  const [data, setData] = useState<SiteSettingsPayload | null>(null)

  useEffect(() => {
    fetch('/api/configs')
      .then((res) => res.json())
      .then((payload: SiteSettingsPayload) => {
        setData(payload)
      })
      .catch(() => toast.error('Sozlamalarni yuklashda xato'))
      .finally(() => setLoading(false))
  }, [])

  const updateHeadline = useCallback((locale: AppLocale, value: string) => {
    setData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        headline: {
          ...prev.headline,
          message: { ...prev.headline.message, [locale]: value },
        },
      }
    })
  }, [])

  const updateDescription = useCallback((locale: AppLocale, value: string) => {
    setData((prev) => (prev ? { ...prev, description: { ...prev.description, [locale]: value } } : prev))
  }, [])

  const updateSiteConfig = useCallback(
    <K extends keyof SiteSettingsPayload['siteConfig']>(key: K, value: SiteSettingsPayload['siteConfig'][K]) => {
      setData((prev) => (prev ? { ...prev, siteConfig: { ...prev.siteConfig, [key]: value } } : prev))
    },
    []
  )

  const updateAddress = useCallback((locale: AppLocale, value: string) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            siteConfig: {
              ...prev.siteConfig,
              address: { ...prev.siteConfig.address, [locale]: value },
            },
          }
        : prev
    )
  }, [])

  const addSocialItem = useCallback((slug: string, href: string) => {
    setData((prev) => {
      if (!prev) return prev
      const exists = prev.socialMedia.some((s) => s.slug === slug)
      if (exists) {
        toast.error("Bu platforma allaqachon qo'shilgan")
        return prev
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
      return { ...prev, socialMedia: [...prev.socialMedia, { slug, name, href }] }
    })
  }, [])

  const updateSocialHref = useCallback((index: number, href: string) => {
    setData((prev) => {
      if (!prev) return prev
      const next = [...prev.socialMedia]
      if (!next[index]) return prev
      next[index] = { ...next[index], href }
      return { ...prev, socialMedia: next }
    })
  }, [])

  const removeSocialItem = useCallback((index: number) => {
    setData((prev) => (prev ? { ...prev, socialMedia: prev.socialMedia.filter((_, i) => i !== index) } : prev))
  }, [])

  const setHeadlineEnabled = useCallback((enabled: boolean) => {
    setData((prev) => (prev ? { ...prev, headline: { ...prev.headline, enabled } } : prev))
  }, [])

  const setTelegramField = useCallback((patch: Partial<SiteSettingsPayload['telegram']>) => {
    setData((prev) => (prev ? { ...prev, telegram: { ...prev.telegram, ...patch } } : prev))
  }, [])

  const setClientDeliveryField = useCallback((patch: Partial<SiteSettingsPayload['clientDelivery']>) => {
    setData((prev) => (prev ? { ...prev, clientDelivery: { ...prev.clientDelivery, ...patch } } : prev))
  }, [])

  const setClientDeliveryModel = useCallback(
    (key: keyof SiteSettingsPayload['clientDelivery']['models'], checked: boolean) => {
      setData((prev) =>
        prev
          ? {
              ...prev,
              clientDelivery: {
                ...prev.clientDelivery,
                models: { ...prev.clientDelivery.models, [key]: checked },
              },
            }
          : prev
      )
    },
    []
  )

  const getCurrentFromServer = useCallback(async (): Promise<SiteSettingsPayload | null> => {
    try {
      const res = await fetch('/api/configs')
      if (!res.ok) return null
      return (await res.json()) as SiteSettingsPayload
    } catch {
      return null
    }
  }, [])

  const postPayload = useCallback(async (payload: SiteSettingsPayload) => {
    const res = await fetch('/api/configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const result = await res.json()
    return !!result?.ok
  }, [])

  const handleSaveHeadline = useCallback(async () => {
    if (!data) return
    setSavingHeadline(true)
    try {
      if (data.headline.enabled) {
        const hasAnyMessage = LOCALES.some((locale) => (data.headline.message[locale] ?? '').trim().length > 0)
        if (!hasAnyMessage) {
          toast.error("Headline yoqilgan bo'lsa, kamida bitta xabar kiriting")
          return
        }
      }
      const current = (await getCurrentFromServer()) ?? data
      const ok = await postPayload({ ...current, headline: data.headline })
      toast[ok ? 'success' : 'error'](ok ? 'Sarlavha saqlandi' : 'Saqlashda xato')
    } catch {
      toast.error('Saqlashda xato')
    } finally {
      setSavingHeadline(false)
    }
  }, [data, getCurrentFromServer, postPayload])

  const handleSaveDescription = useCallback(async () => {
    if (!data) return
    setSavingDescription(true)
    try {
      const current = (await getCurrentFromServer()) ?? data
      const ok = await postPayload({ ...current, description: data.description })
      toast[ok ? 'success' : 'error'](ok ? 'Tavsif saqlandi' : 'Saqlashda xato')
    } catch {
      toast.error('Saqlashda xato')
    } finally {
      setSavingDescription(false)
    }
  }, [data, getCurrentFromServer, postPayload])

  const handleSaveSocial = useCallback(async () => {
    if (!data) return
    setSavingSocial(true)
    try {
      const current = (await getCurrentFromServer()) ?? data
      const ok = await postPayload({ ...current, socialMedia: data.socialMedia })
      toast[ok ? 'success' : 'error'](ok ? 'Ijtimoiy tarmoqlar saqlandi' : 'Saqlashda xato')
    } catch {
      toast.error('Saqlashda xato')
    } finally {
      setSavingSocial(false)
    }
  }, [data, getCurrentFromServer, postPayload])

  const handleSaveConfig = useCallback(async () => {
    if (!data) return
    setSavingConfig(true)
    try {
      const current = (await getCurrentFromServer()) ?? data
      const ok = await postPayload({ ...current, siteConfig: data.siteConfig })
      toast[ok ? 'success' : 'error'](ok ? 'Site config saqlandi' : 'Saqlashda xato')
    } catch {
      toast.error('Saqlashda xato')
    } finally {
      setSavingConfig(false)
    }
  }, [data, getCurrentFromServer, postPayload])

  const handleSaveTelegram = useCallback(async () => {
    if (!data) return
    setSavingTelegram(true)
    try {
      if (data.telegram.enabled && (!data.telegram.botToken.trim() || !data.telegram.chatId.trim())) {
        toast.error("Telegram yoqilgan bo'lsa bot token va chat id majburiy")
        return
      }
      const current = (await getCurrentFromServer()) ?? data
      const ok = await postPayload({ ...current, telegram: data.telegram })
      toast[ok ? 'success' : 'error'](ok ? 'Telegram credentiallar saqlandi' : 'Saqlashda xato')
    } catch {
      toast.error('Saqlashda xato')
    } finally {
      setSavingTelegram(false)
    }
  }, [data, getCurrentFromServer, postPayload])

  const handleSaveDelivery = useCallback(async () => {
    if (!data) return
    setSavingDelivery(true)
    try {
      if (
        data.clientDelivery.mode !== 'normal' &&
        (!data.clientDelivery.title.trim() || !data.clientDelivery.description.trim())
      ) {
        toast.error('Bu rejimda title va description majburiy')
        return
      }
      const current = (await getCurrentFromServer()) ?? data
      const ok = await postPayload({ ...current, clientDelivery: data.clientDelivery })
      toast[ok ? 'success' : 'error'](ok ? 'Client boshqaruvi saqlandi' : 'Saqlashda xato')
    } catch {
      toast.error('Saqlashda xato')
    } finally {
      setSavingDelivery(false)
    }
  }, [data, getCurrentFromServer, postPayload])

  const value = useMemo<SiteSettingsContextValue>(
    () => ({
      data,
      loading,
      isCeo,
      savingHeadline,
      savingDescription,
      savingSocial,
      savingConfig,
      savingTelegram,
      savingDelivery,
      updateHeadline,
      updateDescription,
      updateSiteConfig,
      updateAddress,
      addSocialItem,
      updateSocialHref,
      removeSocialItem,
      setHeadlineEnabled,
      setTelegramField,
      setClientDeliveryField,
      setClientDeliveryModel,
      handleSaveHeadline,
      handleSaveDescription,
      handleSaveSocial,
      handleSaveConfig,
      handleSaveTelegram,
      handleSaveDelivery,
    }),
    [
      data,
      loading,
      isCeo,
      savingHeadline,
      savingDescription,
      savingSocial,
      savingConfig,
      savingTelegram,
      savingDelivery,
      updateHeadline,
      updateDescription,
      updateSiteConfig,
      updateAddress,
      addSocialItem,
      updateSocialHref,
      removeSocialItem,
      setHeadlineEnabled,
      setTelegramField,
      setClientDeliveryField,
      setClientDeliveryModel,
      handleSaveHeadline,
      handleSaveDescription,
      handleSaveSocial,
      handleSaveConfig,
      handleSaveTelegram,
      handleSaveDelivery,
    ]
  )

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext)
  if (!ctx) {
    throw new Error('useSiteSettings must be used within SiteSettingsProvider')
  }
  return ctx
}
