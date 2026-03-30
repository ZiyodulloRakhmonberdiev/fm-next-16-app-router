import { NextRequest } from "next/server"
import { getRegionByKey } from "@/shared/common/lib/uzbekistan-regions"

type WeatherApiResponse = {
  current?: {
    temperature_2m?: number
    weather_code?: number
  }
}

export async function GET(req: NextRequest) {
  const regionKey = req.nextUrl.searchParams.get("region") ?? "fargona"
  const region = getRegionByKey(regionKey)
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${region.lat}` +
    `&longitude=${region.lon}&current=temperature_2m,weather_code&timezone=Asia%2FTashkent`

  const res = await fetch(url, { next: { revalidate: 1800 } })
  if (!res.ok) {
    return Response.json({ error: "Weather fetch failed" }, { status: 502 })
  }
  const json = (await res.json()) as WeatherApiResponse

  return Response.json({
    region: region.key,
    temperatureC: Number(json.current?.temperature_2m ?? 0),
    weatherCode: Number(json.current?.weather_code ?? 0),
    updatedAt: Date.now(),
  })
}
