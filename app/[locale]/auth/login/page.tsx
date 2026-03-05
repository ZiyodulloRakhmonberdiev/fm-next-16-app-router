import { LoginForm } from "@/features/auth/ui/login-form";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations("auth");
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center text-center gap-1">
          <p className="font-bold text-lg">{t("login_title")}</p>
          <p className="text-sm text-foreground/50">{t("login_subtitle")}</p>
      </div>
      <LoginForm />
      <div className="flex flex-col space-y-2">
        <p className="text-center text-sm text-foreground/50">
          {t("if_no_account")}{" "}
          <Link href="/auth/register" className="font-medium text-foreground hover:underline">
            {t("register")}
          </Link>
        </p>
        <p className="text-center text-sm text-foreground/50">
          {t("by_signing_in_you_agree_to_our")}{" "}
          <Link href="/terms" className="underline text-primary">
            {t("terms_of_service")}
          </Link>
        </p>
      </div>
    </div>
  );
}
