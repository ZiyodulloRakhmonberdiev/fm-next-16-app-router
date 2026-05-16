import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

/**
 * FAQAT non-HLS (icecast/mp3/aac) HTTP oqimlari uchun: HTTPS saytda aralash kontentni aylanib o‘tadi.
 * HLS (.m3u8) relay qilinmaydi — segmentlar boshqa domenlarga ketadi.
 */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url")
  if (!raw || raw.length > 2048) {
    return new NextResponse("Bad request", { status: 400 })
  }

  let target: URL
  try {
    target = new URL(raw)
  } catch {
    return new NextResponse("Invalid url", { status: 400 })
  }

  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return new NextResponse("Invalid protocol", { status: 400 })
  }

  const path = target.pathname.toLowerCase()
  if (path.includes(".m3u8")) {
    return new NextResponse("Use direct HLS url in browser", { status: 400 })
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: {
        "User-Agent": "FerganaMediaRadio/1.0",
        "Icy-Metadata": "1",
      },
      redirect: "follow",
    })

    if (!upstream.ok || !upstream.body) {
      return new NextResponse("Upstream error", { status: 502 })
    }

    const ct = upstream.headers.get("content-type") || "audio/mpeg"
    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": ct,
        "Cache-Control": "no-store",
      },
    })
  } catch {
    return new NextResponse("Relay failed", { status: 502 })
  }
}
