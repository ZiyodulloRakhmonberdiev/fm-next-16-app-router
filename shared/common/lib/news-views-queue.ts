/**
 * Ko'rishlar (views) hisoblagichini client tomonda to'plab, har 30 soniyada
 * bitta batch so'rovda serverga yuboradi. Maqsad — har maqola ochilganda
 * alohida API/DB chaqiruvini (Vercel Function invocation) kamaytirish.
 */

const FLUSH_INTERVAL_MS = 30_000
const ENDPOINT = "/api/news/views"

// slug -> shu flush oralig'ida to'plangan ko'rishlar soni
const queue = new Map<string, number>()
let timer: ReturnType<typeof setInterval> | null = null
let listenersBound = false

function buildItems(): Array<{ slug: string; count: number }> {
  return Array.from(queue.entries()).map(([slug, count]) => ({ slug, count }))
}

function requeue(items: Array<{ slug: string; count: number }>) {
  for (const it of items) {
    queue.set(it.slug, (queue.get(it.slug) ?? 0) + it.count)
  }
}

function flush(useBeacon = false) {
  if (queue.size === 0) return
  const items = buildItems()
  queue.clear()
  const payload = JSON.stringify({ items })

  // Sahifa yopilayotganda sendBeacon ishonchliroq (fetch bekor bo'lishi mumkin)
  if (useBeacon && typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([payload], { type: "application/json" })
    const ok = navigator.sendBeacon(ENDPOINT, blob)
    if (!ok) requeue(items)
    return
  }

  void fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // Xato bo'lsa keyingi flush'da qayta urinish uchun navbatga qaytaramiz
    requeue(items)
  })
}

function ensureTimers() {
  if (listenersBound || typeof window === "undefined") return
  listenersBound = true

  timer = setInterval(() => flush(false), FLUSH_INTERVAL_MS)

  // Sahifa berkilganda/yashirinilganda qolgan ko'rishlarni yuborib qolamiz
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush(true)
  })
  window.addEventListener("pagehide", () => flush(true))
}

/** Bitta maqola ko'rilganini navbatga qo'shadi (darhol yubormaydi). */
export function enqueueNewsView(slug: string) {
  if (typeof window === "undefined") return
  const s = slug?.trim()
  if (!s) return
  queue.set(s, (queue.get(s) ?? 0) + 1)
  ensureTimers()
}
