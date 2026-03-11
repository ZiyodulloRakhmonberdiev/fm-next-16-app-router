import { RegisterForm } from "@/features/auth/ui/register-form";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const t = useTranslations("auth");
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center text-center gap-1">
        <p className="font-bold text-lg">{t("register")}</p>
        <p className="text-sm text-foreground/50">Yangi foydalanuvchi sifatida ro&apos;yxatdan o&apos;ting.</p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-foreground/50">
        Hisobingiz bormi?{" "}
        <Link href="/auth/login" className="font-medium text-foreground hover:underline">
          {t("login")}
        </Link>
      </p>
    </div>
  );
}
  