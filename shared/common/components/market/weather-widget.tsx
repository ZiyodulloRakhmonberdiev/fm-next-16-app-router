"use client"

import * as React from "react"
import { useLocale } from "next-intl"
import type { AppLocale } from "@/shared/common/lib/locale-api"
import { UZBEK_REGIONS, type UzbekRegionKey } from "@/shared/common/lib/uzbekistan-regions"
import { getWeatherIconByCode } from "./weather-icon"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/common/components/ui/select"

type WeatherPayload = {
  region: UzbekRegionKey
  temperatureC: number
  weatherCode: number
}

const STORAGE_KEY = "fm:selected-weather-region"

export function WeatherWidget({ compact = false }: { compact?: boolean }) {
  const locale = useLocale() as AppLocale
  const [selected, setSelected] = React.useState<UzbekRegionKey>("fargona")
  const [data, setData] = React.useState<WeatherPayload | null>(null)

  React.useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as UzbekRegionKey | null
    if (saved && UZBEK_REGIONS.some((r) => r.key === saved)) setSelected(saved)
  }, [])

  React.useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, selected)
    let cancelled = false
    void fetch(`/api/market/weather?region=${selected}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled && json) setData(json as WeatherPayload)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [selected])

  const selectedRegion = UZBEK_REGIONS.find((r) => r.key === selected) ?? UZBEK_REGIONS[0]
  const temp = Math.round(data?.temperatureC ?? 0)
  const weatherCode = Number(data?.weatherCode ?? 0)
  const icon = getWeatherIconByCode(weatherCode)
  const iconColor = weatherCode === 0 ? "text-amber-500" : "text-foreground/80"

  return (
    <div className="inline-flex items-center gap-2 text-sm">
      <span className={`inline-flex size-8 items-center justify-center ${iconColor}`}>{icon}</span>
      <span className="font-medium">{temp}°C</span>
      <Select value={selected} onValueChange={(v) => setSelected(v as UzbekRegionKey)}>
        <SelectTrigger
          size="sm"
          className={
            compact
              ? "h-7 w-auto justify-start gap-1 border-none px-0 py-0 shadow-none [&>svg]:ml-0 [&>svg]:opacity-60"
              : "h-8 w-auto justify-start gap-1 border-none px-0 py-0 shadow-none [&>svg]:ml-0 [&>svg]:opacity-60"
          }
        >
          <SelectValue>{selectedRegion.name[locale]}</SelectValue>
        </SelectTrigger>
        <SelectContent
          align="start"
          className="max-h-64 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {UZBEK_REGIONS.map((r) => (
            <SelectItem key={r.key} value={r.key}>
              {r.name[locale]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
