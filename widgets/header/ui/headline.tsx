import { Link } from "@/i18n/navigation";
import { AlertOctagon, Facebook, Instagram, Send, Twitter } from "lucide-react";
import { seed } from "@/scripts/seed";
import { getSocialPlatformStyle } from "@/shared/config/social-platforms";
import { LanguageSwitcher } from "@/widgets/language-switcher";

export default function Headline() {
  const headline = seed.headline;
  return (
    <div className="w-full bg-foreground/10 py-1 hidden md:block">
      <div className="max-w-7xl mx-auto flex items-center px-2 justify-between">
        <p className="text-sm text-foreground font-normal flex items-center"> <AlertOctagon className="w-4 h-4" /> <span className="ml-2">{headline}</span></p>
        <div className="flex items-center gap-3">
          {seed.socialMedia.map((socialMedia) => {
            const Icon = getSocialPlatformStyle(socialMedia.name).Icon
            return (
              <Link key={socialMedia.href} href={socialMedia.href}>
                <Icon className="w-4 h-4" />
              </Link>
            )
          })}
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  )
}