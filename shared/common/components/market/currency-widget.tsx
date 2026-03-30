"use client"

import * as React from "react"
import { useLocale } from "next-intl"
import type { AppLocale } from "@/shared/common/lib/locale-api"

type CurrencyPayload = {
  rates: {
    USD: { value: number; diff: number }
    EUR: { value: number; diff: number }
    RUB: { value: number; diff: number }
  }
}

function formatMoneyNoComma(value: number): string {
  const abs = Math.abs(value)
  const fixed = abs.toFixed(2)
  const [intPart, decPart] = fixed.split(".")
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return `${grouped}.${decPart}`
}

function formatDiff(value: number): string {
  if (value < 0) return `-${formatMoneyNoComma(Math.abs(value))}`
  return formatMoneyNoComma(value)
}

export function CurrencyWidget({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const locale = useLocale() as AppLocale
  const [data, setData] = React.useState<CurrencyPayload | null>(null)

  React.useEffect(() => {
    let cancelled = false
    void fetch("/api/market/currency")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled && json) setData(json as CurrencyPayload)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const wordByLocale: Record<AppLocale, string> = {
    uz: "Kurs UZS:",
    uzb: "Курс UZS:",
    ru: "Курс UZS:",
    en: "Rate UZS:",
  }
  const label = wordByLocale[locale]
  const usd = data?.rates.USD ?? { value: 0, diff: 0 }
  const eur = data?.rates.EUR ?? { value: 0, diff: 0 }
  const rub = data?.rates.RUB ?? { value: 0, diff: 0 }

  const rows = [
    { code: "USD", item: usd },
    { code: "EUR", item: eur },
    { code: "RUB", item: rub },
  ]

  if (variant === "desktop") {
    return (
      <div className="flex items-center gap-4 text-[12px] leading-none">
        <span className="font-medium text-foreground/80">{label}</span>
        {rows.map(({ code, item }) => (
          <div key={code} className="flex items-center gap-2">
            <span className="font-semibold">{code}</span>
            <span className="tabular-nums">{formatMoneyNoComma(item.value)}</span>
            <span className={`text-[10px] ${item.diff >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {formatDiff(item.diff)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full text-[11px] leading-tight mb-2">
      <div className="flex flex-col gap-3">
        {rows.map(({ code, item }) => (
          <div key={code} className="w-full flex items-center justify-between gap-5">
            <span className="font-semibold tracking-wide text-[12px]">{code}</span>
            <div className="flex items-center gap-3">
              <span className="tabular-nums font-semibold text-[12px]">{formatMoneyNoComma(item.value)}</span>
              <span className={`text-[12px] font-semibold ${item.diff >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {formatDiff(item.diff)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
