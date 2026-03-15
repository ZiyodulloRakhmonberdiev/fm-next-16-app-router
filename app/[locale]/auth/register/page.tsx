import { RegisterForm } from "@/features/auth/ui/register-form";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const t = useTranslations("auth");
  return (
    <div className="flex flex-col gap-4">
      <RegisterForm />
      <p className="text-center text-sm text-muted-foreground">
        Hisobingiz bormi?{" "}
        <Link href="/auth/login" className="font-medium text-primary underline hover:no-underline">
          {t("login")}
        </Link>
      </p>
    </div>
  );
}
