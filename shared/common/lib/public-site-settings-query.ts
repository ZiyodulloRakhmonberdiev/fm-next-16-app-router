"use client"

import { useQuery } from "@tanstack/react-query"
import { seed } from "@/scripts/seed"
import type { SiteSettingsPayload } from "./site-settings-types"

export function getSeedSiteSettings(): SiteSettingsPayload {
  return {
    headline: {
      enabled: true,
      message: { ...seed.headline },
    },
    description: { ...seed.description },
    socialMedia: seed.socialMedia.map((s) => ({
      slug: s.slug,
      name: s.name,
      href: s.href,
    })),
    siteConfig: {
      email: seed.siteConfig.email,
      phone: seed.siteConfig.phone,
      address: { ...seed.siteConfig.address },
    },
    telegram: {
      enabled: seed.telegram.enabled,
      botToken: seed.telegram.botToken,
      chatId: seed.telegram.chatId,
      threadId: seed.telegram.threadId || undefined,
    },
    clientDelivery: {
      mode: seed.clientDelivery.mode,
      title: seed.clientDelivery.title,
      description: seed.clientDelivery.description,
      models: {
        news: seed.clientDelivery.models.news,
        categories: seed.clientDelivery.models.categories,
        tags: seed.clientDelivery.models.tags,
      },
    },
  }
}

function normalizeSiteSettings(raw: unknown): SiteSettingsPayload {
  const fallback = getSeedSiteSettings()
  if (!raw || typeof raw !== "object") return fallback
  const data = raw as Partial<SiteSettingsPayload> & {
    headline?: SiteSettingsPayload["headline"] | Record<string, string>
  }

  const headline =
    data.headline && typeof data.headline === "object" && "enabled" in data.headline
      ? {
          enabled: Boolean(data.headline.enabled),
          message: { ...fallback.headline.message, ...(data.headline.message ?? {}) },
        }
      : {
          enabled: true,
          message: { ...fallback.headline.message, ...(data.headline ?? {}) },
        }

  return {
    headline,
    description: { ...fallback.description, ...(data.description ?? {}) },
    socialMedia: Array.isArray(data.socialMedia) ? data.socialMedia : fallback.socialMedia,
    siteConfig: {
      ...fallback.siteConfig,
      ...(data.siteConfig ?? {}),
      address: {
        ...fallback.siteConfig.address,
        ...(data.siteConfig?.address ?? {}),
      },
    },
    telegram: {
      ...fallback.telegram,
      ...(data.telegram ?? {}),
    },
    clientDelivery: {
      ...fallback.clientDelivery,
      ...(data.clientDelivery ?? {}),
      models: {
        ...fallback.clientDelivery.models,
        ...(data.clientDelivery?.models ?? {}),
      },
    },
  }
}

async function fetchSiteSettings(): Promise<SiteSettingsPayload> {
  try {
    const res = await fetch("/api/configs", { cache: "no-store" })
    if (!res.ok) return getSeedSiteSettings()
    const json = await res.json().catch(() => null)
    return normalizeSiteSettings(json)
  } catch {
    return getSeedSiteSettings()
  }
}

export function usePublicSiteSettingsQuery() {
  return useQuery({
    queryKey: ["public-site-settings"],
    queryFn: fetchSiteSettings,
    staleTime: 0,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  })
}
