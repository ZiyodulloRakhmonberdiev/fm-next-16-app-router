type CbuRow = {
  Ccy?: string
  Rate?: string
  Diff?: string
}

function toNumber(v: unknown): number {
  const n = Number(String(v ?? "").replace(",", "."))
  return Number.isFinite(n) ? n : 0
}

export async function GET() {
  const res = await fetch("https://cbu.uz/uz/arkhiv-kursov-valyut/json/", {
    next: { revalidate: 300 },
  })
  if (!res.ok) {
    return Response.json({ error: "Currency fetch failed" }, { status: 502 })
  }
  const json = (await res.json()) as CbuRow[]
  const pick = (ccy: string) => json.find((r) => r.Ccy === ccy)
  const usd = pick("USD")
  const eur = pick("EUR")
  const rub = pick("RUB")

  return Response.json({
    base: "UZS",
    updatedAt: Date.now(),
    rates: {
      USD: { value: toNumber(usd?.Rate), diff: toNumber(usd?.Diff) },
      EUR: { value: toNumber(eur?.Rate), diff: toNumber(eur?.Diff) },
      RUB: { value: toNumber(rub?.Rate), diff: toNumber(rub?.Diff) },
    },
  })
}
