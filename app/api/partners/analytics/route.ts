import { NextResponse } from "next/server"
import { getPartnersAnalytics } from "@/shared/server/partners-analytics"

export async function GET() {
  try {
    const data = await getPartnersAnalytics(30, 10)
    return NextResponse.json({ ok: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch partners analytics"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
