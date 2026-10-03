import { setPageLocale, type LocalePageProps } from "@/i18n/set-page-locale"
import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import type { AppLocale } from "@/shared/common/lib/locale-api"
import ClientSiteNothingGate from "../_components/client-site-nothing-gate"
import ClientServerOffGate from "../_components/client-server-off-gate"
import { Footer } from "@/widgets/client-footer"
import { ClientSidebar } from "@/widgets/client-sidebar"
import { Header } from "@/widgets/client-header"
import { getPartnersAnalytics } from "@/shared/server/partners-analytics"

const PAGE_TEXT: Record<
  AppLocale,
  {
    title: string
    subtitle: string
    analyticsTitle: string
    sessionsLabel: string
    pageViewsLabel: string
    activeUsersLabel: string
    topPagesTitle: string
    pagePathLabel: string
    demographicTitle: string
    socialTitle: string
    formatsTitle: string
    desktopBannerTitle: string
    desktopBannerDescription: string
    desktopPreviewLabel: string
    mobileBannerTitle: string
    mobileBannerDescription: string
    mobilePreviewLabel: string
    projectsTitle: string
    mediaKitTitle: string
    contactTitle: string
    contactHint: string
    cta: string
  }
> = {
  uz: {
    title: "Hamkorlik",
    subtitle: "Brendingizni Fergana Media auditoriyasiga samarali yetkazish uchun reklama imkoniyatlari.",
    analyticsTitle: "Google Analytics ko'rsatkichlari",
    sessionsLabel: "Sessiyalar (30 kun)",
    pageViewsLabel: "Sahifa ko'rishlar (30 kun)",
    activeUsersLabel: "Faol foydalanuvchilar (30 kun)",
    topPagesTitle: "Eng ko'p ko'rilgan sahifalar",
    pagePathLabel: "Sahifa yo'li",
    demographicTitle: "Auditoriya demografiyasi",
    socialTitle: "Ijtimoiy tarmoqlar",
    formatsTitle: "Reklama formatlari",
    desktopBannerTitle: "Desktop banner",
    desktopBannerDescription:
      "Veb-saytning ish stoli sahifalari uchun mo'ljallangan banner joylashuvi yirik ekranlarda keng ko'rinish beradi. Ushbu format foydalanuvchi diqqatini birinchi soniyalarda jalb qilib, brend xabarini katta auditoriyaga aniq yetkazishga xizmat qiladi.",
    desktopPreviewLabel: "Desktop ko'rinishi",
    mobileBannerTitle: "Mobil banner",
    mobileBannerDescription:
      "Mobil veb-sayt va ilova formati kichik ekranlar va foydalanuvchilar uchun qulay muloqot uchun optimallashtirilgan. Bu sizga mobil auditoriyangiz bilan samarali muloqot qilish va ularning e'tiborini taklifingizga qaratish imkonini beradi.",
    mobilePreviewLabel: "Mobil ko'rinishi",
    projectsTitle: "Maxsus loyihalar",
    mediaKitTitle: "Media kit va prays",
    contactTitle: "Biz bilan aloqa",
    contactHint: "Reklama bo'yicha savollaringiz bo'lsa, biz bilan bog'laning.",
    cta: "Bog'lanish",
  },
  uzb: {
    title: "Ҳамкорлик",
    subtitle: "Брендингиз учун Fergana Media аудиториясига самарали реклама имкониятлари.",
    analyticsTitle: "Google Analytics кўрсаткичлари",
    sessionsLabel: "Сессиялар (30 кун)",
    pageViewsLabel: "Саҳифа кўришлар (30 кун)",
    activeUsersLabel: "Фаол фойдаланувчилар (30 кун)",
    topPagesTitle: "Энг кўп кўрилган саҳифалар",
    pagePathLabel: "Саҳифа йўли",
    demographicTitle: "Аудитория демографияси",
    socialTitle: "Ижтимоий тармоқлар",
    formatsTitle: "Реклама форматлари",
    desktopBannerTitle: "Desktop баннер",
    desktopBannerDescription:
      "Веб-сайтнинг иш столи версияси учун мосланган баннер жойлашуви катта экранларда кенг ва аниқ кўриниш беради. Ушбу формат фойдаланувчи эътиборини тез жалб қилиб, бренд хабарини катта аудиторияга самарали етказади.",
    desktopPreviewLabel: "Desktop кўриниши",
    mobileBannerTitle: "Мобил баннер",
    mobileBannerDescription:
      "Мобил веб-сайт ва илова формати кичик екранлар ва фойдаланувчилар учун қулай мулоқот учун оптималлаштирилган. Бу сизга мобил аудиториянгиз билан самарали мулоқот қилиш ва уларнинг е'тиборини таклифингизга қаратиш имконини беради.",
    mobilePreviewLabel: "Мобил кўриниши",
    projectsTitle: "Махсус лойиҳалар",
    mediaKitTitle: "Media kit ва прейс",
    contactTitle: "Биз билан алоқа",
    contactHint: "Реклама бўйича саволларингиз бўлса, биз билан боғланинг.",
    cta: "Боғланиш",
  },
  ru: {
    title: "Сотрудничество",
    subtitle: "Рекламные возможности для эффективного продвижения бренда в аудитории Fergana Media.",
    analyticsTitle: "Показатели Google Analytics",
    sessionsLabel: "Сеансы (30 дней)",
    pageViewsLabel: "Просмотры страниц (30 дней)",
    activeUsersLabel: "Активные пользователи (30 дней)",
    topPagesTitle: "Самые просматриваемые страницы",
    pagePathLabel: "Путь страницы",
    demographicTitle: "Демография аудитории",
    socialTitle: "Социальные сети",
    formatsTitle: "Рекламные форматы",
    desktopBannerTitle: "Desktop баннер",
    desktopBannerDescription:
      "Баннерный формат для десктопной версии сайта обеспечивает заметное присутствие на широких экранах. Такой блок помогает быстро привлечь внимание пользователя и донести рекламное сообщение до большой аудитории.",
    desktopPreviewLabel: "Десктопный вид",
    mobileBannerTitle: "Мобильный баннер",
    mobileBannerDescription:
      "Формат для мобильного сайта и приложения оптимизирован под небольшие экраны и удобное взаимодействие. Он позволяет эффективно коммуницировать с мобильной аудиторией и удерживать внимание к вашему предложению.",
    mobilePreviewLabel: "Мобильный вид",
    projectsTitle: "Спецпроекты",
    mediaKitTitle: "Медиа-кит и прайс",
    contactTitle: "Связаться с нами",
    contactHint: "По вопросам рекламы свяжитесь с нашей командой.",
    cta: "Связаться",
  },
  en: {
    title: "Partnership",
    subtitle: "Advertising opportunities to promote your brand across the Fergana Media audience.",
    analyticsTitle: "Google Analytics Metrics",
    sessionsLabel: "Sessions (30 days)",
    pageViewsLabel: "Page views (30 days)",
    activeUsersLabel: "Active users (30 days)",
    topPagesTitle: "Top pages",
    pagePathLabel: "Page path",
    demographicTitle: "Audience Demographics",
    socialTitle: "Social Media Reach",
    formatsTitle: "Ad Formats",
    desktopBannerTitle: "Desktop banner",
    desktopBannerDescription:
      "This desktop-focused banner placement is designed for strong visibility on larger screens. It helps capture attention early and delivers your brand message to a broad audience in a clear, high-impact way.",
    desktopPreviewLabel: "Desktop preview",
    mobileBannerTitle: "Mobile banner",
    mobileBannerDescription:
      "This mobile-friendly banner format is tailored for compact screens in both the website and app. It is optimized for readability and interaction, making it effective for reaching users on the go.",
    mobilePreviewLabel: "Mobile preview",
    projectsTitle: "Special Projects",
    mediaKitTitle: "Media Kit and Pricing",
    contactTitle: "Contact Us",
    contactHint: "Reach out to our team for advertising inquiries.",
    cta: "Contact",
  },
}

