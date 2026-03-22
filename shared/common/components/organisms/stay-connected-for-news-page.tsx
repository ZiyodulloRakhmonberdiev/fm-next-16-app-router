import { useTranslations } from "next-intl";
import { SocialMediaButtons } from "../ui/social-media-buttons";

export default function StayConnectedForNewsPage() {
  const t = useTranslations("stayConnected")
  return (
    <section className="relative mb-4 w-full overflow-hidden rounded-xl border border-border/60 bg-linear-to-br from-muted/30 via-background to-background px-4 py-5 shadow-sm ring-1 ring-black/3 dark:ring-white/6">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-[#1877F2] via-[#E4405F] to-[#26A5E4]"
        aria-hidden
      />
      <div className="pt-0.5">
        <h2 className="text-base font-bold tracking-tight text-foreground">{t("title")}</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">{t("subtitle")}</p>
        <SocialMediaButtons
          variant="icon-box"
          className="mt-4 grid grid-cols-4 gap-2"
        />
      </div>
    </section>
  )
}