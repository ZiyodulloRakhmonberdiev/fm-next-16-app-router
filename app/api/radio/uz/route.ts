import { NextResponse } from "next/server"
import type { UzRadioStationDTO } from "@/features/radio/model/uz-radio-types"
import {
  stationMatchesCuratedSlot,
  UZ_RADIO_CURATED_SLOTS,
  UZ_RADIO_POOL_EXACT_NAMES,
  radioCardFieldsFromSlot,
  normRadioKey,
  type CuratedRadioSlot,
} from "@/features/radio/model/uz-radio-curated"
import { getStaticRadioStream } from "@/features/radio/model/uz-radio-static-streams"

const RADIO_BROWSER_UZ =
  "https://de1.api.radio-browser.info/json/stations/bycountrycodeexact/UZ"

type RadioBrowserStation = {
  stationuuid?: string
  name?: string
  url?: string
  url_resolved?: string
  favicon?: string
  codec?: string
  bitrate?: number
  lastcheckok?: number
  votes?: number
  countrycode?: string
}

const fetchOpts = {
  headers: { "User-Agent": "FerganaMedia/1.0 (https://ferganamedia.uz)" },
  next: { revalidate: 3600 } as const,
}

function stationKey(s: RadioBrowserStation): string {
  const id = (s.stationuuid || "").trim()
  if (id) return `id:${id}`
  return `url:${(s.url_resolved || s.url || "").slice(0, 160)}`
}

function streamOk(s: RadioBrowserStation): boolean {
  const u = (s.url_resolved || s.url || "").trim()
  if (!/^https?:\/\//i.test(u)) return false
  if (s.lastcheckok === 0) return false
  return s.countrycode === "UZ"
}

function stationRow(
  slot: CuratedRadioSlot,
  data: {
    id: string
    streamUrl: string
    favicon: string | null
    codec?: string
    bitrate?: number
  }
): UzRadioStationDTO {
  const f = radioCardFieldsFromSlot(slot)
  return {
    id: data.id.slice(0, 64),
    name: slot.displayName,
    streamUrl: data.streamUrl,
    favicon: data.favicon,
    cardTitle: f.cardTitle,
    frequencyLine: f.frequencyLine,
    logoSrc: slot.logoSrc ?? null,
    codec: data.codec,
    bitrate: data.bitrate,
  }
}

function fromRadioBrowser(
  slot: CuratedRadioSlot,
  s: RadioBrowserStation
): UzRadioStationDTO | null {
  const streamUrl = (s.url_resolved || s.url || "").trim()
  if (!/^https?:\/\//i.test(streamUrl)) return null
  const fav =
    typeof s.favicon === "string" && s.favicon.startsWith("http") ? s.favicon : null
  return stationRow(slot, {
    id: (s.stationuuid || streamUrl).slice(0, 64),
    streamUrl,
    favicon: fav,
    codec: s.codec,
    bitrate: typeof s.bitrate === "number" ? s.bitrate : undefined,
  })
}

function poolDisplayNameForStation(s: RadioBrowserStation): string | null {
  const name = (s.name || "").trim()
  if (!name) return null
  if (UZ_RADIO_POOL_EXACT_NAMES[name]) return UZ_RADIO_POOL_EXACT_NAMES[name]
  const n = normRadioKey(name)
  for (const [poolName, display] of Object.entries(UZ_RADIO_POOL_EXACT_NAMES)) {
    if (normRadioKey(poolName) === n) return display
  }
  if (n.includes("yoshlar") && n.includes("ovozi")) return "Yoshlar"
  return null
}

function pickFromUzPool(
  slot: CuratedRadioSlot,
  pool: RadioBrowserStation[],
  usedIds: Set<string>
): RadioBrowserStation | null {
  const ok = pool.filter(
    (s) => streamOk(s) && typeof s.name === "string" && !usedIds.has(stationKey(s))
  )

  const exact = ok.filter((s) => poolDisplayNameForStation(s) === slot.displayName)
  if (exact.length) {
    if (slot.displayName === "Qalbim navosi") {
      const preferred = exact.find((s) =>
        (s.url_resolved || s.url || "").includes("qalbimnavosi.uz")
      )
      if (preferred) return preferred
    }
    return [...exact].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))[0] ?? null
  }

  if (!slot.include?.length) return null

  const matched = ok.filter(
    (s) => typeof s.name === "string" && stationMatchesCuratedSlot(s.name, slot)
  )
  if (!matched.length) return null
  return [...matched].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))[0] ?? null
}

export async function GET() {
  try {
    let pool: RadioBrowserStation[] = []
    const poolRes = await fetch(
      `${RADIO_BROWSER_UZ}?hidebroken=true&order=votes&reverse=true&limit=500`,
      fetchOpts
    )
    if (poolRes.ok) {
      const data = (await poolRes.json()) as unknown
      if (Array.isArray(data)) {
        pool = data.filter((s) => (s as RadioBrowserStation).countrycode === "UZ")
      }
    }

    const usedIds = new Set<string>()
    const stations: UzRadioStationDTO[] = []

    for (const slot of UZ_RADIO_CURATED_SLOTS) {
      const manual = getStaticRadioStream(slot.displayName)
      if (manual) {
        stations.push(
          stationRow(slot, {
            id: manual.id,
            streamUrl: manual.streamUrl,
            favicon: manual.favicon ?? null,
          })
        )
        continue
      }

      const hit = pickFromUzPool(slot, pool, usedIds)
      if (!hit) continue

      usedIds.add(stationKey(hit))
      const row = fromRadioBrowser(slot, hit)
      if (row) stations.push(row)
    }

    return NextResponse.json({ stations })
  } catch {
    return NextResponse.json({ stations: [] as UzRadioStationDTO[] })
  }
}
