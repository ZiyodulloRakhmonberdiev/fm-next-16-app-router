"use client"

import { useMemo, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { toast } from "sonner"
import { BadgeCheck, Clock3, Headphones, Loader2, Mail, MessageCircle } from "lucide-react"
import { Button } from "@/shared/common/components/ui/button"
import { Input } from "@/shared/common/components/ui/input"
import { Label } from "@/shared/common/components/ui/label"
import { Textarea } from "@/shared/common/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/common/components/ui/select"
import { usePublicSiteSettingsQuery } from "@/shared/common/lib/public-site-settings-query"
import { seed } from "@/scripts/seed"
import { getSocialStyle } from "@/shared/common/components/ui/social-platform-styles"
import { Link } from "@/i18n/navigation"

const DIAL_CODES = ["+998", "+7", "+971", "+1", "+44", "+90", "+49"] as const

export function ContactPageClient() {
  const t = useTranslations("contactPage")
  const locale = useLocale()
  const { data: settings } = usePublicSiteSettingsQuery()
  const email = settings?.siteConfig.email ?? seed.siteConfig.email
  const phone = settings?.siteConfig.phone ?? seed.siteConfig.phone

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [emailField, setEmailField] = useState("")
  const [dial, setDial] = useState<string>("+998")
  const [phoneLocal, setPhoneLocal] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const socialLinks = settings?.socialMedia?.length ? settings.socialMedia : seed.socialMedia
  const waDigits = useMemo(() => phone.replace(/\D/g, ""), [phone])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName.trim() || !emailField.trim() || !message.trim()) {
      toast.error(t("required_error"))
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: emailField,
          phoneCode: dial,
          phoneNumber: phoneLocal,
          message,
          locale,
        }),
      })
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string; telegramStatus?: "sent" | "failed" }
        | null

      if (!res.ok || !json?.ok) {
        toast.error(t("submit_error"))
        return
      }

      setFirstName("")
      setLastName("")
      setEmailField("")
      setDial("+998")
      setPhoneLocal("")
      setMessage("")

      toast.success(
        json.telegramStatus === "failed" ? t("submit_warning") : t("submit_success")
      )
    } catch {
      toast.error(t("submit_error"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[60vh] bg-linear-to-b from-brand/5 via-background to-background py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="inline-flex rounded-full bg-brand px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
            {t("page_title")}
          </span>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            {t("form_title")}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("form_subtitle")}
          </p>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-brand/15 bg-white/80 p-4 shadow-sm backdrop-blur dark:bg-card/80">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-brand/10 p-2 text-brand">
                <Headphones className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{t("hotline_label")}</p>
                <p className="text-sm text-muted-foreground">{phone}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-brand/15 bg-white/80 p-4 shadow-sm backdrop-blur dark:bg-card/80">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-brand/10 p-2 text-brand">
                <Clock3 className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{t("response_title")}</p>
                <p className="text-sm text-muted-foreground">{t("response_value")}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-brand/15 bg-white/80 p-4 shadow-sm backdrop-blur dark:bg-card/80">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-brand/10 p-2 text-brand">
                <BadgeCheck className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{t("support_title")}</p>
                <p className="text-sm text-muted-foreground">{t("support_value")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_360px] lg:items-start">
          <section className="rounded-[28px] border border-brand/10 bg-white p-6 shadow-[0_20px_60px_-30px_rgba(209,0,28,0.35)] dark:bg-card md:p-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t("first_name")}</Label>
                  <Input
                    id="firstName"
                    required
                    placeholder={t("placeholder_first_name")}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    className="border-brand/15 focus-visible:ring-brand/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t("last_name")}</Label>
                  <Input
                    id="lastName"
                    placeholder={t("placeholder_last_name")}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                    className="border-brand/15 focus-visible:ring-brand/20"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input
                    id="email"
                    required
                    type="email"
                    placeholder={t("placeholder_email")}
                    value={emailField}
                    onChange={(e) => setEmailField(e.target.value)}
                    autoComplete="email"
                    className="border-brand/15 focus-visible:ring-brand/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("contact_details")}</Label>
                  <div className="flex gap-2">
                    <Select value={dial} onValueChange={setDial}>
                      <SelectTrigger className="w-[104px] shrink-0 border-brand/15">
                        <SelectValue placeholder={t("dial_placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {DIAL_CODES.map((code) => (
                          <SelectItem key={code} value={code}>
                            {code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder={t("placeholder_phone")}
                      value={phoneLocal}
                      onChange={(e) => setPhoneLocal(e.target.value)}
                      autoComplete="tel"
                      className="min-w-0 flex-1 border-brand/15 focus-visible:ring-brand/20"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">{t("message")}</Label>
                <Textarea
                  id="message"
                  required
                  placeholder={t("placeholder_message")}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={7}
                  className="min-h-[160px] resize-y border-brand/15 focus-visible:ring-brand/20"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-brand px-8 text-white hover:bg-brand/90"
                >
                  {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                  {submitting ? t("sending") : t("submit")}
                </Button>
              </div>
            </form>
          </section>

          <aside className="rounded-[28px] bg-linear-to-br from-[#121212] via-[#1d1d1d] to-brand p-6 text-white shadow-[0_25px_70px_-35px_rgba(0,0,0,0.65)] md:p-8 lg:sticky lg:top-24">
            <p className="max-w-xs text-lg font-semibold leading-snug">{t("card_greeting")}</p>

            <ul className="mt-6 space-y-3">
              <li>
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 transition hover:bg-white/15"
                >
                  <span className="mt-0.5 shrink-0 rounded-xl bg-white/10 p-2.5 text-brand">
                    <Headphones className="size-5" aria-hidden />
                  </span>
                  <span className="text-sm leading-snug">
                    <span className="mb-1 block text-white/70">{t("hotline_label")}</span>
                    {phone}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={waDigits ? `https://wa.me/${waDigits}` : "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 transition hover:bg-white/15"
                >
                  <span className="mt-0.5 shrink-0 rounded-xl bg-white/10 p-2.5 text-brand">
                    <MessageCircle className="size-5" aria-hidden />
                  </span>
                  <span className="text-sm leading-snug">
                    <span className="mb-1 block text-white/70">{t("sms_whatsapp_label")}</span>
                    {phone}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 transition hover:bg-white/15"
                >
                  <span className="mt-0.5 shrink-0 rounded-xl bg-white/10 p-2.5 text-brand">
                    <Mail className="size-5" aria-hidden />
                  </span>
                  <span className="text-sm leading-snug break-all">
                    <span className="mb-1 block text-white/70">{t("email_label")}</span>
                    {email}
                  </span>
                </a>
              </li>
            </ul>

            <div className="mt-8 border-t border-white/15 pt-6">
              <p className="text-sm font-semibold">{t("connect_title")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {socialLinks.map(({ slug, name, href }) => {
                  const style = getSocialStyle(slug)
                  const isExternal = href.startsWith("http")
                  return (
                    <Link
                      key={slug}
                      href={href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:-translate-y-0.5 hover:bg-white/20"
                      aria-label={typeof name === "string" ? name : slug}
                    >
                      {style.icon ?? <span className="text-xs font-medium">{slug.slice(0, 2)}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
