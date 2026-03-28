import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth-options'

export async function protectPublicApi(req: NextRequest) {
  // 1. Sessiya (Avtorizatsiya) mavjudligini tekshiramiz
  const session = await getServerSession(authOptions)
  if (session?.user) {
    return null // Saytga kirgan har qanday (admin/user) bemalol foydalana oladi
  }

  // 2. Saytning (Browser) o'zidan qilinayotgan murojaatlarni tekshiramiz
  const referer = req.headers.get('referer') || ''
  const host = req.headers.get('host') || ''
  const secFetchSite = req.headers.get('sec-fetch-site')
  const userAgent = req.headers.get('user-agent')?.toLowerCase() || ''

  if (secFetchSite === 'same-origin' || secFetchSite === 'same-site') {
    return null
  }

  if (referer && host && referer.includes(host)) {
    return null
  }

  // 3. Server Component'lar (`fetch` orqali) orqa fonda qiladigan so'rovlarni o'tkazish
  if (userAgent.includes('node') || userAgent.includes('undici') || userAgent.includes('next.js')) {
    return null
  }

  // 4. Qolgan (Postman, tashqi Dasturlar, Bots) so'rovlarni taqiqlash
  return NextResponse.json(
    { error: "Taqiqlangan. Ushbu API'ga faqat avtorizatsiyadan o'tganlar yoki saytning o'zi orqaligina ulanish mumkin." },
    { status: 403 }
  )
}
