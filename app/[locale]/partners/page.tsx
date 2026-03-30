import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import type { AppLocale } from "@/shared/common/lib/locale-api"
import ClientSiteNothingGate from "../_components/client-site-nothing-gate"
import ClientServerOffGate from "../_components/client-server-off-gate"
import { Footer } from "@/widgets/client-footer"
import { ClientSidebar } from "@/widgets/client-sidebar"
import { Header } from "@/widgets/client-header"

const PAGE_TEXT: Record<
  AppLocale,
  {
    title: string
    subtitle: string
    analyticsTitle: string
    demographicTitle: string
    socialTitle: string
    formatsTitle: string
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
    demographicTitle: "Auditoriya demografiyasi",
    socialTitle: "Ijtimoiy tarmoqlar",
    formatsTitle: "Reklama formatlari",
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
    demographicTitle: "Аудитория демографияси",
    socialTitle: "Ижтимоий тармоқлар",
    formatsTitle: "Реклама форматлари",
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
    demographicTitle: "Демография аудитории",
    socialTitle: "Социальные сети",
    formatsTitle: "Рекламные форматы",
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
    demographicTitle: "Audience Demographics",
    socialTitle: "Social Media Reach",
    formatsTitle: "Ad Formats",
    projectsTitle: "Special Projects",
    mediaKitTitle: "Media Kit and Pricing",
    contactTitle: "Contact Us",
    contactHint: "Reach out to our team for advertising inquiries.",
    cta: "Contact",
  },
}

type Stat = { label: string; value: string }

const STATS: Stat[] = [
  { label: "Oylik tashriflar / Monthly visits", value: "10,600,000" },
  { label: "Oylik sahifa ko'rishlar / Monthly page views", value: "23,400,000" },
  { label: "Kunlik tashriflar / Daily visits", value: "351,000" },
  { label: "Android ilova yuklab olishlar", value: "1,560,000+" },
  { label: "iOS ilova yuklab olishlar", value: "120,000+" },
  { label: "Telegram kuzatuvchilar", value: "1,119,000+" },
]

const SOCIAL: Stat[] = [
  { label: "Instagram", value: "7,200,000+" },
  { label: "YouTube", value: "3,970,000+" },
  { label: "Facebook", value: "788,000+" },
  { label: "Twitter/X", value: "466,700+" },
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

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as AppLocale
  const text = PAGE_TEXT[locale] ?? PAGE_TEXT.uz
  return { title: text.title }
}

export default async function HamkorlikPage() {
  const locale = (await getLocale()) as AppLocale
  const text = PAGE_TEXT[locale] ?? PAGE_TEXT.uz

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

              <section className="mb-6 rounded-sm border bg-background p-4 md:p-6">
                <h2 className="mb-4 text-xl font-semibold">{text.analyticsTitle}</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {STATS.map((item) => (
                    <div key={item.label} className="rounded-sm border bg-muted/30 p-4">
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="mt-1 text-2xl font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mb-6 rounded-sm border bg-background p-4 md:p-6">
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
              </section>

              <section className="mb-6 rounded-sm border bg-background p-4 md:p-6">
                <h2 className="mb-4 text-xl font-semibold">{text.socialTitle}</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {SOCIAL.map((item) => (
                    <div key={item.label} className="rounded-sm border bg-background p-3">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-lg font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mb-6 rounded-sm border bg-background p-4 md:p-6">
                <h2 className="mb-4 text-xl font-semibold">{text.formatsTitle}</h2>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <article className="rounded-sm border bg-muted/30 p-4">
                    <h3 className="font-semibold">Desktop top header banner</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Desktop versiya uchun yuqori banner. Katta ekranlarda maksimal ko'rinish beradi.
                    </p>
                    <p className="mt-2 text-sm font-medium">O'lcham: 1600x200 px</p>
                  </article>
                  <article className="rounded-sm border bg-muted/30 p-4">
                    <h3 className="font-semibold">Mobile top header banner</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Mobil sayt va ilova uchun optimallashtirilgan yuqori banner.
                    </p>
                    <p className="mt-2 text-sm font-medium">O'lcham: 375x185 px</p>
                  </article>
                </div>
              </section>

              <section className="mb-6 rounded-sm border bg-background p-4 md:p-6">
                <h2 className="mb-4 text-xl font-semibold">{text.projectsTitle}</h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {SPECIAL_PROJECTS.map((item) => (
                    <article key={item} className="rounded-sm border bg-muted/30 p-4">
                      <h3 className="font-semibold">{item}</h3>
                    </article>
                  ))}
                </div>
              </section>

              <section className="mb-6 rounded-sm border bg-background p-4 md:p-6">
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
              </section>

              <section className="rounded-sm border bg-background p-4 md:p-6">
                <h2 className="text-xl font-semibold">{text.contactTitle}</h2>
                <p className="mt-2 text-muted-foreground">{text.contactHint}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <a href="tel:+998781137733" className="rounded-sm border px-4 py-2 text-sm font-medium hover:bg-muted">
                    +998 78 113 77 33
                  </a>
                  <a href="mailto:info@ferganamedia.uz" className="rounded-sm border px-4 py-2 text-sm font-medium hover:bg-muted">
                    info@ferganamedia.uz
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
