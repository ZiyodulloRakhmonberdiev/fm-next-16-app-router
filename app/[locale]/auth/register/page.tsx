import { RegisterForm } from "@/features/auth/ui/register-form";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const t = useTranslations("auth");
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="space-y-1">
        <p className="text-center text-sm text-foreground/50">
          {t("if_have_account")}{" "}
          <Link
            href="/auth/login"
            className="font-medium text-neutral-700 dark:text-neutral-200 hover:underline"
          >
            {t("login")}
          </Link>
        </p>
        </div>
      </div>
      <RegisterForm />
        <p className="text-center text-sm text-foreground/50">
          {t("by_signing_up_you_agree_to_our")}{" "}
          <Link href="/terms" className="underline text-primary">
            {t("terms_of_service")}
          </Link>
        </p>
    </div>
  );
}
  