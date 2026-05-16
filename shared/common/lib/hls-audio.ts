import Hls from "hls.js"

/** Brauzerda ko‘pincha faqat Safari to‘g‘ridan-to‘g‘ri ijro etadi; qolganlari uchun hls.js. */
export function isProbablyHlsUrl(url: string): boolean {
  const u = url.trim().toLowerCase()
  return u.includes(".m3u8") || u.includes("application/vnd.apple.mpegurl")
}

export type BindStreamOptions = {
  /** Manba tayyor bo‘lganda (HLS manifest yoki canplay) */
  onSourceReady?: () => void
}

/**
 * Audio elementga stream bog‘laydi. HLS — hls.js; aks holda — oddiy src.
 */
export function bindStreamToAudio(
  audio: HTMLAudioElement,
  url: string,
  opts?: BindStreamOptions
): () => void {
  const clean = () => {
    audio.pause()
    audio.removeAttribute("src")
    audio.load()
  }

  if (!url.trim()) {
    return clean
  }

  const fireReady = () => {
    opts?.onSourceReady?.()
  }

  if (isProbablyHlsUrl(url)) {
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      })
      hls.loadSource(url)
      hls.attachMedia(audio)
      hls.on(Hls.Events.MANIFEST_PARSED, fireReady)
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data.fatal) return
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad()
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError()
        }
      })
      return () => {
        hls.destroy()
        clean()
      }
    }
    if (audio.canPlayType("application/vnd.apple.mpegurl")) {
      audio.src = url
      const onCanPlay = () => fireReady()
      audio.addEventListener("canplay", onCanPlay, { once: true })
      return () => {
        audio.removeEventListener("canplay", onCanPlay)
        clean()
      }
    }
  }

  audio.src = url
  const onCanPlay = () => fireReady()
  audio.addEventListener("canplay", onCanPlay, { once: true })
  return () => {
    audio.removeEventListener("canplay", onCanPlay)
    clean()
  }
}

/** HTTPS sahifada HTTP audio (aralash kontent) — relay orqali. HLS relay qo‘llanmaydi. */
export function resolveRadioPlaybackUrl(streamUrl: string): string {
  if (typeof window === "undefined") return streamUrl
  if (window.location.protocol !== "https:") return streamUrl
  if (!streamUrl.startsWith("http:")) return streamUrl
  if (isProbablyHlsUrl(streamUrl)) return streamUrl
  return `/api/radio/relay?url=${encodeURIComponent(streamUrl)}`
}
