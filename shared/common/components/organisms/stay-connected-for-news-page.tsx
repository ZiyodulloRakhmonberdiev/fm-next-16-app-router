import { useTranslations } from "next-intl";
import { SocialMediaButtons } from "../ui/social-media-buttons";

export default function StayConnectedForNewsPage() {
  const t = useTranslations("stayConnected")
  return (
    <section className="w-full border-b border-border px-4 py-3 mb-3">
      <h2 className="text-base font-semibold text-foreground pb-2">{t("title")}</h2>
      <SocialMediaButtons
        variant="icon-box"
        className="grid grid-cols-4 gap-1"
      />
    </section>
  )
}