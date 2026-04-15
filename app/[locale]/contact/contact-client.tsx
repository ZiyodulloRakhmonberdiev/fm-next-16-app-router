"use client"

import { useMemo, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { toast } from "sonner"
import { Headphones, Loader2, Mail } from "lucide-react"
import { Button } from "@/shared/common/components/ui/button"
import { Input } from "@/shared/common/components/ui/input"
import { Label } from "@/shared/common/components/ui/label"
import { Textarea } from "@/shared/common/components/ui/textarea"
import { usePublicSiteSettingsQuery } from "@/shared/server/public-site-settings-query"
import { seed } from "@/scripts/seed"

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
    if (message.length > 1024) {
      toast.error("Xabar 1024 belgidan oshmasligi kerak")
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
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-4 md:mb-10">
          <h1 className="text-xl font-medium tracking-tight text-foreground md:text-4xl mb-6">
            {t("form_title")}
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground font-light leading-relaxed">
            {t("form_subtitle")}
          </p>
        </div>
     
        <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[1fr_400px]">
          {/* Form Section */}
          <section className="space-y-12">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:gap-8 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="hidden md:block text-xs uppercase tracking-widest text-muted-foreground">
                    {t("first_name")}
                  </Label>
                  <Input
                    id="firstName"
                    required
                    placeholder={t("placeholder_first_name")}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="py-3 h-auto"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="lastName" className="hidden md:block text-xs uppercase tracking-widest text-muted-foreground">
                    {t("last_name")}
                  </Label>
                  <Input
                    id="lastName"
                    placeholder={t("placeholder_last_name")}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="py-3 h-auto"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:gap-8 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="email" className="hidden md:block text-xs uppercase tracking-widest text-muted-foreground">
                    {t("email")}
                  </Label>
                  <Input
                    id="email"
                    required
                    type="email"
                    placeholder={t("placeholder_email")}
                    value={emailField}
                    onChange={(e) => setEmailField(e.target.value)}
                    className="py-3 h-auto"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="hidden md:block text-xs uppercase tracking-widest text-muted-foreground">
                    {t("contact_details")}
                  </Label>
                  <div className="flex gap-4">
                    {/* <Select value={dial} onValueChange={setDial}>
                      <SelectTrigger className="w-[80px] py-3 h-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIAL_CODES.map((code) => (
                          <SelectItem key={code} value={code}>
                            {code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select> */}
                    <Input
                      placeholder={t("placeholder_phone")}
                      value={phoneLocal}
                      onChange={(e) => setPhoneLocal(e.target.value)}
                      className="py-3 h-auto"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="message" className="hidden md:block text-xs uppercase tracking-widest text-muted-foreground">
                  {t("message")}
                </Label>
                <div className="relative">
                  <Textarea
                    id="message"
                    required
                    maxLength={1024}
                    placeholder={t("placeholder_message")}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[120px] py-3 h-auto resize-none"
                  />
                  <div className="absolute bottom-2 right-2 text-[10px] uppercase tracking-widest text-muted-foreground/50 py-1">
                    {message.length} / 1024
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-12 h-12 text-sm font-medium tracking-wide transition-all"
                >
                  {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  {submitting ? t("sending") : t("submit")}
                </Button>
              </div>
            </form>
          </section>
          <div className="grid md:hidden text-muted-foreground gap-4 mb-4">
          <div className="group flex items-start gap-4 border rounded-md px-3 py-2">
            <Mail className="size-5 text-muted-foreground mt-1" />
            <div>
              <a href={`mailto:${email}`} className="text-lg hover:text-muted-foreground transition-colors break-all underline-offset-4 hover:underline">
                {email}
              </a>
            </div>
          </div>
          <div className="group flex items-start gap-4 border rounded-md px-3 py-2">
            <Headphones className="size-5 text-muted-foreground mt-1" />
            <div>
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-lg hover:text-muted-foreground transition-colors underline-offset-4 hover:underline">
                {phone}
              </a>
            </div>
          </div>
        </div>
          {/* Info Section */}
          <aside className="hidden md:block lg:sticky lg:top-32 space-y-16 bg-card p-8 rounded-lg">
            <div className="space-y-8">
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                {t("connect_title")}
              </h2>
              <div className="grid gap-8">
                <div className="group flex items-start gap-4">
                  <Mail className="size-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-xs uppercase tracking-tighter text-muted-foreground mb-1">{t("email_label")}</p>
                    <a href={`mailto:${email}`} className="text-lg hover:text-muted-foreground transition-colors break-all underline-offset-4 hover:underline">
                      {email}
                    </a>
                  </div>
                </div>
                <div className="group flex items-start gap-4">
                  <Headphones className="size-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-xs uppercase tracking-tighter text-muted-foreground mb-1">{t("hotline_label")}</p>
                    <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-lg hover:text-muted-foreground transition-colors underline-offset-4 hover:underline">
                      {phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                Social
              </h2> */}
              {/* <div className="flex flex-wrap gap-4">
                {socialLinks.map(({ slug, name, href }) => {
                  const style = getSocialStyle(slug)
                  const isExternal = href.startsWith("http")
                  return (
                    <Link
                      key={slug}
                      href={href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="inline-flex size-10 items-center justify-center rounded-full border border-border text-foreground hover:bg-foreground hover:text-background transition-all"
                      aria-label={typeof name === "string" ? name : slug}
                    >
                      {style.icon ?? <span className="text-xs font-medium">{slug.slice(0, 2)}</span>}
                    </Link>
                  )
                })}
              </div> */}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
