export function publicCacheHeaders(maxAgeSeconds: number, staleWhileRevalidateSeconds: number) {
  return {
    "Cache-Control": `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`,
  }
}

export function privateCacheHeaders(maxAgeSeconds: number, staleWhileRevalidateSeconds: number) {
  return {
    "Cache-Control": `private, max-age=${maxAgeSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`,
    Vary: "Cookie",
  }
}

export function noStoreHeaders() {
  return {
    "Cache-Control": "private, no-store, max-age=0",
    Vary: "Cookie",
  }
}

export const CACHE_TIMINGS = {
  newsList: { maxAge: 60, stale: 300 },
  siteSettings: { maxAge: 120, stale: 600 },
  taxonomy: { maxAge: 300, stale: 1800 },
  ads: { maxAge: 120, stale: 600 },
  team: { maxAge: 300, stale: 1800 },
  engagement: { maxAge: 15, stale: 60 },
} as const
