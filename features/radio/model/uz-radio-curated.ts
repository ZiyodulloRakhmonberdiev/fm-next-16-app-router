/**
 * Saytda ko‘rsatiladigan O‘zbekiston radiokanallari.
 * Global Radio Browser qidiruvi ishlatilmaydi — faqat statik URL yoki country=UZ pool.
 */
export type CuratedRadioSlot = {
  displayName: string
  cardTitle?: string
  frequencyLine?: string
  logoSrc?: string
  /** Faqat UZ pool ichida nom bo‘yicha qidirish (ixtiyoriy) */
  include?: string[]
  exclude?: string[]
}

export function normRadioKey(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/['ʼʻ`]/g, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function stationMatchesCuratedSlot(stationName: string, slot: CuratedRadioSlot): boolean {
  if (!slot.include?.length) return false
  const n = normRadioKey(stationName)
  if (slot.exclude?.some((e) => n.includes(normRadioKey(e)))) return false
  return slot.include.some((inc) => n.includes(normRadioKey(inc)))
}

export function radioCardFieldsFromSlot(slot: CuratedRadioSlot): {
  cardTitle: string
  frequencyLine: string
} {
  if (slot.cardTitle && slot.frequencyLine) {
    return { cardTitle: slot.cardTitle, frequencyLine: slot.frequencyLine }
  }
  const baseTitle =
    slot.cardTitle ??
    (() => {
      const stripped = slot.displayName.replace(/\s*\([^)]+\)\s*$/, "").trim()
      return stripped || slot.displayName
    })()
  if (slot.frequencyLine) {
    return { cardTitle: baseTitle, frequencyLine: slot.frequencyLine }
  }
  const m = slot.displayName.match(/\(([^)]+)\)\s*$/)
  if (m) {
    const inner = m[1].trim()
    const freq = /^fm\b/i.test(inner) ? inner : `FM ${inner}`
    return { cardTitle: baseTitle, frequencyLine: freq }
  }
  return { cardTitle: baseTitle, frequencyLine: "FM" }
}

/** Radio Browser UZ ro‘yxatidagi aniq nom -> displayName */
export const UZ_RADIO_POOL_EXACT_NAMES: Record<string, string> = {
  "Oriat FM": "Oriat FM (100.5)",
  "Radio O'zbegim Taronasi": "O'zbegim taronasi",
  "Radio Markaz": "Radio Markaz",
  "A'LO FM": "A'LO FM",
  "Radio Tabassum": "Radio Tabassum",
  "Qalbim navosi": "Qalbim navosi",
}

/** Tartib: faqat O‘zbekiston manbali kanallar */
export const UZ_RADIO_CURATED_SLOTS: CuratedRadioSlot[] = [
  {
    displayName: "Oriat Dono (106.5)",
    frequencyLine: "FM 106.5",
    include: ["oriat dono"],
    exclude: ["100.5", "fm oriat"],
  },
  {
    displayName: "Oriat FM (100.5)",
    cardTitle: "Oriat",
    frequencyLine: "FM 100.5",
    include: ["oriat fm", "oriatfm"],
    exclude: ["dono", "106.5"],
  },
  { displayName: "O'zbegim taronasi", include: ["ozbegim taronasi", "ozbegim"] },
  {
    displayName: "Yoshlar",
    frequencyLine: "FM 104.0",
    include: ["yoshlar"],
    exclude: ["quran", "islam"],
  },
  { displayName: "HitFm", include: ["hit fm", "hitfm"] },
  { displayName: "A'LO FM", include: ["alo fm", "alofm"] },
  { displayName: "Radio Markaz", include: ["radio markaz", "markaz"] },
  {
    displayName: "Qalbim navosi",
    include: ["qalbim navosi", "qalbim"],
    exclude: ["alo_low", "tabassum"],
  },
  { displayName: "Radio Tabassum", include: ["tabassum"] },
  { displayName: "Islom.uz", include: ["islom.uz", "islom uz"] },
]
