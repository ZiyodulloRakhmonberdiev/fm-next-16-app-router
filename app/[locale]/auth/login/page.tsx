import { LoginForm } from "@/features/auth/ui/login-form";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations("auth");
  return (
    <div className="flex flex-col gap-4">
      <LoginForm />
      {/* <p className="text-center text-sm text-muted-foreground">
        {t("if_no_account")}{" "}
        <Link href="/auth/register" className="font-medium text-primary underline hover:no-underline">
          {t("register")}
        </Link>
      </p> */}
      {/* <p className="text-center text-sm text-muted-foreground">
        {t("by_signing_in_you_agree_to_our")}{" "}
        <Link href="/terms" className="font-medium text-primary underline hover:no-underline">
          {t("terms_of_service")}
        </Link>
      </p> */}
    </div>
  );
}
