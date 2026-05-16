/**
 * O‘zbekistonda tekshirilgan to‘g‘ridan-to‘g‘ri oqim URLlari.
 * Radio Browser global qidiruvi ishlatilmaydi — faqat UZ pool yoki shu ro‘yxat.
 */
export type UzRadioStaticStream = {
  streamUrl: string
  favicon?: string | null
}

export const UZ_RADIO_STATIC_BY_DISPLAY: Record<string, UzRadioStaticStream> = {
  "Oriat Dono (106.5)": {
    streamUrl: "http://194.5.152.248:8000/dono",
  },
  "Oriat FM (100.5)": {
    streamUrl: "http://194.5.152.248:8000/fm",
  },
  "O'zbegim taronasi": {
    streamUrl: "https://fm101.uz:9943/fm101_low.aac",
  },
  Yoshlar: {
    streamUrl: "http://ns10.jethost.uz:8000/yoshlarovoziaac",
  },
  HitFm: {
    streamUrl: "http://ns10.jethost.uz:8000/hitfmuz",
  },
  "A'LO FM": {
    streamUrl: "http://tabassum.uz:9000/alo_low",
  },
  "Radio Markaz": {
    streamUrl: "http://mediamarkaz.com:8000/radiomarkaz",
  },
  "Qalbim navosi": {
    streamUrl: "http://live.qalbimnavosi.uz/qalbimnavosi",
  },
  "Radio Tabassum": {
    streamUrl: "http://tabassum.uz:9000/alo_low",
  },
}

function staticId(displayName: string): string {
  const slug = displayName
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/['ʼʻ`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return `static-${slug || "station"}`
}

export function getStaticRadioStream(
  displayName: string
): (UzRadioStaticStream & { id: string }) | null {
  const entry = UZ_RADIO_STATIC_BY_DISPLAY[displayName]
  if (!entry?.streamUrl?.trim()) return null
  return {
    id: staticId(displayName),
    streamUrl: entry.streamUrl.trim(),
    favicon: entry.favicon ?? null,
  }
}
