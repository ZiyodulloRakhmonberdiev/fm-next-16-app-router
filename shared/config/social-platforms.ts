import type { LucideIcon } from 'lucide-react'
import { Facebook, Instagram, Play, Send, Twitter } from 'lucide-react'

export const SOCIAL_PLATFORMS_CONFIG: Record<
  string,
  { Icon: LucideIcon; bgColor: string }
> = {
  twitter: {
    Icon: Twitter,
    bgColor:
      'bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 dark:bg-[#1DA1F2] dark:hover:bg-[#1DA1F2]/90',
  },
  facebook: {
    Icon: Facebook,
    bgColor:
      'bg-[#1877F2] hover:bg-[#1877F2]/90 dark:bg-[#1877F2] dark:hover:bg-[#1877F2]/90',
  },
  instagram: {
    Icon: Instagram,
    bgColor:
      'bg-[#E4405F] hover:bg-[#E4405F]/90 dark:bg-[#E4405F] dark:hover:bg-[#E4405F]/90',
  },
  telegram: {
    Icon: Send,
    bgColor:
      'bg-[#26A5E4] hover:bg-[#26A5E4]/90 dark:bg-[#26A5E4] dark:hover:bg-[#26A5E4]/90',
  },
  youtube: {
    Icon: Play,
    bgColor:
      'bg-[#FF0000] hover:bg-[#FF0000]/90 dark:bg-[#FF0000] dark:hover:bg-[#FF0000]/90',
  },
}

/** API/seed dan keladigan name ni config kalitiga aylantiradi (lowercase, trim). */
export function getSocialPlatformKey(name: string): string {
  return name.trim().toLowerCase()
}

/** Berilgan name bo‘yicha Icon + bgColor qaytaradi; topilmasa null. */
export function getSocialPlatformStyle(name: string) {
  const key = getSocialPlatformKey(name)
  return SOCIAL_PLATFORMS_CONFIG[key] ?? null
}
