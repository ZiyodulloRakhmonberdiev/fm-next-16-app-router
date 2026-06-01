/**
 * Public ro'yxat / bosh sahifa / client feed uchun MongoDB projection.
 * `content` (4 til) eng og'ir maydon — listingda kerak emas.
 */
export const PUBLIC_NEWS_LIST_SELECT = "-content" as const