type Stat = { label: string; value: string }

const SOCIAL: Stat[] = [
  { label: "Instagram", value: "4,400+" },
  { label: "YouTube", value: "117,000+" },
  { label: "Facebook", value: "850+" },
  { label: "Telegram", value: "4,300+" },
]

const DEMOGRAPHY_GENDER = [
  { label: "Erkaklar / Men", value: 57.5 },
  { label: "Ayollar / Women", value: 42.5 },
]

const DEMOGRAPHY_AGE = [
  { label: "18-24", value: 25.52 },
  { label: "25-34", value: 25.1 },
  { label: "35-44", value: 23.2 },
  { label: "45-54", value: 12.1 },
  { label: "55-64", value: 8.62 },
  { label: "65+", value: 5.46 },
]

const SPECIAL_PROJECTS = [
  "Intervyu",
  "Podkast",
  "Videoreportaj",
  "Ijtimoiy tarmoqlarda postlar",
  "Dizayn va infografika",
  "PR-maqola",
]

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  setPageLocale((await params).locale)
  const locale = (await getLocale()) as AppLocale
  const text = PAGE_TEXT[locale] ?? PAGE_TEXT.uz
  return { title: text.title }
}

export default async function HamkorlikPage({ params }: LocalePageProps) {
  setPageLocale((await params).locale)
  const locale = (await getLocale()) as AppLocale
  const text = PAGE_TEXT[locale] ?? PAGE_TEXT.uz
  let analyticsData: Awaited<ReturnType<typeof getPartnersAnalytics>> | null = null
  let analyticsError = ""

  try {
    analyticsData = await getPartnersAnalytics(30, 10)
  } catch (error) {
    analyticsError = error instanceof Error ? error.message : "Analytics data unavailable"
  }

  const formatNumber = (value: number) => new Intl.NumberFormat(locale).format(value)
  const analyticsStats: Stat[] = analyticsData
    ? [
      { label: text.sessionsLabel, value: formatNumber(analyticsData.summary.sessions) },
      { label: text.pageViewsLabel, value: formatNumber(analyticsData.summary.pageViews) },
      { label: text.activeUsersLabel, value: formatNumber(analyticsData.summary.activeUsers) },
    ]
    : []

  return (
    <ClientSiteNothingGate>
      <div className="block md:hidden">
        <ClientSidebar />
      </div>
      <div className="flex w-full flex-1 flex-col">
        <Header />
        <main className="flex-1">
          <ClientServerOffGate model="news">
            <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
              <section className="mb-6 rounded-sm border bg-background p-4 md:p-6">
                <h1 className="text-2xl font-bold md:text-3xl">{text.title}</h1>
                <p className="mt-2 text-muted-foreground">{text.subtitle}</p>
              </section>

              {/* <section className="mb-6 rounded-sm border bg-background p-4 md:p-6">
                <h2 className="mb-4 text-xl font-semibold">{text.analyticsTitle}</h2>
                {analyticsData ? (
                  <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {analyticsStats.map((item) => (
                        <div key={item.label} className="rounded-sm border bg-muted/30 p-4">
                          <p className="text-sm text-muted-foreground">{item.label}</p>
                          <p className="mt-1 text-2xl font-semibold">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 rounded-sm border overflow-x-auto">
                      <h3 className="border-b px-4 py-3 text-sm font-semibold">{text.topPagesTitle}</h3>
                      <table className="w-full min-w-[460px] text-sm">
                        <thead className="bg-muted/40 text-left">
                          <tr>
                            <th className="px-4 py-2 font-medium">{text.pagePathLabel}</th>
                            <th className="px-4 py-2 font-medium">{text.pageViewsLabel}</th>
                            <th className="px-4 py-2 font-medium">{text.sessionsLabel}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analyticsData.topPages.map((row) => (
                            <tr key={row.path} className="border-t">
                              <td className="px-4 py-2">{row.path}</td>
                              <td className="px-4 py-2">{formatNumber(row.pageViews)}</td>
                              <td className="px-4 py-2">{formatNumber(row.sessions)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="rounded-sm border bg-muted/30 p-4 text-sm text-muted-foreground">
                    Google Analytics ma&apos;lumotlari vaqtincha mavjud emas.
                    {analyticsError ? <span className="ml-2">({analyticsError})</span> : null}
                  </div>
                )}
              </section> */}

              {/* <section className="mb-6 rounded-sm border bg-background p-4 md:p-6">
                <h2 className="mb-4 text-xl font-semibold">{text.demographicTitle}</h2>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="space-y-3">
                    {DEMOGRAPHY_GENDER.map((item) => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{item.label}</span>
                          <span>{item.value}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div className="h-2 rounded-full bg-primary" style={{ width: `${item.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {DEMOGRAPHY_AGE.map((item) => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{item.label}</span>
                          <span>{item.value}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${item.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section> */}

              {/* <section className="mb-6 rounded-sm border bg-background p-4 md:p-6">
                <h2 className="mb-4 text-xl font-semibold">{text.socialTitle}</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {SOCIAL.map((item) => (
                    <div key={item.label} className="rounded-sm border bg-background p-3">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-lg font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </section> */}

              <section className="mb-6 rounded-sm border bg-background p-4 md:p-6">
                <h2 className="mb-4 text-xl font-semibold">{text.formatsTitle}</h2>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <article className="rounded-sm border bg-muted/30 p-4">
                    <h3 className="font-semibold">{text.desktopBannerTitle}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {text.desktopBannerDescription}
                    </p>
                    <p className="mt-2 text-sm font-medium">O'lcham: 1300x200 px</p>
                    <div className="mt-4 rounded-sm border bg-background p-3">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">{text.desktopPreviewLabel}</p>
                      <div className="overflow-hidden rounded-sm border bg-card">
                        <div className="flex items-center justify-between border-b bg-muted/50 px-3 py-2 text-[10px] text-muted-foreground">
                          <span>ferganamedia.uz</span>
                          <span>Desktop</span>
                        </div>
                        <div className="space-y-3 p-3">
                          <div className="h-10 rounded-sm bg-brand/80" />
                          <div className="h-20 rounded-sm bg-foreground/10" />
                          <div className="grid grid-cols-3 gap-2">
                            <div className="h-12 rounded-sm bg-foreground/10" />
                            <div className="h-12 rounded-sm bg-foreground/10" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                  <article className="rounded-sm border bg-muted/30 p-4">
                    <h3 className="font-semibold">{text.mobileBannerTitle}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {text.mobileBannerDescription}
                    </p>
                    <p className="mt-2 text-sm font-medium">O'lcham: 375x185 px</p>
                    <div className="mt-4 rounded-sm border bg-background p-3">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">{text.mobilePreviewLabel}</p>
                      <div className="mx-auto w-[190px] overflow-hidden rounded-[18px] border bg-card p-2">
                        <div className="mb-2 h-1.5 w-12 mx-auto rounded-full bg-muted-foreground/30" />
                        <div className="space-y-2 rounded-[12px] border bg-background p-2">
                          <div className="h-8 rounded-sm bg-brand/80" />
                          <div className="h-14 rounded-sm bg-foreground/10" />
                          <div className="h-14 rounded-sm bg-foreground/10" />
                          <div className="grid grid-cols-2 gap-2">
                            <div className="h-10 rounded-sm bg-foreground/10" />
                            <div className="h-10 rounded-sm bg-foreground/10" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </section>

              {/* <section className="mb-6 rounded-sm border bg-background p-4 md:p-6">
                <h2 className="mb-4 text-xl font-semibold">{text.projectsTitle}</h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {SPECIAL_PROJECTS.map((item) => (
                    <article key={item} className="rounded-sm border bg-muted/30 p-4">
                      <h3 className="font-semibold">{item}</h3>
                    </article>
                  ))}
                </div>
              </section> */}

              {/* <section className="mb-6 rounded-sm border bg-background p-4 md:p-6">
                <h2 className="mb-4 text-xl font-semibold">{text.mediaKitTitle}</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <article className="rounded-sm border bg-muted/30 p-4">
                    <h3 className="font-semibold">Media Kit</h3>
                    <p className="mt-2 text-sm text-muted-foreground">PDF 1.46 MB</p>
                    <button type="button" className="mt-3 rounded-sm border px-3 py-1.5 text-sm hover:bg-muted">
                      Yuklab olish
                    </button>
                  </article>
                  <article className="rounded-sm border bg-muted/30 p-4">
                    <h3 className="font-semibold">Prays</h3>
                    <p className="mt-2 text-sm text-muted-foreground">PDF 457 KB</p>
                    <button type="button" className="mt-3 rounded-sm border px-3 py-1.5 text-sm hover:bg-muted">
                      Yuklab olish
                    </button>
                  </article>
                </div>
              </section> */}

              <section className="rounded-sm border bg-background p-4 md:p-6">
                <h2 className="text-xl font-semibold">{text.contactTitle}</h2>
                <p className="mt-2 text-muted-foreground">{text.contactHint}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <a href="tel:+998916770550" className="rounded-sm border px-4 py-2 text-sm font-medium hover:bg-muted">
                    +998 91 677 05 50
                  </a>
                  <a href="mailto:farmaxt@gmail.com" className="rounded-sm border px-4 py-2 text-sm font-medium hover:bg-muted">
                    farmaxt@gmail.com
                  </a>
                  <a href="/contact" className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                    {text.cta}
                  </a>
                </div>
              </section>
            </div>
          </ClientServerOffGate>
        </main>
        <Footer />
      </div>
    </ClientSiteNothingGate>
  )
}
